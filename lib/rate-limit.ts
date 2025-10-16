/**
 * Rate Limiting Utilities
 * 
 * Provides request rate limiting to prevent abuse and ensure fair usage
 */

import { RateLimitError } from './errors';
import { logSecurityEvent } from './logger';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limits
const rateLimitStore = new Map<string, RateLimitStore>();

/**
 * Rate limit configurations by plan
 */
export const RATE_LIMITS = {
  free: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'), // 1 minute
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  pro: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_PRO || '500'),
  },
  enterprise: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_ENTERPRISE || '2000'),
  },
};

/**
 * Check rate limit for a key
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = RATE_LIMITS.free
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  let store = rateLimitStore.get(key);
  
  // Initialize or reset if window expired
  if (!store || now > store.resetTime) {
    store = {
      count: 0,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, store);
  }
  
  // Increment counter
  store.count++;
  
  // Check if limit exceeded
  if (store.count > config.maxRequests) {
    logSecurityEvent(
      'rate_limit_exceeded',
      'medium',
      undefined,
      { identifier, count: store.count, limit: config.maxRequests }
    );
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: store.resetTime,
    };
  }
  
  return {
    allowed: true,
    remaining: config.maxRequests - store.count,
    resetTime: store.resetTime,
  };
}

/**
 * Rate limit middleware for API routes
 */
export function rateLimit(
  identifier: string,
  plan: 'free' | 'pro' | 'enterprise' = 'free'
): void {
  const config = RATE_LIMITS[plan];
  const result = checkRateLimit(identifier, config);
  
  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
    throw new RateLimitError(
      `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
      retryAfter
    );
  }
}

/**
 * Get rate limit status for a key
 */
export function getRateLimitStatus(
  identifier: string,
  plan: 'free' | 'pro' | 'enterprise' = 'free'
): { count: number; limit: number; remaining: number; resetTime: number } {
  const config = RATE_LIMITS[plan];
  const key = `ratelimit:${identifier}`;
  const store = rateLimitStore.get(key);
  
  if (!store || Date.now() > store.resetTime) {
    return {
      count: 0,
      limit: config.maxRequests,
      remaining: config.maxRequests,
      resetTime: Date.now() + config.windowMs,
    };
  }
  
  return {
    count: store.count,
    limit: config.maxRequests,
    remaining: Math.max(0, config.maxRequests - store.count),
    resetTime: store.resetTime,
  };
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(identifier: string): void {
  const key = `ratelimit:${identifier}`;
  rateLimitStore.delete(key);
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredRateLimits(): void {
  const now = Date.now();
  const keysToDelete: string[] = [];
  
  const entries = Array.from(rateLimitStore.entries());
  for (const [key, store] of entries) {
    if (now > store.resetTime) {
      keysToDelete.push(key);
    }
  }
  
  keysToDelete.forEach(key => rateLimitStore.delete(key));
}

// Clean up expired rate limits every minute
if (typeof global !== 'undefined') {
  setInterval(() => {
    cleanupExpiredRateLimits();
  }, 60 * 1000);
}

