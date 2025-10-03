import Bull from 'bull';
import { getRedisClient } from './redis-client';
import { AgentNode, AgentEdge } from '@/types/agent';
import { runtimeEngine } from '@/lib/runtime/engine';

export interface AgentExecutionJob {
  id: string;
  agentId: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  inputData: Record<string, any>;
  userId?: string;
  priority?: number;
  metadata?: Record<string, any>;
}

export interface AgentExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
  executionTime: number;
  tokensUsed: number;
  cost: number;
  logs: string[];
}

export class AgentQueue {
  private queue: Bull.Queue<AgentExecutionJob>;

  constructor() {
    const redis = getRedisClient();
    
    this.queue = new Bull('agent-execution', {
      redis: {
        port: redis.options.port || 6379,
        host: redis.options.host || 'localhost',
        password: redis.options.password,
        db: redis.options.db || 0,
      },
      defaultJobOptions: {
        removeOnComplete: 50, // Keep last 50 completed jobs
        removeOnFail: 100,    // Keep last 100 failed jobs
        attempts: 3,          // Retry failed jobs 3 times
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    this.setupJobProcessors();
    this.setupEventHandlers();
  }

  private setupJobProcessors() {
    // Process agent execution jobs
    this.queue.process('execute-agent', 5, async (job) => {
      const startTime = Date.now();
      const { id, agentId, nodes, edges, inputData, userId, metadata } = job.data;

      try {
        console.log(`Starting agent execution: ${id} for agent: ${agentId}`);
        
        // Update job progress
        await job.progress(10);

        // Execute the agent
        const agent = {
          id: agentId,
          name: `Agent ${agentId}`,
          description: 'Queue execution',
          category: 'general',
          nodes,
          edges
        };
        
        const result = await runtimeEngine.executeAgent(
          agent,
          inputData,
          'queue-execution'
        );

        await job.progress(95);

        const executionTime = Date.now() - startTime;
        
        // Calculate metrics
        const tokensUsed = this.calculateTokensUsed(result);
        const cost = this.calculateCost(result);
        const logs = this.extractLogs(result);

        await job.progress(100);

        const executionResult: AgentExecutionResult = {
          success: true,
          result: result.output,
          executionTime,
          tokensUsed,
          cost,
          logs
        };

        console.log(`Agent execution completed: ${id} in ${executionTime}ms`);
        return executionResult;

      } catch (error) {
        const executionTime = Date.now() - startTime;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        console.error(`Agent execution failed: ${id}`, error);
        
        const executionResult: AgentExecutionResult = {
          success: false,
          error: errorMessage,
          executionTime,
          tokensUsed: 0,
          cost: 0,
          logs: [`Error: ${errorMessage}`]
        };

        throw new Error(JSON.stringify(executionResult));
      }
    });
  }

  private setupEventHandlers() {
    this.queue.on('completed', (job, result) => {
      console.log(`Job ${job.id} completed successfully`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`Job ${job.id} failed:`, err.message);
    });

    this.queue.on('stalled', (job) => {
      console.warn(`Job ${job.id} stalled`);
    });

    this.queue.on('progress', (job, progress) => {
      console.log(`Job ${job.id} progress: ${progress}%`);
    });
  }

  async addExecutionJob(
    agentId: string,
    nodes: AgentNode[],
    edges: AgentEdge[],
    inputData: Record<string, any>,
    options: {
      priority?: number;
      delay?: number;
      userId?: string;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const jobId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const jobData: AgentExecutionJob = {
      id: jobId,
      agentId,
      nodes,
      edges,
      inputData,
      userId: options.userId,
      priority: options.priority || 0,
      metadata: options.metadata || {}
    };

    const job = await this.queue.add('execute-agent', jobData, {
      priority: options.priority || 0,
      delay: options.delay || 0,
      jobId,
    });

    return job.id as string;
  }

  async getJobStatus(jobId: string): Promise<{
    status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
    progress: number;
    result?: AgentExecutionResult;
    error?: string;
    createdAt: Date;
    processedAt?: Date;
    finishedAt?: Date;
  } | null> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) return null;

      const state = await job.getState();
      const progress = job.progress();

      return {
        status: state as any,
        progress: typeof progress === 'number' ? progress : 0,
        result: job.returnvalue,
        error: job.failedReason,
        createdAt: new Date(job.timestamp),
        processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
        finishedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
      };
    } catch (error) {
      console.error('Error getting job status:', error);
      return null;
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    try {
      const job = await this.queue.getJob(jobId);
      if (!job) return false;

      await job.remove();
      return true;
    } catch (error) {
      console.error('Error canceling job:', error);
      return false;
    }
  }

  async getQueueStats(): Promise<{
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
  }> {
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      this.queue.getWaiting(),
      this.queue.getActive(),
      this.queue.getCompleted(),
      this.queue.getFailed(),
      this.queue.getDelayed(),
      Promise.resolve([]),
    ]);

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length,
      paused: paused.length,
    };
  }

  async pauseQueue(): Promise<void> {
    await this.queue.pause();
  }

  async resumeQueue(): Promise<void> {
    await this.queue.resume();
  }

  async cleanQueue(): Promise<void> {
    await this.queue.clean(24 * 60 * 60 * 1000, 'completed'); // Clean completed jobs older than 24h
    await this.queue.clean(7 * 24 * 60 * 60 * 1000, 'failed'); // Clean failed jobs older than 7 days
  }

  private calculateTokensUsed(result: any): number {
    // Extract token usage from execution result
    if (result?.metrics?.totalTokens) {
      return result.metrics.totalTokens;
    }
    return 0;
  }

  private calculateCost(result: any): number {
    // Extract cost from execution result
    if (result?.metrics?.totalCost) {
      return result.metrics.totalCost;
    }
    return 0;
  }

  private extractLogs(result: any): string[] {
    // Extract logs from execution result
    if (result?.logs && Array.isArray(result.logs)) {
      return result.logs;
    }
    return [];
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}

// Singleton instance
let agentQueue: AgentQueue | null = null;

export function getAgentQueue(): AgentQueue {
  if (!agentQueue) {
    agentQueue = new AgentQueue();
  }
  return agentQueue;
}
