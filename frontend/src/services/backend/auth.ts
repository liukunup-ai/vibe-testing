// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** OIDC登录 通过OIDC授权码登录 POST /auth/oidc */
export async function oidcAuth(body: API.OIDCAuthRequest, options?: { [key: string]: any }) {
  return request<API.LoginResponse>(`/v1/auth/oidc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 忘记密码 发送重置密码邮件 POST /forgot-password */
export async function forgotPassword(
  body: API.ForgotPasswordRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 登录 支持用户名或邮箱登录，LDAP启用时自动尝试LDAP认证 POST /login */
export async function login(body: API.LoginRequest, options?: { [key: string]: any }) {
  return request<API.LoginResponse>(`/v1/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 登出 用户登出，记录审计日志 POST /logout */
export async function logout(options?: { [key: string]: any }) {
  return request<API.LogoutResponse>(`/v1/logout`, {
    method: 'POST',
    ...(options || {}),
  });
}

/** 刷新令牌 刷新访问令牌和刷新令牌 POST /refresh-token */
export async function refreshToken(
  body: API.RefreshTokenRequest,
  options?: { [key: string]: any },
) {
  return request<API.LoginResponse>(`/v1/refresh-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 注册 目前只支持通过邮箱进行注册 POST /register */
export async function register(body: API.RegisterRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 重置密码 通过token重置密码 POST /reset-password */
export async function resetPassword(
  body: API.ResetPasswordRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
