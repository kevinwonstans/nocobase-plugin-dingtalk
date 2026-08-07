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
var DingTalkAuth_exports = {};
__export(DingTalkAuth_exports, {
  DingTalkAuth: () => DingTalkAuth
});
module.exports = __toCommonJS(DingTalkAuth_exports);
var import_auth = require("@nocobase/auth");
var import_dingTalkApi = require("../openapi/dingTalkApi");
class DingTalkAuth extends import_auth.BaseAuth {
  #authConfigOptions;
  #dingTalkApi;
  constructor(config) {
    var _a;
    const userCollection = config.ctx.db.getCollection("users");
    super({ ...config, userCollection });
    const options = config.options || {};
    const internal = options.internal || {};
    this.#authConfigOptions = {
      public: {
        autoSignup: !!((_a = options.public) == null ? void 0 : _a.autoSignup)
      },
      internal: {
        userCheckType: internal.userCheckType || "orgEmail",
        // 配置键统一为 emailDomain（逗号分隔字符串），解析为数组供校验使用
        emailDomains: (internal.emailDomain || "").split(/\s*,\s*/).filter(Boolean)
      }
    };
    this.#dingTalkApi = new import_dingTalkApi.DingTalkApi(internal.appKey, internal.appSecret);
  }
  get dingTalkApi() {
    return this.#dingTalkApi;
  }
  get authConfigOptions() {
    return this.#authConfigOptions;
  }
  async validate() {
    var _a;
    const ctx = this.ctx;
    const { authenticator: authenticatorName, code } = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, "authenticator name is required");
    }
    if (!code) {
      ctx.throw(400, "OAuth 2.0 authorization code is required");
    }
    const tokenRes = await this.dingTalkApi.oauth2.userAccessToken("authorization_code", code);
    const userRes = await this.dingTalkApi.contact.getUser("me", tokenRes.accessToken);
    const { userid: userId } = await this.dingTalkApi.contact.getUserIdByUnionId(userRes.unionId);
    const authenticator = this.authenticator;
    const au = await authenticator.findUser(userId);
    if (au) {
      return au;
    }
    const userDetail = await this.dingTalkApi.contact.getUserDetail(userId);
    const user = {
      userId,
      unionId: userRes.unionId,
      mobile: userRes.mobile,
      email: userRes.email,
      name: userDetail.name || userRes.nick,
      orgEmail: userDetail.org_email
    };
    const { userCheckType, emailDomains } = this.#authConfigOptions.internal;
    let filter;
    if (userCheckType === "personalEmail") {
      if (!user.email) {
        ctx.throw(400, "the user has no bound email");
      }
      if (!emailDomains.some((d) => user.email.endsWith(d))) {
        ctx.throw(400, `email domain is not in the allowed list: ${user.email}`);
      }
      filter = { email: user.email };
    } else if (userCheckType === "orgEmail") {
      if (!user.orgEmail) {
        ctx.throw(400, "the user has no bound organization email");
      }
      if (!emailDomains.some((d) => user.orgEmail.endsWith(d))) {
        ctx.throw(400, `email domain is not in the allowed list: ${user.orgEmail}`);
      }
      filter = { email: user.orgEmail };
    } else {
      filter = { phone: user.mobile };
    }
    const ncUser = await this.userRepository.findOne({ filter });
    if (ncUser) {
      await this.authenticator.addUser(ncUser, {
        through: {
          uuid: userId
        }
      });
      return authenticator.findUser(userId);
    }
    if (this.#authConfigOptions.public.autoSignup) {
      const values = {
        nickname: user.name,
        username: ((_a = filter.email) == null ? void 0 : _a.split("@")[0]) || user.mobile || userId,
        phone: user.mobile,
        meta: JSON.stringify(user)
      };
      if (filter.email) {
        values.email = filter.email;
      }
      return authenticator.findOrCreateUser(userId, values);
    }
    return null;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DingTalkAuth
});
