import { useCallback, useEffect, useState, useRef } from 'react';
import { getRefreshToken, setRefreshToken, removeRefreshToken } from '@/utils/auth';
import { refreshToken as refreshTokenApi } from '@/services/backend/auth';
import { clearSiteConfigCache } from '@/utils/settingCache';

const REFRESH_BUFFER_SECONDS = 3 * 60;

interface TokenMemory {
  accessToken: string | null;
  expiresAt: number | null;
}

const tokenMemory: TokenMemory = {
  accessToken: null,
  expiresAt: null,
};

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;
let listeners: Array<() => void> = [];
let initPromise: Promise<boolean> | null = null;

const notifyListeners = () => {
  listeners.forEach((listener) => listener());
};

const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

export const getAccessToken = (): string | null => tokenMemory.accessToken;

const setAccessTokenMemory = (accessToken: string, expiresIn: number) => {
  tokenMemory.accessToken = accessToken;
  tokenMemory.expiresAt = Math.floor(Date.now() / 1000) + expiresIn;
  notifyListeners();
};

const clearAccessTokenMemory = () => {
  tokenMemory.accessToken = null;
  tokenMemory.expiresAt = null;
  notifyListeners();
};

const shouldRefreshToken = (): boolean => {
  if (!tokenMemory.expiresAt) return true;
  return Math.floor(Date.now() / 1000) >= tokenMemory.expiresAt - REFRESH_BUFFER_SECONDS;
};

const scheduleRefreshTimer = (expiresIn: number) => {
  clearRefreshTimer();
  const refreshTime = (expiresIn - REFRESH_BUFFER_SECONDS) * 1000;
  if (refreshTime <= 0) {
    doRefreshToken().catch(() => {});
    return;
  }
  refreshTimer = setTimeout(() => {
    if (!isRefreshing && getRefreshToken()) {
      doRefreshToken().catch(() => {});
    }
  }, refreshTime);
};

const doRefreshToken = async (): Promise<string | null> => {
  if (isRefreshing) {
    return null;
  }

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    clearAccessTokenMemory();
    removeRefreshToken();
    clearRefreshTimer();
    return null;
  }

  isRefreshing = true;
  try {
    const response = await refreshTokenApi({ refreshToken: refreshTokenValue });
    if (response.success && response.data) {
      const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
      if (!accessToken || expiresIn === undefined) {
        throw new Error('Invalid token response');
      }
      setAccessTokenMemory(accessToken, expiresIn);
      if (newRefreshToken) {
        setRefreshToken(newRefreshToken);
      }
      scheduleRefreshTimer(expiresIn);
      return accessToken;
    }
    throw new Error(response.errorMessage || 'Token refresh failed');
  } catch (error) {
    clearAccessTokenMemory();
    removeRefreshToken();
    clearRefreshTimer();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return null;
  } finally {
    isRefreshing = false;
  }
};

export const initToken = async (): Promise<boolean> => {
  if (initPromise) {
    return initPromise;
  }

  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    return false;
  }
  if (tokenMemory.accessToken && !shouldRefreshToken()) {
    return true;
  }

  initPromise = doRefreshToken().then((token) => !!token).finally(() => {
    initPromise = null;
  });

  return initPromise;
};

export interface TokenModel {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  clearTokens: () => void;
}

export const useTokenModel = (): TokenModel => {
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const listener = () => forceUpdate({});
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  useEffect(() => {
    if (!tokenMemory.accessToken && getRefreshToken()) {
      initToken().catch(() => {});
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (shouldRefreshToken()) {
          initToken().catch(() => {});
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const setTokens = useCallback((accessToken: string, refreshToken: string, expiresIn: number) => {
    setAccessTokenMemory(accessToken, expiresIn);
    setRefreshToken(refreshToken);
    scheduleRefreshTimer(expiresIn);
    clearSiteConfigCache();
  }, []);

  const clearTokens = useCallback(() => {
    clearAccessTokenMemory();
    removeRefreshToken();
    clearRefreshTimer();
    clearSiteConfigCache();
  }, []);

  return {
    accessToken: tokenMemory.accessToken,
    refreshToken: getRefreshToken(),
    isAuthenticated: !!tokenMemory.accessToken,
    setTokens,
    clearTokens,
  };
};
