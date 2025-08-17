// Cache utility for API responses
interface CacheData<T> {
  data: T;
  timestamp: number;
}

// A simple in-memory cache store
const cacheStore: Record<string, CacheData<any>> = {};

// Cache expiration time in milliseconds (default: 10 minutes)
const DEFAULT_CACHE_EXPIRATION = 10 * 60 * 1000;

// Function to set data in cache
export const setCache = <T>(key: string, data: T): void => {
  cacheStore[key] = {
    data,
    timestamp: Date.now(),
  };
};

// Function to get data from cache
export const getCache = <T>(key: string, maxAge = DEFAULT_CACHE_EXPIRATION): T | null => {
  const cached = cacheStore[key];
  
  if (!cached) {
    return null;
  }
  
  // Check if cache is expired
  if (maxAge > 0 && Date.now() - cached.timestamp > maxAge) {
    delete cacheStore[key];
    return null;
  }
  
  return cached.data as T;
};

// Function to clear specific cache entry
export const clearCache = (key: string): void => {
  delete cacheStore[key];
};

// Function to clear all cache
export const clearAllCache = (): void => {
  Object.keys(cacheStore).forEach(key => {
    delete cacheStore[key];
  });
};

// Function to check if cache exists for a key
export const hasCache = (key: string): boolean => {
  return !!cacheStore[key];
};
