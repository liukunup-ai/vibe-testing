// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取测试用例列表 搜索时支持名称、描述、项目ID等筛选 GET /v1/testcases */
export async function listTestCases(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListTestCasesParams,
  options?: { [key: string]: any },
) {
  return request<API.TestCaseSearchResponse>(`/v1/testcases`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建测试用例 创建一个新的测试用例 POST /v1/testcases */
export async function createTestCase(body: API.TestCaseRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/testcases`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取测试用例详情 获取指定ID的测试用例详情 GET /v1/testcases/${param0} */
export async function getTestCase(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetTestCaseParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.TestCaseResponse>(`/v1/testcases/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新测试用例 更新测试用例信息 PUT /v1/testcases/${param0} */
export async function updateTestCase(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateTestCaseParams,
  body: API.TestCaseRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testcases/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除测试用例 删除指定ID的测试用例 DELETE /v1/testcases/${param0} */
export async function deleteTestCase(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteTestCaseParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testcases/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
