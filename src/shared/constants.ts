/**
 * 插件共享常量（server / client v1 / client v2 共用）
 */

/** 插件包名（服务端插件名、i18n namespace） */
export const PluginName = 'nocobase-plugin-dingtalk';

/** authType：注册到 NocoBase 认证体系的认证方式标识 */
export const AuthName = 'dingtalk';

/** 自定义资源名：getAuthUrl / redirectAuth 两个 action 的挂载点 */
export const ResourceName = PluginName;

/** 用户匹配方式 */
export type UserCheckType = 'orgEmail' | 'personalEmail' | 'mobile';

/** 用户匹配方式选项（v1 / v2 客户端共用，label 为 i18n key） */
export const UserCheckTypeOptions: { value: UserCheckType; labelKey: string }[] = [
  { value: 'orgEmail', labelKey: 'Organization email' },
  { value: 'personalEmail', labelKey: 'Personal email' },
  { value: 'mobile', labelKey: 'Mobile' },
];

/** 认证器配置（authenticator.options）结构 */
export type DingTalkAuthOptions = {
  public?: {
    /** 用户不存在时自动注册 */
    autoSignup?: boolean;
  };
  internal?: {
    /** 用户匹配方式 */
    userCheckType?: UserCheckType;
    /** 允许的邮箱域名，多个用逗号分隔 */
    emailDomain?: string;
    /** 钉钉应用 AppKey */
    appKey?: string;
    /** 钉钉应用 AppSecret */
    appSecret?: string;
  };
};
