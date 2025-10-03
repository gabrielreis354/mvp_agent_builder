import { NextRequest, NextResponse } from 'next/server';
import { checkRedisHealth } from '@/lib/queue/redis-client';

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Check Redis connection
    const redisHealthy = await checkRedisHealth();
    
    // Check database connection (when implemented)
    // const dbHealthy = await checkDatabaseHealth();
    
    const responseTime = Date.now() - startTime;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      responseTime: `${responseTime}ms`,
      services: {
        redis: redisHealthy ? 'healthy' : 'unhealthy',
        // database: dbHealthy ? 'healthy' : 'unhealthy',
        ai_providers: {
          openai: process.env.OPENAI_API_KEY ? 'configured' : 'not_configured',
          anthropic: process.env.ANTHROPIC_API_KEY ? 'configured' : 'not_configured',
          google: process.env.GOOGLE_AI_API_KEY ? 'configured' : 'not_configured'
        }
      },
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        external: Math.round(process.memoryUsage().external / 1024 / 1024)
      }
    };

    // Determine overall health
    const isHealthy = redisHealthy; // && dbHealthy (when database is implemented)
    
    return NextResponse.json(
      healthStatus,
      { 
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );

  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        services: {
          redis: 'unknown',
          ai_providers: 'unknown'
        }
      },
      { status: 503 }
    );
  }
}
