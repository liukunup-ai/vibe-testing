import { request } from '@umijs/max';

export async function listDevices(
  params: API.DeviceSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.DeviceSearchResponse>(`/v1/devices`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createDevice(body: API.DeviceRequest, options?: { [key: string]: any }) {
  return request<API.Response>(`/v1/devices`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function updateDevice(
  params: { id: number },
  body: API.DeviceRequest,
  options?: { [key: string]: any },
) {
  const { id } = params;
  return request<API.Response>(`/v1/devices/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteDevice(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/devices/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getDevice(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.DeviceResponse>(`/v1/devices/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function deviceHeartbeat(
  body: API.DeviceHeartbeatRequest,
  options?: { [key: string]: any },
) {
  return request<API.Response>(`/v1/devices/heartbeat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
