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
export declare function checkResult<T>(res: DingTalkApiRes<T>): T;
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
export declare class DingTalkApi {
    #private;
    constructor(appKey?: string, appSecret?: string);
    /** OAuth2 用户授权相关（新版 v1.0） */
    get oauth2(): {
        /**
         * 授权码换取用户 accessToken
         * @param grantType 授权码模式传 authorization_code，刷新用户 token 传 refresh_token
         * @param code OAuth2.0 授权码
         * @param refreshToken OAuth2.0 刷新令牌（grantType 为 refresh_token 时必传）
         */
        userAccessToken: (grantType: string, code?: string, refreshToken?: string) => Promise<UserAccessTokenRes>;
    };
    /** 通讯录相关（新版 v1.0 + 旧版 topapi 混用） */
    get contact(): {
        /**
         * 获取用户信息（新版 v1.0）
         * @param unionId 用户的 unionId；获取本企业当前授权用户可填 "me"
         */
        getUser: (unionId: string, accessToken: string) => Promise<UserRes>;
        /**
         * 根据手机号查询 userId（旧版 topapi/v2）
         */
        getUserIdByMobile: (mobile: string) => Promise<UserIdRes>;
        /**
         * 根据 unionId 查询 userId（旧版 topapi/v1）
         */
        getUserIdByUnionId: (unionid: string) => Promise<UserIdRes>;
        /**
         * 查询用户详情（旧版 topapi/v2）
         * 注意：第三方企业应用接口不返回 org_email
         */
        getUserDetail: (userid: string) => Promise<UserDetail>;
    };
    /** 生成钉钉扫码授权页 URL */
    getLoginUrl(redirectUri: string): string;
    /** 应用 access_token（缓存，过期前 100 秒自动刷新） */
    getAccessToken(): Promise<string>;
    doRequest(method: string, path: string, params?: Record<string, any>, body?: Record<string, any> | null, headers?: Record<string, string>): Promise<any>;
}
