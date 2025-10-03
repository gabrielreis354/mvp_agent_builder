'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Trash2, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity
} from 'lucide-react';

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
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

export function QueueMonitor() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [jobs, setJobs] = useState<JobStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [redisHealthy, setRedisHealthy] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/queue/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.stats);
        setRedisHealthy(data.redisHealthy);
      } else {
        setRedisHealthy(false);
      }
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      setRedisHealthy(false);
    } finally {
      setLoading(false);
    }
  };

  const performQueueAction = async (action: 'pause' | 'resume' | 'clean') => {
    try {
      const response = await fetch('/api/queue/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchStats(); // Refresh stats
      }
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'active':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'delayed':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-gray-500" />;
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
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading queue status...</span>
      </div>
    );
  }

  if (!redisHealthy) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <XCircle className="h-5 w-5 mr-2" />
            Queue System Unavailable
          </CardTitle>
          <CardDescription>
            Redis connection failed. The queue system is not operational.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            To enable the queue system, make sure Redis is running and properly configured.
          </p>
          <Button onClick={fetchStats} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Queue Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Queue Statistics
          </CardTitle>
          <CardDescription>
            Real-time monitoring of agent execution queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.waiting}</div>
                <div className="text-sm text-gray-500">Waiting</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.delayed}</div>
                <div className="text-sm text-gray-500">Delayed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">{stats.paused}</div>
                <div className="text-sm text-gray-500">Paused</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Queue Controls</CardTitle>
          <CardDescription>
            Manage the agent execution queue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => performQueueAction('pause')} 
              variant="outline"
              size="sm"
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause Queue
            </Button>
            <Button 
              onClick={() => performQueueAction('resume')} 
              variant="outline"
              size="sm"
            >
              <Play className="h-4 w-4 mr-2" />
              Resume Queue
            </Button>
            <Button 
              onClick={() => performQueueAction('clean')} 
              variant="outline"
              size="sm"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clean Old Jobs
            </Button>
            <Button 
              onClick={fetchStats} 
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800">
              Redis Connected
            </Badge>
            <Badge className="bg-blue-100 text-blue-800">
              Queue Operational
            </Badge>
            <span className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
