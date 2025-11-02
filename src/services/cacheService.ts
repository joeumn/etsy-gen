/**
 * Cache Service
 * 
 * Redis-backed caching layer for performance optimization
 */

import { redis } from '../config/redis';
import { logger } from '../config/logger';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

const DEFAULT_TTL = 3600; // 1 hour
const DEFAULT_PREFIX = 'cache';

export class CacheService {
  /**
   * Get a value from cache
   */
  static async get<T = any>(key: string, prefix = DEFAULT_PREFIX): Promise<T | null> {
    try {
      const fullKey = `${prefix}:${key}`;
      const cached = await redis.get(fullKey);
      
      if (!cached) {
        return null;
      }
      
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error({ err: error, key }, 'Cache get error');
      return null;
    }
  }

  /**
   * Set a value in cache
   */
  static async set(
    key: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const { ttl = DEFAULT_TTL, prefix = DEFAULT_PREFIX } = options;
      const fullKey = `${prefix}:${key}`;
      const serialized = JSON.stringify(value);
      
      if (ttl > 0) {
        await redis.setex(fullKey, ttl, serialized);
      } else {
        await redis.set(fullKey, serialized);
      }
    } catch (error) {
      logger.error({ err: error, key }, 'Cache set error');
    }
  }

  /**
   * Delete a specific key from cache
   */
  static async delete(key: string, prefix = DEFAULT_PREFIX): Promise<void> {
    try {
      const fullKey = `${prefix}:${key}`;
      await redis.del(fullKey);
    } catch (error) {
      logger.error({ err: error, key }, 'Cache delete error');
    }
  }

  /**
   * Invalidate all keys matching a pattern
   */
  static async invalidatePattern(pattern: string, prefix = DEFAULT_PREFIX): Promise<number> {
    try {
      const fullPattern = `${prefix}:${pattern}`;
      const keys = await redis.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      await redis.del(...keys);
      logger.info({ pattern, count: keys.length }, 'Cache invalidated');
      return keys.length;
    } catch (error) {
      logger.error({ err: error, pattern }, 'Cache invalidate error');
      return 0;
    }
  }

  /**
   * Get or set pattern: fetch from cache, or compute and cache if missing
   */
  static async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const { prefix = DEFAULT_PREFIX } = options;
    
    // Try to get from cache
    const cached = await this.get<T>(key, prefix);
    if (cached !== null) {
      logger.debug({ key }, 'Cache hit');
      return cached;
    }
    
    // Cache miss - fetch data
    logger.debug({ key }, 'Cache miss');
    const data = await fetcher();
    
    // Store in cache
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Increment a counter in cache
   */
  static async increment(
    key: string,
    amount = 1,
    options: CacheOptions = {}
  ): Promise<number> {
    try {
      const { ttl, prefix = DEFAULT_PREFIX } = options;
      const fullKey = `${prefix}:${key}`;
      
      const newValue = await redis.incrby(fullKey, amount);
      
      // Set expiration if provided
      if (ttl && ttl > 0) {
        await redis.expire(fullKey, ttl);
      }
      
      return newValue;
    } catch (error) {
      logger.error({ err: error, key }, 'Cache increment error');
      return 0;
    }
  }

  /**
   * Check if key exists in cache
   */
  static async exists(key: string, prefix = DEFAULT_PREFIX): Promise<boolean> {
    try {
      const fullKey = `${prefix}:${key}`;
      const result = await redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      logger.error({ err: error, key }, 'Cache exists error');
      return false;
    }
  }

  /**
   * Get multiple keys at once
   */
  static async mget<T = any>(
    keys: string[],
    prefix = DEFAULT_PREFIX
  ): Promise<(T | null)[]> {
    try {
      const fullKeys = keys.map(k => `${prefix}:${k}`);
      const values = await redis.mget(...fullKeys);
      
      return values.map(v => v ? JSON.parse(v) as T : null);
    } catch (error) {
      logger.error({ err: error, keys }, 'Cache mget error');
      return keys.map(() => null);
    }
  }

  /**
   * Set multiple keys at once
   */
  static async mset(
    entries: Array<{ key: string; value: any }>,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const { prefix = DEFAULT_PREFIX } = options;
      const pipeline = redis.pipeline();
      
      for (const { key, value } of entries) {
        const fullKey = `${prefix}:${key}`;
        const serialized = JSON.stringify(value);
        pipeline.set(fullKey, serialized);
        
        if (options.ttl && options.ttl > 0) {
          pipeline.expire(fullKey, options.ttl);
        }
      }
      
      await pipeline.exec();
    } catch (error) {
      logger.error({ err: error, count: entries.length }, 'Cache mset error');
    }
  }
}

/**
 * Specialized cache helpers for common use cases
 */
export const TrendsCache = {
  get: (timeRange: string) => 
    CacheService.get(`trends:${timeRange}`, 'analytics'),
  
  set: (timeRange: string, data: any, ttl = 1800) => 
    CacheService.set(`trends:${timeRange}`, data, { ttl, prefix: 'analytics' }),
  
  invalidate: () => 
    CacheService.invalidatePattern('trends:*', 'analytics'),
};

export const ProductCache = {
  get: (productId: string) => 
    CacheService.get(`product:${productId}`, 'products'),
  
  set: (productId: string, data: any, ttl = 3600) => 
    CacheService.set(`product:${productId}`, data, { ttl, prefix: 'products' }),
  
  invalidate: (productId: string) => 
    CacheService.delete(`product:${productId}`, 'products'),
};

export const JobCache = {
  get: (jobId: string) => 
    CacheService.get(`job:${jobId}`, 'jobs'),
  
  set: (jobId: string, data: any, ttl = 600) => 
    CacheService.set(`job:${jobId}`, data, { ttl, prefix: 'jobs' }),
  
  invalidate: (jobId: string) => 
    CacheService.delete(`job:${jobId}`, 'jobs'),
};
