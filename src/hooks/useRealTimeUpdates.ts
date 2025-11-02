/**
 * Real-Time Updates Hook
 * 
 * Provides WebSocket-based real-time updates for pipeline status
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { logger } from '@/config/logger';

export interface PipelineUpdate {
  id: string;
  type: 'STAGE_STARTED' | 'STAGE_COMPLETED' | 'STAGE_FAILED' | 'JOB_UPDATE';
  stage?: 'scrape' | 'analyze' | 'generate' | 'list';
  jobId: string;
  status?: string;
  progress?: number;
  message?: string;
  timestamp: string;
  data?: any;
}

export interface UseRealTimeUpdatesOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useRealTimeUpdates(options: UseRealTimeUpdatesOptions = {}) {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 5,
  } = options;

  const [updates, setUpdates] = useState<PipelineUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const connect = useCallback(() => {
    // For now, use polling instead of WebSocket
    // WebSocket implementation would require a WebSocket server
    const pollInterval = 5000; // 5 seconds
    
    const poll = async () => {
      try {
        const response = await fetch('/api/pipeline/updates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch updates');
        }

        const data = await response.json();
        
        if (data.updates && Array.isArray(data.updates)) {
          setUpdates(prev => {
            const newUpdates = [...data.updates, ...prev];
            return newUpdates.slice(0, 50); // Keep last 50 updates
          });
        }

        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
      } catch (err) {
        console.error('[RealTimeUpdates] Polling error:', err);
        setIsConnected(false);
        setError(err as Error);

        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts) {
          setReconnectAttempts(prev => prev + 1);
        }
      }
    };

    // Initial poll
    poll();

    // Set up polling interval
    const intervalId = setInterval(poll, pollInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [reconnectAttempts, maxReconnectAttempts]);

  useEffect(() => {
    if (autoConnect) {
      const cleanup = connect();
      return cleanup;
    }
  }, [autoConnect, connect]);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  const addUpdate = useCallback((update: PipelineUpdate) => {
    setUpdates(prev => [update, ...prev].slice(0, 50));
  }, []);

  return {
    updates,
    isConnected,
    error,
    reconnectAttempts,
    clearUpdates,
    addUpdate,
    connect,
  };
}

/**
 * Hook for monitoring specific job status
 */
export function useJobStatus(jobId: string | null) {
  const [status, setStatus] = useState<{
    stage: string;
    status: string;
    progress: number;
    error?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    const fetchStatus = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/jobs/${jobId}/status`);
        if (response.ok) {
          const data = await response.json();
          setStatus(data);
        }
      } catch (err) {
        console.error('[JobStatus] Fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStatus();
    const intervalId = setInterval(fetchStatus, 3000); // Poll every 3 seconds

    return () => clearInterval(intervalId);
  }, [jobId]);

  return { status, isLoading };
}

/**
 * Hook for monitoring system health
 */
export function useSystemHealth() {
  const [health, setHealth] = useState<{
    status: 'healthy' | 'degraded' | 'down';
    services: {
      database: boolean;
      redis: boolean;
      workers: boolean;
    };
    metrics: {
      activeJobs: number;
      queuedJobs: number;
      failedJobs: number;
    };
  } | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (response.ok) {
          const data = await response.json();
          setHealth(data);
        }
      } catch (err) {
        console.error('[SystemHealth] Fetch error:', err);
        setHealth({
          status: 'down',
          services: {
            database: false,
            redis: false,
            workers: false,
          },
          metrics: {
            activeJobs: 0,
            queuedJobs: 0,
            failedJobs: 0,
          },
        });
      }
    };

    fetchHealth();
    const intervalId = setInterval(fetchHealth, 10000); // Poll every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  return health;
}
