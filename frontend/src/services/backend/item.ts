// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取项目列表 搜索时支持名称、描述和所有者筛选 GET /items */
export async function listItems(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListItemsParams,
  options?: { [key: string]: any },
) {
  return request<API.ItemSearchResponse>(`/v1/items`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建项目 创建一个新的项目 POST /items */
export async function createItem(body: API.ItemRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取项目 获取指定ID的项目信息 GET /items/${param0} */
export async function getItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetItemsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.ItemResponse>(`/v1/items/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新项目 更新项目数据 PUT /items/${param0} */
export async function updateItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateItemsParams,
  body: API.ItemRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/items/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除项目 删除指定ID的项目 DELETE /items/${param0} */
export async function deleteItem(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteItemsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/items/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
