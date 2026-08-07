/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var dingTalkApi_exports = {};
__export(dingTalkApi_exports, {
  DingTalkApi: () => DingTalkApi,
  checkResult: () => checkResult
});
module.exports = __toCommonJS(dingTalkApi_exports);
function checkResult(res) {
  if (res.errcode !== 0) {
    throw new Error(JSON.stringify(res));
  }
  return res.result;
}
function toQueryString(params) {
  if (!params) {
    return "";
  }
  return Object.keys(params).filter((k) => params[k] !== void 0 && params[k] !== null).map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join("&");
}
class DingTalkApi {
  #appKey;
  #appSecret;
  #accessToken;
  #nextGetAccessTokenTime = 0;
  constructor(appKey, appSecret) {
    this.#appKey = appKey || "";
    this.#appSecret = appSecret || "";
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
      userAccessToken: async (grantType, code, refreshToken) => this.doRequest("POST", `${BASE_URL}/v1.0/oauth2/userAccessToken`, null, {
        clientId: this.#appKey,
        clientSecret: this.#appSecret,
        code,
        refreshToken,
        grantType
      })
    };
  }
  /** 通讯录相关（新版 v1.0 + 旧版 topapi 混用） */
  get contact() {
    return {
      /**
       * 获取用户信息（新版 v1.0）
       * @param unionId 用户的 unionId；获取本企业当前授权用户可填 "me"
       */
      getUser: async (unionId, accessToken) => this.doRequest("GET", `${BASE_URL}/v1.0/contact/users/${unionId}`, void 0, void 0, {
        "x-acs-dingtalk-access-token": accessToken
      }),
      /**
       * 根据手机号查询 userId（旧版 topapi/v2）
       */
      getUserIdByMobile: async (mobile) => checkResult(
        await this.doRequest("POST", `${OAPI_URL}/topapi/v2/user/getbymobile`, {
          access_token: await this.getAccessToken()
        }, {
          mobile
        })
      ),
      /**
       * 根据 unionId 查询 userId（旧版 topapi/v1）
       */
      getUserIdByUnionId: async (unionid) => checkResult(
        await this.doRequest("POST", `${OAPI_URL}/topapi/user/getbyunionid`, {
          access_token: await this.getAccessToken()
        }, {
          unionid
        })
      ),
      /**
       * 查询用户详情（旧版 topapi/v2）
       * 注意：第三方企业应用接口不返回 org_email
       */
      getUserDetail: async (userid) => checkResult(
        await this.doRequest("POST", `${OAPI_URL}/topapi/v2/user/get`, {
          access_token: await this.getAccessToken()
        }, {
          userid
        })
      )
    };
  }
  /** 生成钉钉扫码授权页 URL */
  getLoginUrl(redirectUri) {
    return `https://login.dingtalk.com/oauth2/auth?redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&client_id=${this.#appKey}&scope=openid&state=${(/* @__PURE__ */ new Date()).getTime()}&prompt=consent`;
  }
  /** 应用 access_token（缓存，过期前 100 秒自动刷新） */
  async getAccessToken() {
    if (!this.#accessToken || this.#nextGetAccessTokenTime < (/* @__PURE__ */ new Date()).getTime()) {
      const data = await this.doRequest("POST", `${BASE_URL}/v1.0/oauth2/accessToken`, null, {
        appKey: this.#appKey,
        appSecret: this.#appSecret
      });
      this.#nextGetAccessTokenTime = (/* @__PURE__ */ new Date()).getTime() + data.expireIn * 1e3 - 1e5;
      this.#accessToken = data.accessToken;
    }
    return this.#accessToken;
  }
  async doRequest(method, path, params, body, headers) {
    const url = `${path}${params ? "?" + toQueryString(params) : ""}`;
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers || {}
      },
      body: body ? JSON.stringify(body) : void 0
    });
    const req = { method, url, headers, params, body };
    if (res.status < 200 || res.status >= 300) {
      const text = await res.text();
      console.error("fetch dingtalk api error: ", req, text);
      throw new Error(text);
    }
    return await res.json();
  }
}
const BASE_URL = "https://api.dingtalk.com";
const OAPI_URL = "https://oapi.dingtalk.com";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DingTalkApi,
  checkResult
});
