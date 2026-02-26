import {
  QuestionCircleOutlined,
  GlobalOutlined,
  MoonOutlined,
  SmileOutlined,
  SunOutlined,
  SyncOutlined,
  CompressOutlined,
} from '@ant-design/icons';
import { SelectLang as UmiSelectLang, useModel } from '@umijs/max';
import { Dropdown, Tooltip } from 'antd';
import type { MenuProps } from 'antd';
import React, { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';
import { TIMEZONE_OPTIONS } from '@/constants/options';
import { updateProfile } from '@/services/backend/user';

const TIMEZONE_STORAGE_KEY = 'app-timezone';

const DirectionIcon: React.FC<{ direction: 'ltr' | 'rtl' }> = ({ direction }) => (
  <svg 
    viewBox="2 2 16 16" 
    width="1em" 
    height="1em" 
    fill="currentColor" 
    aria-hidden="true" 
    focusable="false"
    style={{ transform: direction === 'rtl' ? 'scaleX(-1)' : 'scaleX(1)' }}
  >
    <path d="m14.6961816 11.6470802.0841184.0726198 2 2c.2662727.2662727.2904793.682876.0726198.9764816l-.0726198.0841184-2 2c-.2929.2929-.7677.2929-1.0606 0-.2662727-.2662727-.2904793-.682876-.0726198-.9764816l.0726198-.0841184.7196-.7197h-10.6893c-.41421 0-.75-.3358-.75-.75 0-.3796833.28215688-.6934889.64823019-.7431531l.10176981-.0068469h10.6893l-.7196-.7197c-.2929-.2929-.2929-.7677 0-1.0606.2662727-.2662727.682876-.2904793.9764816-.0726198zm-8.1961616-8.6470802c.30667 0 .58246.18671.69635.47146l3.00003 7.50004c.1538.3845-.0333.821-.41784.9749-.38459.1538-.82107-.0333-.9749-.4179l-.81142-2.0285h-2.98445l-.81142 2.0285c-.15383.3846-.59031.5717-.9749.4179-.38458-.1539-.57165-.5904-.41781-.9749l3-7.50004c.1139-.28475.38968-.47146.69636-.47146zm8.1961616 1.14705264.0841184.07261736 2 2c.2662727.26626364.2904793.68293223.0726198.97654222l-.0726198.08411778-2 2c-.2929.29289-.7677.29289-1.0606 0-.2662727-.26626364-.2904793-.68293223-.0726198-.97654222l.0726198-.08411778.7196-.7196675h-3.6893c-.4142 0-.75-.3357925-.75-.7500025 0-.3796925.2821653-.69348832.6482323-.74315087l.1017677-.00684663h3.6893l-.7196-.7196725c-.2929-.29289-.2929-.76777 0-1.06066.2662727-.26626364.682876-.29046942.9764816-.07261736zm-8.1961616 1.62238736-.89223 2.23056h1.78445z" />
  </svg>
);

const ThemeIcon: React.FC = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <g fillRule="evenodd">
      <g fillRule="nonzero">
        <path d="M7.02 3.635l12.518 12.518a1.863 1.863 0 010 2.635l-1.317 1.318a1.863 1.863 0 01-2.635 0L3.068 7.588A2.795 2.795 0 117.02 3.635zm2.09 14.428a.932.932 0 110 1.864.932.932 0 010-1.864zm-.043-9.747L7.75 9.635l9.154 9.153 1.318-1.317-9.154-9.155zM3.52 12.473c.514 0 .931.417.931.931v.932h.932a.932.932 0 110 1.864h-.932v.931a.932.932 0 01-1.863 0l-.001-.931h-.93a.932.932 0 010-1.864h.93v-.932c0-.514.418-.931.933-.931zm15.374-3.727a1.398 1.398 0 110 2.795 1.398 1.398 0 010-2.795zM4.385 4.953a.932.932 0 000 1.317l2.046 2.047L7.75 7 5.703 4.953a.932.932 0 00-1.318 0zM14.701.36a.932.932 0 01.931.932v.931h.932a.932.932 0 010 1.864h-.933l.001.932a.932.932 0 11-1.863 0l-.001-.932h-.93a.932.932 0 110-1.864h.93v-.931a.932.932 0 01.933-.932z" />
      </g>
    </g>
  </svg>
);

