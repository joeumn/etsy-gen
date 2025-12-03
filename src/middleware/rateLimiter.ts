/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse with Redis-backed rate limiting
 */

import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/config/redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  message: 'Too many requests from this IP, please try again later.',
};

/**
 * Create a rate limiter with specified configuration
 */
export function createRateLimiter(config: Partial<RateLimitConfig> = {}) {
  const { windowMs, maxRequests, message } = { ...defaultConfig, ...config };
  
  return async (request: NextRequest): Promise<NextResponse | null> => {
    try {
      const ip = request.headers.get('x-forwarded-for') || 
                 request.headers.get('x-real-ip') || 
                 'unknown';
      
      const key = `ratelimit:${ip}:${request.nextUrl.pathname}`;
      
      // Get current count
      const current = await redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      
      if (count >= maxRequests) {
        return NextResponse.json(
          { 
            error: message,
            retryAfter: Math.ceil(windowMs / 1000)
          },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Limit': maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString(),
              'Retry-After': Math.ceil(windowMs / 1000).toString(),
            }
          }
        );
      }
      
      // Increment counter
      const newCount = count + 1;
      await redis.setex(key, Math.ceil(windowMs / 1000), newCount.toString());
      
      // Add rate limit headers to response
      const response = NextResponse.next();
      response.headers.set('X-RateLimit-Limit', maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', (maxRequests - newCount).toString());
      
      return null; // Allow request to continue
    } catch (error) {
      console.error('[RateLimit] Error checking rate limit:', error);
      // On error, allow request to continue (fail open)
      return null;
    }
  };
}

/**
 * Predefined rate limiters for different endpoint types
 */
export const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: 'Too many authentication attempts, please try again later.',
  }),
  
  // Standard API rate limit
  api: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100,
  }),
  
  // Generous limit for dashboard/UI endpoints
  dashboard: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
  }),
  
  // Strict limit for expensive AI operations
  aiGeneration: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 20,
    message: 'AI generation limit reached, please try again later.',
  }),
};
