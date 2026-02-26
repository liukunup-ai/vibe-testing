// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取测试套件列表 获取测试套件列表，支持分页和筛选 GET /v1/testsuites */
export async function listTestSuites(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListTestSuitesParams,
  options?: { [key: string]: any },
) {
  return request<API.TestSuiteSearchResponse>(`/v1/testsuites`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建测试套件 创建一个新的测试套件 POST /v1/testsuites */
export async function createTestSuite(
  body: API.TestSuiteRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/testsuites`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取测试套件详情 获取指定ID的测试套件详情 GET /v1/testsuites/${param0} */
export async function getTestSuite(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetTestSuiteParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.TestSuiteResponse>(`/v1/testsuites/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新测试套件 更新指定ID的测试套件信息 PUT /v1/testsuites/${param0} */
export async function updateTestSuite(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateTestSuiteParams,
  body: API.TestSuiteRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testsuites/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除测试套件 删除指定ID的测试套件 DELETE /v1/testsuites/${param0} */
export async function deleteTestSuite(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteTestSuiteParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testsuites/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
