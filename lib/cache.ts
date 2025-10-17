/**
 * Caching Utilities for Performance Optimization
 * 
 * Provides in-memory and Redis-based caching with TTL support
 */

import { logError, logger } from './logger';

// In-memory cache store
const memoryCache = new Map<string, { data: any; expires: number }>();

/**
 * Cache configuration
 */
export const CACHE_TTL = {
  SHORT: parseInt(process.env.CACHE_TTL_SHORT || '300'), // 5 minutes
  MEDIUM: parseInt(process.env.CACHE_TTL_MEDIUM || '1800'), // 30 minutes
  LONG: parseInt(process.env.CACHE_TTL_LONG || '3600'), // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

/**
 * Generate cache key with namespace
 */
export function getCacheKey(namespace: string, key: string): string {
  return `${namespace}:${key}`;
}

/**
 * Set item in cache
 */
export async function setCache(
  key: string,
  value: any,
  ttl: number = CACHE_TTL.MEDIUM
): Promise<void> {
  try {
    const expires = Date.now() + ttl * 1000;
    memoryCache.set(key, { data: value, expires });
    
    // Clean up expired entries periodically
    if (memoryCache.size > 1000) {
      cleanupExpiredCache();
    }
  } catch (error) {
    logError(error, 'CacheSet', { key, ttl });
  }
}

/**
 * Get item from cache
 */
export async function getCache<T = any>(key: string): Promise<T | null> {
  try {
    const cached = memoryCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expires) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.data as T;
  } catch (error) {
    logError(error, 'CacheGet', { key });
    return null;
  }
}

/**
 * Delete item from cache
 */
export async function deleteCache(key: string): Promise<void> {
  try {
    memoryCache.delete(key);
  } catch (error) {
    logError(error, 'CacheDelete', { key });
  }
}

/**
 * Clear all cache for a namespace
 */
export async function clearCacheNamespace(namespace: string): Promise<void> {
  try {
    const prefix = `${namespace}:`;
    const keysToDelete: string[] = [];
    
    const keys = Array.from(memoryCache.keys());
    for (const key of keys) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => memoryCache.delete(key));
    
    logger.info('Cleared cache namespace', { namespace, count: keysToDelete.length });
  } catch (error) {
    logError(error, 'CacheClearNamespace', { namespace });
  }
}

/**
 * Clear all cache
 */
export async function clearAllCache(): Promise<void> {
  try {
    const size = memoryCache.size;
    memoryCache.clear();
    logger.info('Cleared all cache', { count: size });
  } catch (error) {
    logError(error, 'CacheClearAll');
  }
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredCache(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  const entries = Array.from(memoryCache.entries());
  for (const [key, value] of entries) {
    if (now > value.expires) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => memoryCache.delete(key));
  
  if (keysToDelete.length > 0) {
    logger.debug('Cleaned up expired cache entries', { count: keysToDelete.length });
  }
}

/**
 * Cache decorator for functions
 */
export function cached<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: {
    namespace: string;
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const cacheKey = getCacheKey(
      options.namespace,
      options.keyGenerator ? options.keyGenerator(...args) : JSON.stringify(args)
    );
    
    // Try to get from cache
    const cachedResult = await getCache(cacheKey);
    if (cachedResult !== null) {
      logger.debug('Cache hit', { key: cacheKey });
      return cachedResult;
    }
    
    // Execute function
    logger.debug('Cache miss, executing function', { key: cacheKey });
    const result = await fn(...args);
    
    // Store in cache
    await setCache(cacheKey, result, options.ttl || CACHE_TTL.MEDIUM);
    
    return result;
  }) as T;
}

/**
 * Memoize function results (simpler in-memory only)
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  ttl: number = CACHE_TTL.SHORT
): T {
  const cache = new Map<string, { result: any; expires: number }>();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    
    if (cached && Date.now() < cached.expires) {
      return cached.result;
    }
    
    const result = fn(...args);
    cache.set(key, { result, expires: Date.now() + ttl * 1000 });
    
    return result;
  }) as T;
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let expired = 0;
  let active = 0;
  
  const values = Array.from(memoryCache.values());
  for (const value of values) {
    if (now > value.expires) {
      expired++;
    } else {
      active++;
    }
  }
  
  return {
    total: memoryCache.size,
    active,
    expired,
  };
}

// Clean up expired cache every 5 minutes
if (typeof global !== 'undefined') {
  setInterval(() => {
    cleanupExpiredCache();
  }, 5 * 60 * 1000);
}

