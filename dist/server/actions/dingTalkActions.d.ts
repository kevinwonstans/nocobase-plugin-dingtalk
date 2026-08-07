/**
 * 钉钉登录 HTTP 回调 action
 *
 * - getAuthUrl：返回钉钉授权页 URL（前端登录按钮调用后跳转）
 * - redirectAuth：钉钉授权回调，兑换用户 token 后重定向回前端登录页
 */
import type { Context, Next } from '@nocobase/actions';
export declare const dingTalkActions: {
    /** 获取钉钉扫码授权页 URL */
    getAuthUrl: (ctx: Context, next: Next) => Promise<void>;
    /** 钉钉授权回调：用 code 换 token，重定向回前端 */
    redirectAuth: (ctx: Context, next: Next) => Promise<void>;
};
