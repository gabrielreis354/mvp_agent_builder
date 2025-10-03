import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest } from 'next/server';

// Check if Redis is properly configured
const isRedisConfigured = process.env.UPSTASH_REDIS_REST_URL && 
                         process.env.UPSTASH_REDIS_REST_URL !== 'disabled' &&
                         process.env.UPSTASH_REDIS_REST_TOKEN &&
                         process.env.UPSTASH_REDIS_REST_TOKEN !== 'disabled';

// Initialize Redis client for rate limiting (only if properly configured)
const redis = isRedisConfigured ? Redis.fromEnv() : null;

// Different rate limiters for different endpoints (only if Redis is available)
export const rateLimiters = redis ? {
  // General API rate limiting
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
  }),

  // Agent execution rate limiting (more restrictive)
  execution: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 executions per minute
    analytics: true,
  }),

  // Authentication rate limiting
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 auth attempts per minute
    analytics: true,
  }),

  // File upload rate limiting
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20 uploads per hour
    analytics: true,
  }),

  // Queue operations rate limiting
  queue: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 queue operations per minute
    analytics: true,
  }),
} : null;

// Helper function to get client identifier
export function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from session/token first
  const userId = request.headers.get('x-user-id');
  if (userId) return `user:${userId}`;

  // Fallback to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || realIp || 'unknown';
  
  return `ip:${ip}`;
}

// Rate limiting middleware function
export async function checkRateLimit(
  request: NextRequest,
  limiterType: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: Date }> {
  // Always allow if Redis is not configured or in development
  if (!rateLimiters || process.env.NODE_ENV === 'development') {
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 60000),
    };
  }

  const identifier = getClientIdentifier(request);
  const limiter = rateLimiters[limiterType as keyof typeof rateLimiters];

  if (!limiter) {
    // If specific limiter doesn't exist, allow the request
    return {
      success: true,
      limit: 1000,
      remaining: 999,
      reset: new Date(Date.now() + 60000),
    };
  }

  try {
    const result = await limiter.limit(identifier);
    
    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: new Date(result.reset),
    };
  } catch (error) {
    console.error('Rate limiting error:', error);
    // Allow request if rate limiter fails
    return {
      success: true,
      limit: 0,
      remaining: 0,
      reset: new Date(),
    };
  }
}

// Rate limit response headers
export function getRateLimitHeaders(result: {
  limit: number;
  remaining: number;
  reset: Date;
}) {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.reset.getTime() / 1000).toString(),
  };
}
