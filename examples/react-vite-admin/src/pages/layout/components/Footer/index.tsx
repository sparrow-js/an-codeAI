import React from 'react';
import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-layout';

export default () => (
  <DefaultFooter
    copyright="2021 柚程云出品"
    links={[
      {
        key: '柚程云',
        title: '柚程云',
        blankTarget: true,
        href: '',
      },
      {
        key: 'github',
        title: <GithubOutlined />,
        href: 'https://github.com/ychengcloud/react-antd-vite-admin',
        blankTarget: true,
      },
      {
        key: '柚程云管理平台',
        title: '柚程云管理平台',
        blankTarget: true,
        href: '',
      },
    ]}
  />
);
