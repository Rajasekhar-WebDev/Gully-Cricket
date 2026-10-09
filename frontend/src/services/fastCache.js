/**
 * Fast SWR (Stale-While-Revalidate) Cache Manager for Gully Cricket
 * Provides 0ms instant page loads using local persistence with seamless background sync.
 */

const CACHE_PREFIX = 'gulli_cache_';

export const fastCache = {
  get: (key, defaultVal = null) => {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      if (!raw) return defaultVal;
      const parsed = JSON.parse(raw);
      return parsed.data !== undefined ? parsed.data : defaultVal;
    } catch (e) {
      return defaultVal;
    }
  },

  set: (key, data) => {
    try {
      localStorage.setItem(
        CACHE_PREFIX + key,
        JSON.stringify({
          data,
          timestamp: Date.now()
        })
      );
    } catch (e) {
      // LocalStorage quota or privacy mode safe
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(CACHE_PREFIX + key);
    } catch (e) {
    }
  },

  clearAll: () => {
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith(CACHE_PREFIX))
        .forEach(k => localStorage.removeItem(k));
    } catch (e) {
    }
  }
};

export default fastCache;
