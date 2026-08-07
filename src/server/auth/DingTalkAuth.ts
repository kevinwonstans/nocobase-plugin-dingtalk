/**
 * 钉钉认证类（扫码登录）
 *
 * 登录流程（OAuth2 授权码模式）：
 * 1. 前端跳转钉钉授权页，用户扫码同意后钉钉回调本插件 redirectAuth，携带 code
 * 2. validate() 用 code 换取用户 accessToken，再获取用户信息（unionId/mobile/email/nick）
 * 3. unionId 查询钉钉 userId，作为绑定唯一标识（usersAuthenticators.uuid）
 * 4. 已绑定用户直接登录；未绑定则按用户匹配方式（企业邮箱/个人邮箱/手机号）
 *    在 users 表中查找并绑定；仍找不到时按配置决定是否自动注册
 */
import { BaseAuth } from '@nocobase/auth';
import type { AuthConfig } from '@nocobase/auth';
import { DingTalkApi } from '../openapi/dingTalkApi';
import type { DingTalkAuthOptions, UserCheckType } from '../../shared/constants';

/** 解析后的认证配置（内部使用） */
export type DingTalkAuthConfigOptions = {
  public: {
    autoSignup: boolean;
  };
  internal: {
    userCheckType: UserCheckType;
    emailDomains: string[];
  };
};

export class DingTalkAuth extends BaseAuth {
  #authConfigOptions: DingTalkAuthConfigOptions;
  #dingTalkApi: DingTalkApi;

  constructor(config: AuthConfig) {
    const userCollection = config.ctx.db.getCollection('users');
    super({ ...config, userCollection });

    const options: DingTalkAuthOptions = config.options || {};
    const internal = options.internal || {};
    this.#authConfigOptions = {
      public: {
        autoSignup: !!options.public?.autoSignup,
      },
      internal: {
        userCheckType: internal.userCheckType || 'orgEmail',
        // 配置键统一为 emailDomain（逗号分隔字符串），解析为数组供校验使用
        emailDomains: (internal.emailDomain || '').split(/\s*,\s*/).filter(Boolean),
      },
    };
    this.#dingTalkApi = new DingTalkApi(internal.appKey, internal.appSecret);
  }

  get dingTalkApi() {
    return this.#dingTalkApi;
  }

  get authConfigOptions() {
    return this.#authConfigOptions;
  }

  async validate() {
    const ctx = this.ctx;
    const { authenticator: authenticatorName, code } = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, 'authenticator name is required');
    }
    if (!code) {
      ctx.throw(400, 'OAuth 2.0 authorization code is required');
    }

    // 1. 授权码换取用户 accessToken，获取用户信息
    const tokenRes = await this.dingTalkApi.oauth2.userAccessToken('authorization_code', code);
    const userRes = await this.dingTalkApi.contact.getUser('me', tokenRes.accessToken);

    // 2. unionId 查询钉钉 userId（绑定唯一标识）
    const { userid: userId } = await this.dingTalkApi.contact.getUserIdByUnionId(userRes.unionId);

    // 3. 已绑定则直接登录
    const authenticator = this.authenticator;
    const au = await authenticator.findUser(userId);
    if (au) {
      return au;
    }

    // 4. 获取用户详情（组织邮箱等）
    const userDetail = await this.dingTalkApi.contact.getUserDetail(userId);
    const user = {
      userId,
      unionId: userRes.unionId,
      mobile: userRes.mobile,
      email: userRes.email,
      name: userDetail.name || userRes.nick,
      orgEmail: userDetail.org_email,
    };

    // 5. 按用户匹配方式构造 users 表查询条件
    const { userCheckType, emailDomains } = this.#authConfigOptions.internal;
    let filter: { email?: string; phone?: string };
    if (userCheckType === 'personalEmail') {
      if (!user.email) {
        ctx.throw(400, 'the user has no bound email');
      }
      if (!emailDomains.some((d) => user.email!.endsWith(d))) {
        ctx.throw(400, `email domain is not in the allowed list: ${user.email}`);
      }
      filter = { email: user.email };
    } else if (userCheckType === 'orgEmail') {
      if (!user.orgEmail) {
        ctx.throw(400, 'the user has no bound organization email');
      }
      if (!emailDomains.some((d) => user.orgEmail!.endsWith(d))) {
        ctx.throw(400, `email domain is not in the allowed list: ${user.orgEmail}`);
      }
      filter = { email: user.orgEmail };
    } else {
      filter = { phone: user.mobile };
    }

    // 6. 命中 users 表则绑定钉钉 userId 并登录
    const ncUser = await this.userRepository.findOne({ filter });
    if (ncUser) {
      await this.authenticator.addUser(ncUser, {
        through: {
          uuid: userId,
        },
      });
      return authenticator.findUser(userId);
    }

    // 7. 未命中且开启自动注册：创建新用户并绑定
    if (this.#authConfigOptions.public.autoSignup) {
      const values: Record<string, any> = {
        nickname: user.name,
        username: filter.email?.split('@')[0] || user.mobile || userId,
        phone: user.mobile,
        meta: JSON.stringify(user),
      };
      if (filter.email) {
        values.email = filter.email;
      }
      return authenticator.findOrCreateUser(userId, values);
    }

    return null;
  }
}
