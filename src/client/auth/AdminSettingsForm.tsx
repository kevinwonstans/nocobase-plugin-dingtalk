/**
 * v1 认证管理中的钉钉配置表单
 *
 * 通过 SchemaComponent 渲染，字段路径与 authenticator.options 对应：
 * options.public.autoSignup / options.internal.*
 */
import { SchemaComponent } from '@nocobase/client';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginName, UserCheckTypeOptions } from '../../shared/constants';

export const AdminSettingsForm = () => {
  const { t } = useTranslation(['nocobase-plugin-dingtalk', 'client']);
  const schema = {
    type: 'object',
    properties: {
      dingtalkAuth: {
        type: 'void',
        properties: {
          public: {
            type: 'object',
            properties: {
              autoSignup: {
                'x-decorator': 'FormItem',
                type: 'boolean',
                title: t('Auto register if user not found'),
                'x-component': 'Checkbox',
              },
            },
          },
          internal: {
            type: 'object',
            properties: {
              userCheckType: {
                'x-decorator': 'FormItem',
                type: 'string',
                title: t('User match type'),
                required: true,
                'x-component': 'Select',
                'x-component-props': {
                  options: UserCheckTypeOptions.map((o) => ({ value: o.value, label: t(o.labelKey) })),
                },
              },
              emailDomain: {
                'x-decorator': 'FormItem',
                type: 'string',
                title: t('Email domains, separated by commas'),
                required: true,
                'x-component': 'Input',
              },
              appKey: {
                'x-decorator': 'FormItem',
                type: 'string',
                title: t('AppKey'),
                required: true,
                'x-component': 'Input',
              },
              appSecret: {
                'x-decorator': 'FormItem',
                type: 'string',
                title: t('AppSecret'),
                required: true,
                'x-component': 'Password',
              },
            },
          },
        },
      },
    },
  };
  return <SchemaComponent schema={schema} />;
};
