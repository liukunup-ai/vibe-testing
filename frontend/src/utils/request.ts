import type { RequestConfig, RequestOptions } from '@@/plugin-request/request';
import { request } from '@umijs/max';
import { message, notification } from 'antd';
import { getRefreshToken, setRefreshToken, removeRefreshToken } from './auth';
import { refreshToken } from '@/services/backend/auth';
import { getAccessToken } from '@/models/useTokenModel';

enum ErrorShowType {
  SILENT = 0,
  WARN_MESSAGE = 1,
  ERROR_MESSAGE = 2,
  NOTIFICATION = 3,
  REDIRECT = 9,
}

interface IResponse<T = any> {
  success: boolean;
  data: T;
  errorCode?: number;
  errorMessage?: string;
  errorShowType?: ErrorShowType;
}

interface RequestQueueItem {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  originalRequest: any;
}

let isRefreshing = false;
let failedQueue: RequestQueueItem[] = [];

const handleTokenRefresh = async (): Promise<string> => {
  try {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw new Error('No refreshToken available');
    }
    const response = await refreshToken({ refreshToken: refreshTokenValue });
    if (response.success && response.data) {
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      if (!accessToken || expiresIn === undefined) {
        throw new Error('Invalid token response');
      }
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      return accessToken;
    }
    throw new Error(response.errorMessage || 'Token refresh failed');
  } catch (error) {
    removeRefreshToken();
    window.location.href = '/login';
    throw error;
  }
};

const processQueue = async (error: any, token: string | null = null): Promise<void> => {
  if (error) {
    failedQueue.forEach((prom) => prom.reject(error));
  } else {
    for (const prom of failedQueue) {
      try {
        const config = { ...prom.originalRequest };
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        const { url, ...restConfig } = config;
        const response = await request(url, restConfig);
        prom.resolve(response);
      } catch (retryError) {
        prom.reject(retryError);
      }
    }
  }
  failedQueue = [];
};

const handleBizError = (errorInfo: IResponse): void => {
  const { errorCode, errorMessage, errorShowType } = errorInfo;

  const errorCodeHandlers: Record<number, () => void> = {
    400: () => notification.error({ message: 'Bad Request', description: errorMessage }),
    401: () => {},
    403: () => notification.error({ message: 'Forbidden', description: errorMessage }),
    404: () => notification.error({ message: 'Not Found', description: errorMessage }),
    500: () => notification.error({ message: 'Server Error', description: errorMessage }),
  };

  if (errorCode && errorCodeHandlers[errorCode]) {
    errorCodeHandlers[errorCode]();
    return;
  }

  switch (errorShowType) {
    case ErrorShowType.SILENT:
      break;
    case ErrorShowType.WARN_MESSAGE:
      message.warning(errorMessage);
      break;
    case ErrorShowType.ERROR_MESSAGE:
      message.error(errorMessage);
      break;
    case ErrorShowType.NOTIFICATION:
      notification.open({ description: errorMessage, message: errorCode?.toString() });
      break;
    case ErrorShowType.REDIRECT:
      break;
    default:
      message.error(errorMessage || 'Unknown error');
  }
};

const handleUnauthorizedError = async (originalRequest: any): Promise<any> => {
  if (!isRefreshing) {
    isRefreshing = true;
    try {
      const newAccessToken = await handleTokenRefresh();
      await processQueue(null, newAccessToken);
      const config = { ...originalRequest };
      config.headers = { ...config.headers, Authorization: `Bearer ${newAccessToken}` };
      const { url, ...restConfig } = config;
      return request(url, restConfig);
    } catch (err) {
      await processQueue(err, null);
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject, originalRequest });
  });
};

export const errorConfig: RequestConfig = {
  errorConfig: {
    errorThrower: (response: IResponse) => {
      const { success, data, errorCode, errorMessage, errorShowType } = response;
      if (!success) {
        const error: any = new Error(errorMessage);
        error.name = 'BizError';
        error.info = { errorCode, errorMessage, errorShowType, data };
        throw error;
      }
    },

    errorHandler: async (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      if (error.name === 'BizError') {
        const errorInfo: IResponse | undefined = error.info;
        if (errorInfo) {
          if (errorInfo.errorCode === 401) {
            const originalRequest = error.config;
            return handleUnauthorizedError(originalRequest);
          } else {
            handleBizError(errorInfo);
          }
        }
      } else if (error.response) {
        if (error.response.status === 401) {
          const originalRequest = error.config;
          return handleUnauthorizedError(originalRequest);
        } else {
          message.error(`Response error: ${error.response.status}`);
        }
      } else if (error.request) {
        message.error('No response, please retry');
      } else {
        message.error('Request error, please retry');
      }
    },
  },

  requestInterceptors: [
    (config: RequestOptions) => {
      if (typeof window !== 'undefined') {
        const token = getAccessToken();
        if (token) {
          config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
        }
      }
      return config;
    },
  ],

  responseInterceptors: [],
};
