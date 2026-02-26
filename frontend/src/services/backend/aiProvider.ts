// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取AI供应商列表 获取所有AI供应商列表，支持分页 GET /v1/ai-providers */
export async function listAiProviders(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListAIProvidersParams,
  options?: { [key: string]: any },
) {
  return request<API.AIProviderSearchResponse>(`/v1/ai-providers`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建AI供应商 创建一个新的AI供应商配置 POST /v1/ai-providers */
export async function createAiProvider(
  body: API.AIProviderRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/ai-providers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取AI供应商详情 获取指定ID的AI供应商详细信息 GET /v1/ai-providers/${param0} */
export async function getAiProvider(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetAIProviderParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.AIProviderResponse>(`/v1/ai-providers/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新AI供应商 更新指定ID的AI供应商信息 PUT /v1/ai-providers/${param0} */
export async function updateAiProvider(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateAIProviderParams,
  body: API.AIProviderRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/ai-providers/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除AI供应商 删除指定ID的AI供应商 DELETE /v1/ai-providers/${param0} */
export async function deleteAiProvider(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteAIProviderParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/ai-providers/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
