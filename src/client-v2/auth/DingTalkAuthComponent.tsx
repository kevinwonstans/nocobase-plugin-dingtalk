/**
 * v2 登录页「钉钉」按钮组件
 *
 * 与 v1 行为一致：请求 getAuthUrl 拿到钉钉授权页 URL 并跳转，
 * 授权回调（redirectAuth）成功后会带 token 重定向回登录页。
 */
import { DingtalkOutlined } from '@ant-design/icons';
import { useApp } from '@nocobase/client-v2';
import type { Authenticator } from '@nocobase/plugin-auth/client-v2';
import { Button } from 'antd';
import React, { useState } from 'react';
import { ResourceName } from '../../shared/constants';

export const DingTalkAuthComponent = ({ authenticator }: { authenticator: Authenticator }) => {
  const [loading, setLoading] = useState(false);
  const app = useApp();

  return (
    <Button
      loading={loading}
      disabled={loading}
      icon={<DingtalkOutlined />}
      style={{ width: '100%' }}
      onClick={async () => {
        setLoading(true);
        try {
          const res = await app.apiClient.resource(ResourceName).getAuthUrl({
            values: {
              authenticator: authenticator.name,
              redirect: new URLSearchParams(location.search.substring(1)).get('redirect') || '',
            },
          });
          location.href = res.data.data;
        } finally {
          setTimeout(() => setLoading(false), 1000);
        }
      }}
    >
      {authenticator.title || authenticator.name}
    </Button>
  );
};

export default DingTalkAuthComponent;
