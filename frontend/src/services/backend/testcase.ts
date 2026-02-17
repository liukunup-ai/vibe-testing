import { request } from '@umijs/max';

export async function listTestCases(
  params: API.TestCaseSearchRequest,
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

export async function updateTestCase(
  params: { id: number },
  body: API.TestCaseRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/testcases/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteTestCase(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/testcases/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getTestCase(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.TestCaseResponse>(`/v1/testcases/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
