import { request } from '@umijs/max';

export async function listUserFeedbacks(
  params: API.UserFeedbackSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.UserFeedbackSearchResponse>(`/v1/user-feedbacks`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createUserFeedback(
  body: API.UserFeedbackRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/user-feedbacks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateUserFeedback(
  params: { id: number },
  body: API.UserFeedbackRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/user-feedbacks/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteUserFeedback(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/user-feedbacks/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getUserFeedback(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.UserFeedbackResponse>(`/v1/user-feedbacks/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
