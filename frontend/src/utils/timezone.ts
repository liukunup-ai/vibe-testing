/**
 * 时区工具 - 处理 UTC 时间与用户时区之间的转换
 * 后端存储 UTC，前端根据用户偏好显示
 */

import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// 扩展 dayjs 插件
dayjs.extend(utc);
dayjs.extend(timezone);

export const TIMEZONE_STORAGE_KEY = 'app-timezone';

/**
 * 获取浏览器默认时区
 */
export const getBrowserTimezone = (): string => {
  if (typeof window !== 'undefined' && Intl?.DateTimeFormat) {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }
  return 'UTC';
};

/**
 * 获取用户选择的时区（从 localStorage），如果没有则返回浏览器时区
 */
export const getUserTimezone = (): string => {
  if (typeof window === 'undefined') return 'UTC';
  
  const stored = localStorage.getItem(TIMEZONE_STORAGE_KEY);
  if (stored) return stored;
  
  return getBrowserTimezone();
};

/**
 * 将 UTC 时间字符串转换为用户时区的时间
 * @param utcTime - UTC 时间字符串（ISO 格式或后端返回的格式）
 * @returns 转换后的 dayjs 对象
 */
export const convertToUserTimezone = (utcTime: string | undefined | null): Dayjs | null => {
  if (!utcTime) return null;
  return dayjs.utc(utcTime).tz(getUserTimezone());
};

/**
 * 格式化时间为用户时区的显示格式
 * @param utcTime - UTC 时间字符串
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 */
export const formatInUserTimezone = (
  utcTime: string | undefined | null, 
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string => {
  const converted = convertToUserTimezone(utcTime);
  if (!converted) return '-';
  return converted.format(format);
};

/**
 * 创建用于 ProTable 列的 dateTime 渲染器
 * 使用用户选择的时区显示时间
 */
export const createDateTimeRenderer = (format: string = 'YYYY-MM-DD HH:mm:ss') => {
  return (_: any, record: any, index: number) => {
    // 尝试从记录中获取时间字段（通常是 createdAt 或 updatedAt）
    const timeValue = record?.createdAt || record?.updatedAt;
    return formatInUserTimezone(timeValue, format);
  };
};

export default dayjs;
