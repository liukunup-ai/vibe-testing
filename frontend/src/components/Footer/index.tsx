import { GithubOutlined } from '@ant-design/icons';
import { DefaultFooter } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import React from 'react';

const Footer: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const copyright = initialState?.siteSettings?.site?.copyright || '2026 Vibe Testing 版权所有';
  const showLinks = initialState?.siteSettings?.site?.showLinks !== false;

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
