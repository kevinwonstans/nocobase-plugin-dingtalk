/**
 * 钉钉登录插件（服务端）
 *
 * - 通过 authManager.registerTypes 注册钉钉认证方式（authType: dingtalk）
 * - 通过 resourceManager 暴露 getAuthUrl / redirectAuth 两个免登录 action
 * - 认证器配置存储于 NocoBase 内置 authenticators 表的 options 字段，
 *   由管理员在「认证管理」中手动添加并填写（无需自定义数据表）
 */
import { Plugin } from '@nocobase/server';
import { tval } from '@nocobase/utils';
import { AuthName, PluginName, ResourceName } from '../shared/constants';
import { DingTalkAuth } from './auth/DingTalkAuth';
import { dingTalkActions } from './actions/dingTalkActions';

export class NocobasePluginDingtalkServer extends Plugin {
  async load() {
    // 注册钉钉认证方式（认证管理列表中展示为「钉钉登录(扫码)」）
    this.app.authManager.registerTypes(AuthName, {
      title: tval('DingTalk login (scan)', { ns: PluginName }),
      auth: DingTalkAuth,
    });

    // 钉钉授权回调资源（getAuthUrl / redirectAuth）
    this.app.resourceManager.define({
      name: ResourceName,
      actions: dingTalkActions,
    });

    // 认证回调为免登录接口
    this.app.acl.allow(ResourceName, '*');
  }
}

export default NocobasePluginDingtalkServer;
