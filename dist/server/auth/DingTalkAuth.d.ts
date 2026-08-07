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
import type { UserCheckType } from '../../shared/constants';
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
export declare class DingTalkAuth extends BaseAuth {
    #private;
    constructor(config: AuthConfig);
    get dingTalkApi(): DingTalkApi;
    get authConfigOptions(): DingTalkAuthConfigOptions;
    validate(): Promise<any>;
}
