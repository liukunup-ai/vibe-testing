import { request } from '@umijs/max';

export async function listProjects(
  params: API.ProjectSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.ProjectSearchResponse>(`/v1/projects`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createProject(body: API.ProjectRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/projects`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateProject(
  params: { id: number },
  body: API.ProjectRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/projects/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteProject(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/projects/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getProject(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.ProjectResponse>(`/v1/projects/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
