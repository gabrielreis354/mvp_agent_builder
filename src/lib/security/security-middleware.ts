import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, getRateLimitHeaders } from './rate-limiter';
import { getToken } from 'next-auth/jwt';

// Security headers configuration
export const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
};

// Input validation and sanitization
export function validateInputData(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for common injection patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /expression\s*\(/gi,
    /vbscript:/gi,
    /data:text\/html/gi,
  ];

  function checkValue(value: any, path = ''): void {
    if (typeof value === 'string') {
      for (const pattern of dangerousPatterns) {
        if (pattern.test(value)) {
          errors.push(`Potentially dangerous content detected in ${path || 'input'}: ${pattern.source}`);
        }
      }
      
      // Check for SQL injection patterns
      const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/gi,
        /('|(\\')|(;)|(--)|(\|)|(\*)|(%27)|(%3D)|(%3B)|(%2D%2D))/gi,
      ];
      
      for (const pattern of sqlPatterns) {
        if (pattern.test(value)) {
          errors.push(`Potential SQL injection detected in ${path || 'input'}`);
        }
      }
    } else if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => checkValue(item, `${path}[${index}]`));
      } else {
        Object.entries(value).forEach(([key, val]) => 
          checkValue(val, path ? `${path}.${key}` : key)
        );
      }
    }
  }

  try {
    checkValue(data);
  } catch (error) {
    errors.push('Invalid input format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// API security middleware
export async function withSecurity(
  request: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: {
    requireAuth?: boolean;
    rateLimitType?: 'api' | 'execution' | 'auth' | 'upload' | 'queue';
    validateInput?: boolean;
    allowedMethods?: string[];
    adminOnly?: boolean;
  } = {}
): Promise<NextResponse> {
  const {
    requireAuth = false,
    rateLimitType = 'api',
    validateInput = true,
    allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    adminOnly = false,
  } = options;

  try {
    // Method validation
    if (!allowedMethods.includes(request.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405, headers: { Allow: allowedMethods.join(', ') } }
      );
    }

    // Rate limiting
    const rateLimitResult = await checkRateLimit(request, rateLimitType);
    const rateLimitHeaders = getRateLimitHeaders(rateLimitResult);

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
        },
        { 
          status: 429,
          headers: {
            ...rateLimitHeaders,
            'Retry-After': Math.ceil((rateLimitResult.reset.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // Authentication check
    let token = null;
    if (requireAuth || adminOnly) {
      token = await getToken({ req: request });
      
      if (!token) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401, headers: rateLimitHeaders }
        );
      }

      // Admin role check
      if (adminOnly && token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        return NextResponse.json(
          { error: 'Admin access required' },
          { status: 403, headers: rateLimitHeaders }
        );
      }
    }

    // Input validation for POST/PUT/PATCH requests
    if (validateInput && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
      try {
        const body = await request.clone().json();
        const validation = validateInputData(body);
        
        if (!validation.isValid) {
          return NextResponse.json(
            { 
              error: 'Invalid input',
              details: validation.errors,
            },
            { status: 400, headers: rateLimitHeaders }
          );
        }
      } catch (error) {
        // If JSON parsing fails, let the handler deal with it
      }
    }

    // Add user info to request headers for downstream handlers
    if (token) {
      // Clone the request and add user headers
      const headers = new Headers(request.headers);
      headers.set('x-user-id', token.userId as string);
      headers.set('x-user-role', token.role as string);
      
      const requestInit: any = {
        method: request.method,
        headers: headers,
      };
      
      if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
        requestInit.body = request.body;
        requestInit.duplex = 'half';
      }
      
      const modifiedRequest = new NextRequest(request.url, requestInit);
      
      const response = await handler(modifiedRequest);
      
      // Add security headers to response
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      // Add rate limit headers
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      
      return response;
    }

    // Execute handler
    const response = await handler(request);
    
    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    // Add rate limit headers
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    
    return response;

  } catch (error) {
    console.error('Security middleware error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// CORS configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS || 'https://yourdomain.com'
    : '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

// CORS preflight handler
export function handleCors(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  return null;
}
