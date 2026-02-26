// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户反馈列表 获取用户反馈列表，支持分页和筛选 GET /v1/feedbacks */
export async function listUserFeedbacks(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListUserFeedbacksParams,
  options?: { [key: string]: any },
) {
  return request<API.UserFeedbackSearchResponse>(`/v1/feedbacks`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建用户反馈 创建一个新的用户反馈 POST /v1/feedbacks */
export async function createUserFeedback(
  body: API.UserFeedbackRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/feedbacks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户反馈详情 获取指定ID的用户反馈详情 GET /v1/feedbacks/${param0} */
export async function getUserFeedback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetUserFeedbackParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.UserFeedbackResponse>(`/v1/feedbacks/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新用户反馈 更新用户反馈信息 PUT /v1/feedbacks/${param0} */
export async function updateUserFeedback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateUserFeedbackParams,
  body: API.UserFeedbackRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/feedbacks/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户反馈 删除指定ID的用户反馈 DELETE /v1/feedbacks/${param0} */
export async function deleteUserFeedback(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteUserFeedbackParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/feedbacks/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取项目用户反馈 获取指定项目的所有用户反馈 GET /v1/feedbacks/project/${param0} */
export async function getUserFeedbacksByProject(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetUserFeedbacksByProjectParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.UserFeedbackSearchResponse>(`/v1/feedbacks/project/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}
