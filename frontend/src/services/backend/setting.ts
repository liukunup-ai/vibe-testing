// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取系统设置 获取系统设置信息 GET /admin/settings */
export async function getSetting(options?: { [key: string]: any }) {
  return request<API.AdminSettingResponse>(`/v1/admin/settings`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新系统设置 更新系统设置信息 PUT /admin/settings */
export async function updateSetting(
  body: API.AdminSettingRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 测试邮件发送 使用当前SMTP配置发送测试邮件 POST /admin/settings/test-email */
export async function testEmail(body: API.TestEmailRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/admin/settings/test-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取站点设置 获取站点的基本设置信息(网站标题、Logo、图标、版权信息)。支持版本检查：如果传入version参数且版本相同，返回304。 GET /site/config */
export async function getPublicSiteConfig(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetPublicSiteConfigParams,
  options?: { [key: string]: any },
) {
  return request<API.PublicSiteConfigResponse>(`/v1/site/config`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}
