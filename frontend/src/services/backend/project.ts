// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取项目列表 搜索时支持项目名称、描述筛选 GET /v1/projects */
export async function listProjects(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListProjectsParams,
  options?: { [key: string]: any },
) {
  return request<API.ProjectSearchResponse>(`/v1/projects`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建项目 创建一个新的项目 POST /v1/projects */
export async function createProject(body: API.ProjectRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取项目详情 获取指定ID的项目详情 GET /v1/projects/${param0} */
export async function getProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetProjectParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ProjectResponse>(`/v1/projects/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新项目 更新项目信息 PUT /v1/projects/${param0} */
export async function updateProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateProjectParams,
  body: API.ProjectRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/projects/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除项目 删除指定ID的项目 DELETE /v1/projects/${param0} */
export async function deleteProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteProjectParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/projects/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
