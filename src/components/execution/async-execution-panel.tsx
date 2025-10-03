'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  X
} from 'lucide-react';
import { AgentNode, AgentEdge } from '@/types/agent';

interface AsyncExecutionPanelProps {
  agentId: string;
  nodes: AgentNode[];
  edges: AgentEdge[];
  inputData: Record<string, any>;
  onClose?: () => void;
}

interface JobStatus {
  jobId: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused';
  progress: number;
  result?: any;
  error?: string;
  createdAt: string;
  processedAt?: string;
  finishedAt?: string;
}

export function AsyncExecutionPanel({ 
  agentId, 
  nodes, 
  edges, 
  inputData, 
  onClose 
}: AsyncExecutionPanelProps) {
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState<string>('');

  const startAsyncExecution = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/agents/execute-async', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId,
          nodes,
          edges,
          inputData,
          priority: 0,
          userId: 'current-user' // TODO: Get from auth context
        }),
      });

      const data = await response.json();

      if (data.success) {
        setJobId(data.jobId);
        setEstimatedWaitTime(data.estimatedWaitTime);
        startPolling(data.jobId);
      } else {
        setError(data.error || 'Failed to start execution');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (id: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/agents/job-status/${id}`);
        const data = await response.json();

        if (data.success) {
          setJobStatus(data);
          
          // Stop polling if job is completed or failed
          if (data.status === 'completed' || data.status === 'failed') {
            clearInterval(pollInterval);
          }
        }
      } catch (err) {
        console.error('Error polling job status:', err);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup interval on unmount
    return () => clearInterval(pollInterval);
  };

  const cancelJob = async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`/api/agents/job-status/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setJobStatus(null);
        setJobId(null);
      }
    } catch (err) {
      console.error('Error cancelling job:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'delayed':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start);
    const endTime = end ? new Date(end) : new Date();
    const duration = endTime.getTime() - startTime.getTime();
    
    if (duration < 1000) return `${duration}ms`;
    if (duration < 60000) return `${Math.round(duration / 1000)}s`;
    return `${Math.round(duration / 60000)}m`;
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Async Agent Execution
            </CardTitle>
            <CardDescription>
              Execute agent in background queue for long-running tasks
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert className="border-red-200">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!jobId && !loading && (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Start asynchronous execution to run this agent in the background queue.
              This is ideal for long-running tasks that might take several minutes.
            </p>
            <Button onClick={startAsyncExecution} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Async Execution
            </Button>
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-4" />
            <p>Queuing agent execution...</p>
          </div>
        )}

        {jobId && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Job ID: {jobId}</p>
                {estimatedWaitTime && (
                  <p className="text-sm text-gray-600">
                    Estimated wait time: {estimatedWaitTime}
                  </p>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={cancelJob}>
                Cancel
              </Button>
            </div>

            {jobStatus && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(jobStatus.status)}
                    <Badge className={getStatusColor(jobStatus.status)}>
                      {jobStatus.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDuration(jobStatus.createdAt, jobStatus.finishedAt)}
                  </span>
                </div>

                {jobStatus.progress > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span>{Math.round(jobStatus.progress)}%</span>
                    </div>
                    <Progress value={jobStatus.progress} />
                  </div>
                )}

                {jobStatus.status === 'completed' && jobStatus.result && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-green-700">Execution Completed</h4>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Execution Time:</span>
                          <span className="ml-2">{jobStatus.result.executionTime}ms</span>
                        </div>
                        <div>
                          <span className="font-medium">Tokens Used:</span>
                          <span className="ml-2">{jobStatus.result.tokensUsed}</span>
                        </div>
                        <div>
                          <span className="font-medium">Cost:</span>
                          <span className="ml-2">${jobStatus.result.cost.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="font-medium">Success:</span>
                          <span className="ml-2">{jobStatus.result.success ? 'Yes' : 'No'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Result
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                )}

                {jobStatus.status === 'failed' && jobStatus.error && (
                  <Alert className="border-red-200">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Execution Failed:</strong> {jobStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-xs text-gray-500 space-y-1">
                  <div>Created: {new Date(jobStatus.createdAt).toLocaleString()}</div>
                  {jobStatus.processedAt && (
                    <div>Started: {new Date(jobStatus.processedAt).toLocaleString()}</div>
                  )}
                  {jobStatus.finishedAt && (
                    <div>Finished: {new Date(jobStatus.finishedAt).toLocaleString()}</div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
