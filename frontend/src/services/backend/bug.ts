// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取缺陷列表 搜索时支持编号、标题、严重程度、优先级、状态等筛选 GET /v1/bugs */
export async function listBugs(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListBugsParams,
  options?: { [key: string]: any },
) {
  return request<API.BugSearchResponse>(`/v1/bugs`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建缺陷 创建一个新的缺陷 POST /v1/bugs */
export async function createBug(body: API.BugRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/bugs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取缺陷详情 获取指定ID的缺陷详情 GET /v1/bugs/${param0} */
export async function getBug(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetBugParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.BugResponse>(`/v1/bugs/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新缺陷 更新缺陷信息 PUT /v1/bugs/${param0} */
export async function updateBug(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateBugParams,
  body: API.BugRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/bugs/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除缺陷 删除指定ID的缺陷 DELETE /v1/bugs/${param0} */
export async function deleteBug(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteBugParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/bugs/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
