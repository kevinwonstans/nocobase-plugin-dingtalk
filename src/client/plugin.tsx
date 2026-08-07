/**
 * v1 客户端（/admin/ 界面）钉钉登录插件
 *
 * 通过 plugin-auth 的 registerType 注册：
 * - SignInButton：v1 登录页的「钉钉」按钮
 * - AdminSettingsForm：认证管理中的钉钉配置表单
 */
import { Plugin } from '@nocobase/client';
import PluginAuthClient from '@nocobase/plugin-auth/client';
import { AuthName } from '../shared/constants';
import { AdminSettingsForm } from './auth/AdminSettingsForm';
import { DingTalkAuthComponent } from './auth/DingTalkAuthComponent';

export class NocobasePluginDingtalkClient extends Plugin {
  async load() {
    const authPlugin = this.app.pm.get(PluginAuthClient);
    authPlugin.registerType(AuthName, {
      components: {
        SignInButton: DingTalkAuthComponent,
        AdminSettingsForm,
      },
    });
  }
}

export default NocobasePluginDingtalkClient;
