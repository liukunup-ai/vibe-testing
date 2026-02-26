// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取测试记录列表 获取测试记录列表，支持按项目、用例等筛选 GET /v1/testrecords */
export async function listTestRecords(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListTestRecordsParams,
  options?: { [key: string]: any },
) {
  return request<API.TestRecordSearchResponse>(`/v1/testrecords`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建测试记录 创建一个新的测试记录 POST /v1/testrecords */
export async function createTestRecord(
  body: API.TestRecordRequest,
  options?: { [key: string]: any },
) {
  return request<API.TestRecordResponse>(`/v1/testrecords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取测试记录详情 获取指定ID的测试记录详情 GET /v1/testrecords/${param0} */
export async function getTestRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetTestRecordParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.TestRecordResponse>(`/v1/testrecords/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 删除测试记录 删除指定ID的测试记录 DELETE /v1/testrecords/${param0} */
export async function deleteTestRecord(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteTestRecordParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/testrecords/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}
