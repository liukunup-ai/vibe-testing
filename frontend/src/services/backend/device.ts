// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取设备列表 搜索时支持设备名称、设备类型和状态筛选 GET /v1/devices */
export async function listDevices(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.ListDevicesParams,
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

/** 创建设备 创建一个新的设备 POST /v1/devices */
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

/** 获取设备详情 获取指定ID的设备详情 GET /v1/devices/${param0} */
export async function getDevice(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.GetDeviceParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.DeviceResponse>(`/v1/devices/${param0}`, {
    method: 'GET',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 更新设备 更新设备信息 PUT /v1/devices/${param0} */
export async function updateDevice(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.UpdateDeviceParams,
  body: API.DeviceRequest,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/devices/${param0}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    params: { ...queryParams },
    data: body,
    ...(options || {}),
  });
}

/** 删除设备 删除指定ID的设备 DELETE /v1/devices/${param0} */
export async function deleteDevice(
  // 叠加生成的Param类型 (非body参数swagger默认没有生成对象)
  params: API.DeleteDeviceParams,
  options?: { [key: string]: any },
) {
  const { id: param0, ...queryParams } = params;
  return request<API.Response>(`/v1/devices/${param0}`, {
    method: 'DELETE',
    params: { ...queryParams },
    ...(options || {}),
  });
}

/** 设备心跳 接收设备心跳请求 POST /v1/devices/heartbeat */
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
