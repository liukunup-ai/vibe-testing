// @ts-ignore
/* eslint-disable */

import { request } from '@umijs/max';

/** 获取模型列表 支持分页、提供商和名称筛选 */
export async function listModels(
  params: API.ListModelsParams,
  options?: { [key: string]: any },
) {
  return request<API.ModelSearchResponse>(`/v1/admin/models`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 获取模型详情 */
export async function getModel(
  params: API.GetModelParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ModelResponse>(`/v1/admin/models/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 创建模型 */
export async function createModel(body: API.ModelRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/admin/models`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新模型 */
export async function updateModel(
  params: API.UpdateModelParams,
  body: API.ModelRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/models/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除模型 */
export async function deleteModel(
  params: API.DeleteModelParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/models/${param0}`, {
    method: 'DELETE',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 测试模型连接 */
export async function testConnection(
  body: API.TestConnectionRequest,
  options?: { [key: string]: any },
) {
  return request<API.TestConnectionResponse>(`/v1/admin/models/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
