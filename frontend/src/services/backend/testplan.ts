// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取测试计划列表 获取测试计划列表，支持分页和筛选 GET /v1/testplans */
export async function listTestPlans(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListTestPlansParams,
  options?: { [key: string]: any },
) {
  return request<API.TestPlanSearchResponse>(`/v1/testplans`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建测试计划 创建一个新的测试计划 POST /v1/testplans */
export async function createTestPlan(body: API.TestPlanRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/testplans`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取测试计划详情 获取指定ID的测试计划详情 GET /v1/testplans/${param0} */
export async function getTestPlan(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetTestPlanParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.TestPlanResponse>(`/v1/testplans/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新测试计划 更新测试计划信息 PUT /v1/testplans/${param0} */
export async function updateTestPlan(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateTestPlanParams,
  body: API.TestPlanRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testplans/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除测试计划 删除指定ID的测试计划 DELETE /v1/testplans/${param0} */
export async function deleteTestPlan(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteTestPlanParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testplans/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
