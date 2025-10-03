import { NextRequest, NextResponse } from 'next/server';
import { getAgentQueue } from '@/lib/queue/agent-queue';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const queue = getAgentQueue();
    const jobStatus = await queue.getJobStatus(jobId);

    if (!jobStatus) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      jobId,
      ...jobStatus,
    });

  } catch (error) {
    console.error('Error getting job status:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get job status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  try {
    const { jobId } = params;

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const queue = getAgentQueue();
    const cancelled = await queue.cancelJob(jobId);

    if (!cancelled) {
      return NextResponse.json(
        { error: 'Job not found or could not be cancelled' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Job cancelled successfully',
    });

  } catch (error) {
    console.error('Error cancelling job:', error);
    return NextResponse.json(
      { 
        error: 'Failed to cancel job',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
