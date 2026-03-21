// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取模型列表 分页获取模型列表，支持按提供者和名称筛选 GET /admin/models */
export async function listModels(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
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

/** 创建模型 创建一个新的模型配置 POST /admin/models */
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

/** 获取模型详情 获取指定ID的模型详情 GET /admin/models/${param0} */
export async function getModel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
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

/** 更新模型 更新指定ID的模型配置 PUT /admin/models/${param0} */
export async function updateModel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
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

/** 删除模型 删除指定ID的模型配置 DELETE /admin/models/${param0} */
export async function deleteModel(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteModelParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/models/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 测试模型连接 测试模型配置是否可以正常连接 POST /admin/models/test-connection */
export async function testConnection(
  body: API.TestConnectionRequest,
  options?: { [key: string]: any },
) {
  return request<API.TestConnectionResult>(`/v1/admin/models/test-connection`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
