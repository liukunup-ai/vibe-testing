import { request } from '@umijs/max';

export async function listTestRecords(
  params: API.TestRecordSearchRequest,
  options?: { [key: string]: any },
) {
  return request<API.TestRecordSearchResponse>(`/v1/testrecords`, {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function createTestRecord(
  body: API.TestRecordRequest,
  options?: { [key: string]: any },
) {
  return request<API.TestRecordResponse>(`/v1/testrecords`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

export async function deleteTestRecord(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.Response>(`/v1/testrecords/${id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function getTestRecord(params: { id: number }, options?: { [key: string]: any }) {
  const { id } = params;
  return request<API.TestRecordResponse>(`/v1/testrecords/${id}`, {
    method: 'GET',
    ...(options || {}),
  });
}