const getBrowserTimezone = () => {
  if (typeof window !== 'undefined' && Intl?.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'Asia/Shanghai';
};

export const SelectLang = () => {
  return (
    <UmiSelectLang
      style={{
        padding: 4,
      }}
    />
  );
};

export const Question = () => {
  const { initialState } = useModel('@@initialState');
  const questionLink = (initialState as any)?.siteSettings?.site?.questionLink || 'https://pro.ant.design/docs/getting-started';

  if (!questionLink) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        height: 26,
        cursor: 'pointer',
      }}
      onClick={() => {
        window.open(questionLink);
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};

export const SelectDirection = () => {
  const { initialState } = useModel('@@initialState');
  const isLoggedIn = !!(initialState as any)?.currentUser;
  const [direction, setDirection] = useState<'ltr' | 'rtl'>(() => {
    if (typeof window === 'undefined') return 'ltr';
    const userDirection = (initialState as any)?.currentUser?.direction;
    if (userDirection) return userDirection as 'ltr' | 'rtl';
    return (localStorage.getItem('app-direction') as 'ltr' | 'rtl') || 'ltr';
  });

  const toggleDirection = async () => {
    const newDirection = direction === 'ltr' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    localStorage.setItem('app-direction', newDirection);
    document.documentElement.dir = newDirection;
    
    if (isLoggedIn) {
      try {
        await updateProfile({ direction: newDirection });
      } catch { }
    }
  };

  return (
    <Tooltip title={direction === 'ltr' ? 'LTR' : 'RTL'} arrow={false}>
      <div 
        style={{ display: 'flex', height: 26, cursor: 'pointer', alignItems: 'center' }}
        onClick={toggleDirection}
      >
        <DirectionIcon direction={direction} />
      </div>
    </Tooltip>
  );
};

export const SelectTimezone = () => {
  const { initialState } = useModel('@@initialState');
  const isLoggedIn = !!(initialState as any)?.currentUser;
  const browserTimezone = getBrowserTimezone();
  const [currentTimezone, setCurrentTimezone] = useState(() => {
    if (typeof window === 'undefined') return browserTimezone;
    const userTimezone = (initialState as any)?.currentUser?.timezone;
    if (userTimezone) return userTimezone;
    return localStorage.getItem(TIMEZONE_STORAGE_KEY) || browserTimezone;
  });

  const handleTimezoneChange = async (tz: string) => {
    localStorage.setItem(TIMEZONE_STORAGE_KEY, tz);
    setCurrentTimezone(tz);
    
    if (isLoggedIn) {
      try {
        await updateProfile({ timezone: tz });
      } catch { }
    }
  };

  const items: MenuProps['items'] = TIMEZONE_OPTIONS.map((item) => ({
    key: item.value,
    label: item.label,
    onClick: () => handleTimezoneChange(item.value),
  }));

  return (
    <Dropdown 
      menu={{ 
        items, 
        selectedKeys: [currentTimezone],
        style: { maxHeight: 300, overflow: 'auto' },
      }} 
      trigger={['hover']} 
      arrow={false}
    >
      <div style={{ display: 'flex', height: 26, cursor: 'pointer', alignItems: 'center' }}>
        <GlobalOutlined />
      </div>
    </Dropdown>
  );
};

export const SelectTheme = () => {
  const { themeMode, compactMode, happyMode, setThemeMode, setCompactMode, setHappyMode } = useTheme();
  const { initialState, setInitialState } = useModel('@@initialState');
  const isLoggedIn = !!(initialState as any)?.currentUser;

  const handleThemeChange = async (mode: 'light' | 'dark' | 'auto') => {
    setThemeMode(mode);
    setInitialState((s: any) => ({ ...s, themeMode: mode }));
    
    if (isLoggedIn) {
      try {
        await updateProfile({ theme: mode });
      } catch { }
    }
  };

  const handleCompactChange = () => {
    setCompactMode(!compactMode);
  };

  const handleHappyChange = () => {
    setHappyMode(!happyMode);
  };

  const ThemeLabel: React.FC<{ label: string; selected: boolean }> = ({ label, selected }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
      <span>{label}</span>
      {selected && (
        <span 
          style={{ 
            width: 6, 
            height: 6, 
            borderRadius: '50%', 
            backgroundColor: '#1677ff',
            flexShrink: 0,
          }} 
        />
      )}
    </div>
  );

  const items: MenuProps['items'] = [
    {
      key: 'auto',
      icon: <SyncOutlined />,
      label: <ThemeLabel label="跟随系统" selected={themeMode === 'auto'} />,
      onClick: () => handleThemeChange('auto'),
    },
    {
      key: 'light',
      icon: <SunOutlined />,
      label: <ThemeLabel label="浅色模式" selected={themeMode === 'light'} />,
      onClick: () => handleThemeChange('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined />,
      label: <ThemeLabel label="暗黑模式" selected={themeMode === 'dark'} />,
      onClick: () => handleThemeChange('dark'),
    },
    { type: 'divider' },
    {
      key: 'compact',
      icon: <CompressOutlined />,
      label: <ThemeLabel label="紧凑模式" selected={compactMode} />,
      onClick: handleCompactChange,
    },
    { type: 'divider' },
    {
      key: 'happy',
      icon: <SmileOutlined />,
      label: <ThemeLabel label="快乐工作" selected={happyMode} />,
      onClick: handleHappyChange,
    },
  ];

  return (
    <Dropdown menu={{ items }} trigger={['hover']} arrow={false}>
      <div style={{ display: 'flex', height: 26, cursor: 'pointer', alignItems: 'center' }}>
        <ThemeIcon />
      </div>
    </Dropdown>
  );
};
