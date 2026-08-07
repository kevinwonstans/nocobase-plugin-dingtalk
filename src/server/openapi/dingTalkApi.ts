/**
 * 钉钉 OpenAPI 封装
 *
 * 同时兼容两代钉钉接口：
 * - 新版 OpenAPI v1.0（https://api.dingtalk.com/v1.0/...，凭据走 header，无 access_token 参数）
 * - 旧版 topapi（https://oapi.dingtalk.com/topapi/...，需要 access_token 查询参数）
 */

/** 钉钉统一响应结构 */
export type DingTalkApiRes<T> = {
  request_id?: string;
  errcode: number;
  errmsg: string;
  result?: T;
};

/** 校验钉钉响应，errcode !== 0 时抛错，否则返回 result */
export function checkResult<T>(res: DingTalkApiRes<T>): T {
  if (res.errcode !== 0) {
    throw new Error(JSON.stringify(res));
  }
  return res.result as T;
}

/** 用户 token（新版 oauth2/userAccessToken） */
export type UserAccessTokenRes = {
  accessToken: string;
  refreshToken: string;
  expireIn: number;
  corpId?: string;
};

/** 用户基础信息（新版 contact/users/me） */
export type UserRes = {
  nick: string;
  avatarUrl?: string;
  mobile: string;
  openId: string;
  unionId: string;
  email?: string;
  stateCode: string;
};

/** 用户详情（旧版 topapi/v2/user/get） */
export type UserDetail = {
  userid?: string;
  name?: string;
  email?: string;
  org_email?: string;
  mobile?: string;
  [key: string]: any;
};

/** unionId 查 userId 的结果 */
export type UserIdRes = {
  contact_type?: number;
  userid: string;
};

function toQueryString(params?: Record<string, any>): string {
  if (!params) {
    return '';
  }
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&');
}

export class DingTalkApi {
  #appKey: string;
  #appSecret: string;
  #accessToken?: string;
  #nextGetAccessTokenTime = 0;

  constructor(appKey?: string, appSecret?: string) {
    this.#appKey = appKey || '';
    this.#appSecret = appSecret || '';
  }

  /** OAuth2 用户授权相关（新版 v1.0） */
  get oauth2() {
    return {
      /**
       * 授权码换取用户 accessToken
       * @param grantType 授权码模式传 authorization_code，刷新用户 token 传 refresh_token
       * @param code OAuth2.0 授权码
       * @param refreshToken OAuth2.0 刷新令牌（grantType 为 refresh_token 时必传）
       */
      userAccessToken: async (
        grantType: string,
        code?: string,
        refreshToken?: string,
      ): Promise<UserAccessTokenRes> =>
        this.doRequest('POST', `${BASE_URL}/v1.0/oauth2/userAccessToken`, null, {
          clientId: this.#appKey,
          clientSecret: this.#appSecret,
          code,
          refreshToken,
          grantType,
        }),
    };
  }

  /** 通讯录相关（新版 v1.0 + 旧版 topapi 混用） */
  get contact() {
    return {
      /**
       * 获取用户信息（新版 v1.0）
       * @param unionId 用户的 unionId；获取本企业当前授权用户可填 "me"
       */
      getUser: async (unionId: string, accessToken: string): Promise<UserRes> =>
        this.doRequest('GET', `${BASE_URL}/v1.0/contact/users/${unionId}`, undefined, undefined, {
          'x-acs-dingtalk-access-token': accessToken,
        }),
      /**
       * 根据手机号查询 userId（旧版 topapi/v2）
       */
      getUserIdByMobile: async (mobile: string): Promise<UserIdRes> =>
        checkResult(
          await this.doRequest('POST', `${OAPI_URL}/topapi/v2/user/getbymobile`, {
            access_token: await this.getAccessToken(),
          }, {
            mobile,
          }),
        ),
      /**
       * 根据 unionId 查询 userId（旧版 topapi/v1）
       */
      getUserIdByUnionId: async (unionid: string): Promise<UserIdRes> =>
        checkResult(
          await this.doRequest('POST', `${OAPI_URL}/topapi/user/getbyunionid`, {
            access_token: await this.getAccessToken(),
          }, {
            unionid,
          }),
        ),
      /**
       * 查询用户详情（旧版 topapi/v2）
       * 注意：第三方企业应用接口不返回 org_email
       */
      getUserDetail: async (userid: string): Promise<UserDetail> =>
        checkResult(
          await this.doRequest('POST', `${OAPI_URL}/topapi/v2/user/get`, {
            access_token: await this.getAccessToken(),
          }, {
            userid,
          }),
        ),
    };
  }

  /** 生成钉钉扫码授权页 URL */
  getLoginUrl(redirectUri: string) {
    return `https://login.dingtalk.com/oauth2/auth?redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&client_id=${this.#appKey}&scope=openid&state=${new Date().getTime()}&prompt=consent`;
  }

  /** 应用 access_token（缓存，过期前 100 秒自动刷新） */
  async getAccessToken() {
    if (!this.#accessToken || this.#nextGetAccessTokenTime < new Date().getTime()) {
      const data = await this.doRequest('POST', `${BASE_URL}/v1.0/oauth2/accessToken`, null, {
        appKey: this.#appKey,
        appSecret: this.#appSecret,
      });
      this.#nextGetAccessTokenTime = new Date().getTime() + data.expireIn * 1000 - 100000;
      this.#accessToken = data.accessToken;
    }
    return this.#accessToken;
  }

  async doRequest(
    method: string,
    path: string,
    params?: Record<string, any>,
    body?: Record<string, any> | null,
    headers?: Record<string, string>,
  ) {
    const url = `${path}${params ? '?' + toQueryString(params) : ''}`;
    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(headers || {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const req = { method, url, headers, params, body };
    if (res.status < 200 || res.status >= 300) {
      const text = await res.text();
      console.error('fetch dingtalk api error: ', req, text);
      throw new Error(text);
    }
    return await res.json();
  }
}

const BASE_URL = 'https://api.dingtalk.com';
const OAPI_URL = 'https://oapi.dingtalk.com';
