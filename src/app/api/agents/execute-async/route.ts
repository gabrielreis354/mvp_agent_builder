import { NextRequest, NextResponse } from 'next/server';
import { getAgentQueue } from '@/lib/queue/agent-queue';
import { checkRedisHealth } from '@/lib/queue/redis-client';

export async function POST(request: NextRequest) {
  try {
    const { agentId, nodes, edges, inputData, priority = 0, userId } = await request.json();

    // Validate required fields
    if (!agentId || !nodes || !edges) {
      return NextResponse.json(
        { error: 'Missing required fields: agentId, nodes, edges' },
        { status: 400 }
      );
    }

    // Check Redis health
    const redisHealthy = await checkRedisHealth();
    if (!redisHealthy) {
      return NextResponse.json(
        { error: 'Queue system unavailable - Redis connection failed' },
        { status: 503 }
      );
    }

    // Add job to queue
    const queue = getAgentQueue();
    const jobId = await queue.addExecutionJob(
      agentId,
      nodes,
      edges,
      inputData || {},
      {
        priority,
        userId,
        metadata: {
          requestTime: new Date().toISOString(),
          userAgent: request.headers.get('user-agent'),
        }
      }
    );

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Agent execution queued successfully',
      estimatedWaitTime: await getEstimatedWaitTime(),
    });

  } catch (error) {
    console.error('Error queuing agent execution:', error);
    return NextResponse.json(
      { 
        error: 'Failed to queue agent execution',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function getEstimatedWaitTime(): Promise<string> {
  try {
    const queue = getAgentQueue();
    const stats = await queue.getQueueStats();
    
    // Simple estimation: 30 seconds per job in queue
    const totalJobs = stats.waiting + stats.active;
    const estimatedSeconds = totalJobs * 30;
    
    if (estimatedSeconds < 60) {
      return `${estimatedSeconds} seconds`;
    } else if (estimatedSeconds < 3600) {
      return `${Math.ceil(estimatedSeconds / 60)} minutes`;
    } else {
      return `${Math.ceil(estimatedSeconds / 3600)} hours`;
    }
  } catch (error) {
    return 'Unknown';
  }
}
