import { NextRequest, NextResponse } from 'next/server';
import { getAgentQueue } from '@/lib/queue/agent-queue';
import { checkRedisHealth } from '@/lib/queue/redis-client';

export async function GET(request: NextRequest) {
  try {
    // Check Redis health first
    const redisHealthy = await checkRedisHealth();
    
    if (!redisHealthy) {
      return NextResponse.json({
        success: false,
        error: 'Queue system unavailable - Redis connection failed',
        stats: null,
        redisHealthy: false,
      });
    }

    const queue = getAgentQueue();
    const stats = await queue.getQueueStats();

    return NextResponse.json({
      success: true,
      stats,
      redisHealthy: true,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error getting queue stats:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get queue statistics',
        details: error instanceof Error ? error.message : 'Unknown error',
        stats: null,
        redisHealthy: false,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      );
    }

    const queue = getAgentQueue();

    switch (action) {
      case 'pause':
        await queue.pauseQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue paused successfully',
        });

      case 'resume':
        await queue.resumeQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue resumed successfully',
        });

      case 'clean':
        await queue.cleanQueue();
        return NextResponse.json({
          success: true,
          message: 'Queue cleaned successfully',
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Supported actions: pause, resume, clean' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Error performing queue action:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform queue action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
