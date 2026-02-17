import { request } from '@umijs/max';

export async function listTestSuites(
  params: API.TestSuiteSearchRequest,
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

export async function updateTestSuite(
  params: { id: number },
  body: API.TestSuiteRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/testsuites/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteTestSuite(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/testsuites/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getTestSuite(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.TestSuiteResponse>(`/v1/testsuites/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
