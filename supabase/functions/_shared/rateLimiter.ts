/**
 * Simple in-memory rate limiter for edge functions
 * Uses token bucket algorithm
 */

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests per window
  windowMs: number;     // Time window in milliseconds
}

interface RequestRecord {
  count: number;
  resetTime: number;
}

// In-memory store (will reset on function cold start)
const requestStore = new Map<string, RequestRecord>();

export class RateLimiter {
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  /**
   * Check if request is allowed for given identifier (IP or user ID)
   */
  isAllowed(identifier: string): { allowed: boolean; resetTime: number } {
    const now = Date.now();
    const record = requestStore.get(identifier);

    // No record or window expired - allow and create new record
    if (!record || now >= record.resetTime) {
      requestStore.set(identifier, {
        count: 1,
        resetTime: now + this.config.windowMs,
      });
      return { allowed: true, resetTime: now + this.config.windowMs };
    }

    // Within window - check count
    if (record.count < this.config.maxRequests) {
      record.count++;
      requestStore.set(identifier, record);
      return { allowed: true, resetTime: record.resetTime };
    }

    // Rate limit exceeded
    return { allowed: false, resetTime: record.resetTime };
  }

  /**
   * Clean up expired records (optional maintenance)
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of requestStore.entries()) {
      if (now >= record.resetTime) {
        requestStore.delete(key);
      }
    }
  }
}

/**
 * Get client identifier from request (IP address or user ID)
 */
export function getClientIdentifier(req: Request, userId?: string): string {
  if (userId) return `user:${userId}`;
  
  // Try to get real IP from various headers
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  
  // Fallback to connection info
  return 'unknown';
}

/**
 * Create standardized rate limit response
 */
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  return new Response(
    JSON.stringify({ 
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter 
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
      },
    }
  );
}
