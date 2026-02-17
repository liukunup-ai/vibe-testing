import { request } from '@umijs/max';

export async function listAIAnalysisResults(
  params: API.AIAnalysisResultSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.AIAnalysisResultSearchResponse>(`/v1/ai-analysis-results`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createAIAnalysisResult(
  body: API.AIAnalysisResultRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/ai-analysis-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateAIAnalysisResult(
  params: { id: number },
  body: API.AIAnalysisResultRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/ai-analysis-results/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteAIAnalysisResult(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/ai-analysis-results/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getAIAnalysisResult(
  params: { id: number },
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.AIAnalysisResultResponse>(`/v1/ai-analysis-results/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
