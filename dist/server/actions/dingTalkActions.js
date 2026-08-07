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
var dingTalkActions_exports = {};
__export(dingTalkActions_exports, {
  dingTalkActions: () => dingTalkActions
});
module.exports = __toCommonJS(dingTalkActions_exports);
var import_constants = require("../../shared/constants");
function getReqUrl(req) {
  var _a, _b;
  const proto = ((_a = req.get("X-Forwarded-Proto")) == null ? void 0 : _a.split(",")[0]) || req.protocol;
  const host = ((_b = req.get("X-Forwarded-Host")) == null ? void 0 : _b.split(",")[0]) || req.host;
  return process.env.APP_URL || `${proto}://${host}${process.env.APP_PUBLIC_PATH || "/"}`;
}
const dingTalkActions = {
  /** 获取钉钉扫码授权页 URL */
  getAuthUrl: async (ctx, next) => {
    const { authenticator: authenticatorName, redirect } = ctx.action.params.values || ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, "authenticator name is required");
    }
    const app = ctx.app;
    const auth = await app.authManager.get(authenticatorName, ctx);
    const redirectUri = `${getReqUrl(ctx.request)}api/${import_constants.ResourceName}:redirectAuth?authenticator=${encodeURIComponent(authenticatorName)}&redirect=${encodeURIComponent(redirect || "")}`;
    ctx.body = auth.dingTalkApi.getLoginUrl(redirectUri);
    await next();
  },
  /** 钉钉授权回调：用 code 换 token，重定向回前端 */
  redirectAuth: async (ctx, next) => {
    const { authenticator: authenticatorName, redirect, code, authCode, state } = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, "authenticator name is required");
    }
    if (!code && !authCode) {
      ctx.throw(400, "OAuth 2.0 authorization code is required");
    }
    const app = ctx.app;
    const auth = await app.authManager.get(authenticatorName, ctx);
    const { token } = await auth.signIn();
    let redirectPath = redirect;
    if (redirectPath) {
      if (redirectPath.startsWith("/")) {
        redirectPath = redirectPath.substring(1);
      }
    } else {
      redirectPath = "";
    }
    ctx.redirect(`${(process.env.APP_PUBLIC_PATH || "/") + redirectPath}?authenticator=${encodeURIComponent(authenticatorName)}&token=${encodeURIComponent(token)}`);
    await next();
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  dingTalkActions
});
