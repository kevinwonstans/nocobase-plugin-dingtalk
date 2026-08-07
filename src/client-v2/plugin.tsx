/**
 * v2 客户端（/v/admin/ 界面）钉钉登录插件
 *
 * 通过 plugin-auth 的 client-v2 registerType 懒加载注册：
 * - signInButtonLoader：v2 登录页的「钉钉」按钮
 * - adminSettingsFormLoader：认证管理中的钉钉配置表单
 */
import { Plugin } from '@nocobase/client-v2';
import PluginAuthClientV2 from '@nocobase/plugin-auth/client-v2';
import { AuthName } from '../shared/constants';

export class NocobasePluginDingtalkClientV2 extends Plugin {
  async load() {
    const authPlugin = this.app.pm.get(PluginAuthClientV2);
    authPlugin.registerType(AuthName, {
      signInButtonLoader: () => import('./auth/DingTalkAuthComponent'),
      adminSettingsFormLoader: () => import('./auth/AdminSettingsForm'),
    });
  }
}

export default NocobasePluginDingtalkClientV2;
