import { request } from '@umijs/max';

export async function listAIProviders(
  params: API.AIProviderSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.AIProviderSearchResponse>(`/v1/ai-providers`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createAIProvider(
  body: API.AIProviderRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/ai-providers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateAIProvider(
  params: { id: number },
  body: API.AIProviderRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/ai-providers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteAIProvider(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/ai-providers/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getAIProvider(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.AIProviderResponse>(`/v1/ai-providers/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
