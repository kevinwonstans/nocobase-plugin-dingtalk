/**
 * 钉钉登录 HTTP 回调 action
 *
 * - getAuthUrl：返回钉钉授权页 URL（前端登录按钮调用后跳转）
 * - redirectAuth：钉钉授权回调，兑换用户 token 后重定向回前端登录页
 */
import type { Context, Next } from '@nocobase/actions';
import { ResourceName } from '../../shared/constants';
import type { DingTalkAuth } from '../auth/DingTalkAuth';

/** 兼容代理场景，取真实外部请求地址 */
function getReqUrl(req: Context['request']) {
  const proto = req.get('X-Forwarded-Proto')?.split(',')[0] || req.protocol;
  const host = req.get('X-Forwarded-Host')?.split(',')[0] || req.host;
  return process.env.APP_URL || `${proto}://${host}${process.env.APP_PUBLIC_PATH || '/'}`;
}

export const dingTalkActions = {
  /** 获取钉钉扫码授权页 URL */
  getAuthUrl: async (ctx: Context, next: Next) => {
    // NocoBase action 参数解析：POST body 整体位于 params.values，GET query 位于 params 顶层
    // （客户端 SDK 调用会发送 { values: {...} }，解包后 body 顶层字段同样进入 params.values）
    const { authenticator: authenticatorName, redirect } = ctx.action.params.values || ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, 'authenticator name is required');
    }
    const app = ctx.app;
    const auth = (await app.authManager.get(authenticatorName, ctx)) as DingTalkAuth;
    const redirectUri = `${getReqUrl(ctx.request)}api/${ResourceName}:redirectAuth?authenticator=${encodeURIComponent(authenticatorName)}&redirect=${encodeURIComponent(redirect || '')}`;
    ctx.body = auth.dingTalkApi.getLoginUrl(redirectUri);
    await next();
  },

  /** 钉钉授权回调：用 code 换 token，重定向回前端 */
  redirectAuth: async (ctx: Context, next: Next) => {
    const { authenticator: authenticatorName, redirect, code, authCode, state } = ctx.action.params;
    if (!authenticatorName) {
      ctx.throw(400, 'authenticator name is required');
    }
    if (!code && !authCode) {
      ctx.throw(400, 'OAuth 2.0 authorization code is required');
    }
    const app = ctx.app;
    const auth = await app.authManager.get(authenticatorName, ctx);
    const { token } = await auth.signIn();
    let redirectPath = redirect;
    if (redirectPath) {
      if (redirectPath.startsWith('/')) {
        redirectPath = redirectPath.substring(1);
      }
    } else {
      redirectPath = '';
    }
    ctx.redirect(`${(process.env.APP_PUBLIC_PATH || '/') + redirectPath}?authenticator=${encodeURIComponent(authenticatorName)}&token=${encodeURIComponent(token)}`);
    await next();
  },
};
