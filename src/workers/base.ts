import { Worker, type Processor, type WorkerOptions, type Job } from "bullmq";
import { logger } from "../config/logger";
import { workerConcurrency } from "../queues";
import { redis } from "../config/redis";

const baseOptions: Omit<WorkerOptions, "connection"> = {
  concurrency: workerConcurrency,
  // Circuit breaker settings
  maxStalledCount: 2,
  stalledInterval: 30000,
};

/**
 * Dead Letter Queue - stores permanently failed jobs for analysis
 */
export async function moveToDeadLetterQueue(
  queueName: string,
  job: Job,
  error: Error
): Promise<void> {
  try {
    const dlqKey = `dlq:${queueName}:${job.id}`;
    const dlqData = {
      jobId: job.id,
      queueName,
      data: job.data,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      attempts: job.attemptsMade,
      timestamp: new Date().toISOString(),
      failedAt: new Date().toISOString(),
    };
    
    // Store in Redis with 30-day expiration
    await redis.setex(dlqKey, 30 * 24 * 60 * 60, JSON.stringify(dlqData));
    
    logger.error(
      { queueName, jobId: job.id, error: error.message },
      'Job moved to dead letter queue'
    );
  } catch (dlqError) {
    logger.error(
      { err: dlqError, queueName, jobId: job.id },
      'Failed to move job to DLQ'
    );
  }
}

/**
 * Circuit breaker state tracking
 */
const circuitBreakerState = new Map<string, {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}>();

const CIRCUIT_BREAKER_THRESHOLD = 5;
const CIRCUIT_BREAKER_TIMEOUT = 60000; // 1 minute

export function checkCircuitBreaker(queueName: string): boolean {
  const state = circuitBreakerState.get(queueName);
  
  if (!state || state.state === 'closed') {
    return true; // Allow execution
  }
  
  if (state.state === 'open') {
    // Check if enough time has passed to try again
    if (Date.now() - state.lastFailure > CIRCUIT_BREAKER_TIMEOUT) {
      state.state = 'half-open';
      circuitBreakerState.set(queueName, state);
      logger.info({ queueName }, 'Circuit breaker entering half-open state');
      return true;
    }
    return false; // Circuit is open, reject
  }
  
  // half-open state - allow one request through
  return true;
}

export function recordCircuitBreakerFailure(queueName: string): void {
  const state = circuitBreakerState.get(queueName) || {
    failures: 0,
    lastFailure: 0,
    state: 'closed' as const,
  };
  
  state.failures++;
  state.lastFailure = Date.now();
  
  if (state.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    state.state = 'open';
    logger.warn(
      { queueName, failures: state.failures },
      'Circuit breaker opened due to repeated failures'
    );
  }
  
  circuitBreakerState.set(queueName, state);
}

export function recordCircuitBreakerSuccess(queueName: string): void {
  const state = circuitBreakerState.get(queueName);
  
  if (state) {
    if (state.state === 'half-open') {
      // Success in half-open state - close the circuit
      state.state = 'closed';
      state.failures = 0;
      logger.info({ queueName }, 'Circuit breaker closed after successful execution');
    } else if (state.failures > 0) {
      // Reduce failure count on success
      state.failures = Math.max(0, state.failures - 1);
    }
    
    circuitBreakerState.set(queueName, state);
  }
}

export const createWorker = <T = unknown>(
  name: string,
  processor: Processor<T>,
  options?: Partial<WorkerOptions>,
) => {
  // Wrap processor with circuit breaker and error handling
  const enhancedProcessor: Processor<T> = async (job, token) => {
    // Check circuit breaker
    if (!checkCircuitBreaker(name)) {
      const error = new Error('Circuit breaker is open - rejecting job');
      logger.warn({ queue: name, jobId: job.id }, error.message);
      throw error;
    }
    
    try {
      const result = await processor(job, token);
      recordCircuitBreakerSuccess(name);
      return result;
    } catch (error) {
      recordCircuitBreakerFailure(name);
      
      // If this is the last attempt, move to DLQ
      const maxAttempts = job.opts?.attempts ?? 3;
      if (job.attemptsMade >= maxAttempts - 1) {
        await moveToDeadLetterQueue(name, job, error as Error);
      }
      
      throw error;
    }
  };
  
  const worker = new Worker<T>(name, enhancedProcessor, {
    ...baseOptions,
    ...options,
    concurrency: options?.concurrency ?? baseOptions.concurrency,
    connection: redis.duplicate(),
  });

  worker.on("failed", (job, error) => {
    const maxAttempts = job?.opts?.attempts ?? 3;
    const isLastAttempt = job && job.attemptsMade >= maxAttempts;
    
    logger.error(
      {
        queue: name,
        jobId: job?.id,
        attemptsMade: job?.attemptsMade,
        maxAttempts,
        isLastAttempt,
        err: error,
      },
      "Queue job failed",
    );
  });

  worker.on("completed", (job) => {
    logger.debug({ queue: name, jobId: job?.id }, "Queue job completed");
  });

  worker.on("stalled", (jobId) => {
    logger.warn({ queue: name, jobId }, "Queue job stalled");
  });

  worker.on("error", (error) => {
    logger.error({ queue: name, err: error }, "Worker error");
  });

  return worker;
};
