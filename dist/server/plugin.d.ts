/**
 * 钉钉登录插件（服务端）
 *
 * - 通过 authManager.registerTypes 注册钉钉认证方式（authType: dingtalk）
 * - 通过 resourceManager 暴露 getAuthUrl / redirectAuth 两个免登录 action
 * - 认证器配置存储于 NocoBase 内置 authenticators 表的 options 字段，
 *   由管理员在「认证管理」中手动添加并填写（无需自定义数据表）
 */
import { Plugin } from '@nocobase/server';
export declare class NocobasePluginDingtalkServer extends Plugin {
    load(): Promise<void>;
}
export default NocobasePluginDingtalkServer;
