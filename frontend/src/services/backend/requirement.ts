import { request } from '@umijs/max';

export async function listRequirements(
  params: API.RequirementSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.RequirementSearchResponse>(`/v1/requirements`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createRequirement(
  body: API.RequirementRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/requirements`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateRequirement(
  params: { id: number },
  body: API.RequirementRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/requirements/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteRequirement(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/requirements/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getRequirement(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.RequirementResponse>(`/v1/requirements/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
