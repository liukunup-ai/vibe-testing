import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const copyright = initialState?.siteConfig?.site?.copyright || '2026 Company Name. All rights reserved.';
  const showLinks = initialState?.siteConfig?.site?.showLinks !== false;

  const links = showLinks ? [
    {
      key: 'Ant Design Pro',
      title: 'Ant Design Pro',
      href: 'https://pro.ant.design',
      blankTarget: true,
    },
    {
      key: 'github',
      title: <GithubOutlined />,
      href: 'https://github.com/ant-design/ant-design-pro',
      blankTarget: true,
    },
    {
      key: 'Ant Design',
      title: 'Ant Design',
      href: 'https://ant.design',
      blankTarget: true,
    },
  ] : undefined;

  return (
    <DefaultFooter
      style={{
        background: 'none',
      }}
      copyright={copyright}
      links={links}
    />
  );
};

export default Footer;
