/**
 * v1 客户端（/admin/ 界面）钉钉登录插件
 *
 * 通过 plugin-auth 的 registerType 注册：
 * - SignInButton：v1 登录页的「钉钉」按钮
 * - AdminSettingsForm：认证管理中的钉钉配置表单
 */
import { Plugin } from '@nocobase/client';
export declare class NocobasePluginDingtalkClient extends Plugin {
    load(): Promise<void>;
}
export default NocobasePluginDingtalkClient;
