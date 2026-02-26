// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取需求列表 分页获取需求列表，支持筛选 GET /v1/requirements */
export async function listRequirements(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListRequirementsParams,
  options?: { [key: string]: any },
) {
  return request<API.RequirementSearchResponse>(`/v1/requirements`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建需求 创建一个新的需求 POST /v1/requirements */
export async function createRequirement(
  body: API.RequirementRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取需求详情 获取指定ID的需求详情 GET /v1/requirements/${param0} */
export async function getRequirement(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetRequirementParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.RequirementResponse>(`/v1/requirements/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新需求 更新指定ID的需求信息 PUT /v1/requirements/${param0} */
export async function updateRequirement(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateRequirementParams,
  body: API.RequirementRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/requirements/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除需求 删除指定ID的需求 DELETE /v1/requirements/${param0} */
export async function deleteRequirement(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteRequirementParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/requirements/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
