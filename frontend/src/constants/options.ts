export interface SelectOption {
  value: string;
  label: string;
}

export const TIMEZONE_OPTIONS: SelectOption[] = [
  { value: 'Pacific/Midway', label: '(UTC-11:00) 中途岛' },
  { value: 'Pacific/Honolulu', label: '(UTC-10:00) 檀香山' },
  { value: 'America/Anchorage', label: '(UTC-09:00) 安克雷奇' },
  { value: 'America/Los_Angeles', label: '(UTC-08:00) 洛杉矶' },
  { value: 'America/Denver', label: '(UTC-07:00) 丹佛' },
  { value: 'America/Chicago', label: '(UTC-06:00) 芝加哥' },
  { value: 'America/New_York', label: '(UTC-05:00) 纽约' },
  { value: 'America/Caracas', label: '(UTC-04:00) 加拉加斯' },
  { value: 'America/Sao_Paulo', label: '(UTC-03:00) 圣保罗' },
  { value: 'Atlantic/South_Georgia', label: '(UTC-02:00) 南乔治亚' },
  { value: 'Atlantic/Azores', label: '(UTC-01:00) 亚速尔群岛' },
  { value: 'Europe/London', label: '(UTC+00:00) 伦敦' },
  { value: 'Europe/Paris', label: '(UTC+01:00) 巴黎' },
  { value: 'Europe/Berlin', label: '(UTC+01:00) 柏林' },
  { value: 'Europe/Rome', label: '(UTC+01:00) 罗马' },
  { value: 'Africa/Cairo', label: '(UTC+02:00) 开罗' },
  { value: 'Europe/Moscow', label: '(UTC+03:00) 莫斯科' },
  { value: 'Asia/Dubai', label: '(UTC+04:00) 迪拜' },
  { value: 'Asia/Karachi', label: '(UTC+05:00) 卡拉奇' },
  { value: 'Asia/Kolkata', label: '(UTC+05:30) 加尔各答' },
  { value: 'Asia/Dhaka', label: '(UTC+06:00) 达卡' },
  { value: 'Asia/Bangkok', label: '(UTC+07:00) 曼谷' },
  { value: 'Asia/Singapore', label: '(UTC+08:00) 新加坡' },
  { value: 'Asia/Hong_Kong', label: '(UTC+08:00) 香港' },
  { value: 'Asia/Shanghai', label: '(UTC+08:00) 上海' },
  { value: 'Asia/Taipei', label: '(UTC+08:00) 台北' },
  { value: 'Asia/Tokyo', label: '(UTC+09:00) 东京' },
  { value: 'Asia/Seoul', label: '(UTC+09:00) 首尔' },
  { value: 'Australia/Sydney', label: '(UTC+10:00) 悉尼' },
  { value: 'Pacific/Noumea', label: '(UTC+11:00) 努美阿' },
  { value: 'Pacific/Auckland', label: '(UTC+12:00) 奥克兰' },
];
