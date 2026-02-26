import { getSiteSetting } from '@/services/backend/setting';

const CACHE_KEY = 'site_settings';
const CACHE_DURATION = 5 * 60 * 1000;

interface CachedSettings {
  data: API.SiteSetting;
  timestamp: number;
  version: string;
}

export async function getSiteSettingWithCache(
  options?: { skipErrorHandler?: boolean },
): Promise<API.SiteSettingResponse> {
  const cached = localStorage.getItem(CACHE_KEY);

  if (cached) {
    try {
      const parsed: CachedSettings = JSON.parse(cached);
      const now = Date.now();

      if (now - parsed.timestamp < CACHE_DURATION && parsed.version) {
        const response = await getSiteSetting({ version: parsed.version }, options);
        if ((response as any) === 304) {
          return { success: true, data: parsed.data };
        }
        if (response.success && response.data) {
          saveToCache(response.data);
          return response;
        }
      }
    } catch {
      localStorage.removeItem(CACHE_KEY);
    }
  }

  const response = await getSiteSetting({}, options);
  if (response.success && response.data) {
    saveToCache(response.data);
  }
  return response;
}

function saveToCache(data: API.SiteSetting) {
  const cached: CachedSettings = {
    data,
    timestamp: Date.now(),
    version: data.version || '',
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cached));
}

export function clearSiteSettingCache() {
  localStorage.removeItem(CACHE_KEY);
}
