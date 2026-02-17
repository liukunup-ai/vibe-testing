import { request } from '@umijs/max';

export async function listBugs(params: API.BugSearchRequest, options?: { [key: string]: any }) {
  return request<API.BugSearchResponse>(`/v1/bugs`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

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

export async function updateBug(
  params: { id: number },
  body: API.BugRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/bugs/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteBug(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/bugs/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getBug(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.BugResponse>(`/v1/bugs/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
