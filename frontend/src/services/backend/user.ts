// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取用户列表 搜索时支持用户名、昵称、手机和邮箱筛选 GET /admin/users */
export async function listUsers(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListUsersParams,
  options?: { [key: string]: any },
) {
  return request<API.UserSearchResponse>(`/v1/admin/users`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建用户 创建一个新的用户 POST /admin/users */
export async function createUser(body: API.UserRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新用户 更新用户信息 PUT /admin/users/${param0} */
export async function updateUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateUserParams,
  body: API.UserRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除用户 删除指定ID的用户 DELETE /admin/users/${param0} */
export async function deleteUser(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteUserParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}`, {
    method: 'DELETE',
    params: {
      ...queryParams,
    },
    ...(options || {}),
  });
}

/** 重置头像 重置用户头像为默认头像 PUT /admin/users/${param0}/reset-avatar */
export async function resetAvatar(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ResetAvatarParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}/reset-avatar`, {
    method: 'PUT',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 撤销登录态 撤销指定用户的所有登录会话 POST /admin/users/${param0}/revoke-sessions */
export async function revokeSessions(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.RevokeSessionsParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}/revoke-sessions`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 发送重置密码邮件 向指定用户发送重置密码邮件 POST /admin/users/${param0}/send-reset-email */
export async function sendResetEmail(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.SendResetEmailParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}/send-reset-email`, {
    method: 'POST',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新用户状态 更新用户状态（启用/禁用） PUT /admin/users/${param0}/status */
export async function updateStatus(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateStatusParams,
  body: API.UpdateStatusRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/admin/users/${param0}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 获取用户详情 获取指定ID的用户详情 GET /users/${param0} */
export async function getUserById(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetUserByIDParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.UserResponse>(`/v1/users/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 获取用户菜单 获取当前用户的菜单列表 GET /users/menu */
export async function fetchDynamicMenu(options?: { [key: string]: any }) {
  return request<API.DynamicMenuResponse>(`/v1/users/menu`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新密码 更新用户密码 PUT /users/password */
export async function updatePassword(
  body: API.UpdatePasswordRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/users/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取当前用户 获取当前用户的详细信息 GET /users/profile */
export async function fetchCurrentUser(options?: { [key: string]: any }) {
  return request<API.UserResponse>(`/v1/users/profile`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 更新用户 更新用户信息 PUT /users/profile */
export async function updateProfile(body: API.UserRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/users/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 上传头像 上传用户头像 PUT /users/profile/avatar */
export async function uploadAvatar(body: {}, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/users/profile/avatar`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    data: body,
    ...(options || {}),
  });
}
