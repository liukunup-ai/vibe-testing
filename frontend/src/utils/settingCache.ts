import { getPublicSiteConfig } from '@/services/backend/setting';

const CACHE_KEY = 'site_config';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedConfig {
  data: API.PublicSiteConfig;
  timestamp: number;
  version: string;
}

/**
 * Get site config with localStorage cache.
 * - If cached and within duration, sends version check to server
 * - If server returns 304 (unchanged), uses cached data
 * - Otherwise fetches fresh data and updates cache
 */
export async function getSiteConfigWithCache(
  options?: { skipErrorHandler?: boolean },
): Promise<API.PublicSiteConfigResponse> {
  const cached = localStorage.getItem(CACHE_KEY);

  // Try version check if we have a valid cached config
  if (cached) {
    try {
      const parsed: CachedConfig = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is within duration and has version
      if (now - parsed.timestamp < CACHE_DURATION && parsed.version) {
        const response = await getPublicSiteConfig({ version: parsed.version }, options);

        // 304 = server says "not modified", use cached data
        if ((response as unknown) === 304) {
          return { success: true, data: parsed.data };
        }

        // Got new data from server
        if (response.success && response.data) {
          saveToCache(response.data);
          return response;
        }
      }
    } catch {
      // Invalid cache, clear it
      localStorage.removeItem(CACHE_KEY);
    }
  }

  // No valid cache, fetch fresh
  const response = await getPublicSiteConfig({}, options);
  if (response.success && response.data) {
    saveToCache(response.data);
  }
  return response;
}

function saveToCache(data: API.PublicSiteConfig): void {
  const cached: CachedConfig = {
    data,
    timestamp: Date.now(),
    version: data.version || '',
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
}

export function clearSiteConfigCache(): void {
  localStorage.removeItem(CACHE_KEY);
}
