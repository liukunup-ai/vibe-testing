import { request } from '@umijs/max';

export async function listTestPlans(
  params: API.TestPlanSearchRequest,
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

export async function updateTestPlan(
  params: { id: number },
  body: API.TestPlanRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/testplans/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteTestPlan(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/testplans/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getTestPlan(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.TestPlanResponse>(`/v1/testplans/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
