/**
 * v2 认证管理中的钉钉配置表单
 *
 * 渲染在认证管理「认证器」抽屉中，无 props；
 * 通过 antd Form.Item 注册字段，name 与 authenticator.options 对应：
 * options.public.autoSignup / options.internal.*（初始值由页面注入）
 */
import { Checkbox, Form, Input, Select } from 'antd';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { PluginName, UserCheckTypeOptions } from '../../shared/constants';

export const AdminSettingsForm = () => {
  const { t } = useTranslation(['nocobase-plugin-dingtalk', 'client']);

  return (
    <>
      <Form.Item name={['options', 'public', 'autoSignup']} valuePropName="checked">
        <Checkbox>{t('Auto register if user not found')}</Checkbox>
      </Form.Item>
      <Form.Item
        name={['options', 'internal', 'userCheckType']}
        label={t('User match type')}
        rules={[{ required: true }]}
      >
        <Select
          options={UserCheckTypeOptions.map((o) => ({ value: o.value, label: t(o.labelKey) }))}
        />
      </Form.Item>
      <Form.Item
        name={['options', 'internal', 'emailDomain']}
        label={t('Email domains, separated by commas')}
        rules={[{ required: true }]}
      >
        <Input placeholder="example.com, corp.example.com" />
      </Form.Item>
      <Form.Item name={['options', 'internal', 'appKey']} label={t('AppKey')} rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name={['options', 'internal', 'appSecret']} label={t('AppSecret')} rules={[{ required: true }]}>
        <Input.Password />
      </Form.Item>
    </>
  );
};

export default AdminSettingsForm;
