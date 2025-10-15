/**
 * Performance Optimization Utilities
 * 
 * Provides utilities for optimizing application performance
 */

import { logError } from './logger';

/**
 * Debounce function execution
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function execution
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Batch multiple async operations
 */
export async function batchAsync<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>
): Promise<R[]> {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    try {
      const batchResults = await processor(batch);
      results.push(...batchResults);
    } catch (error) {
      logError(error, 'BatchAsync', { batchIndex: i / batchSize });
      throw error;
    }
  }

  return results;
}

/**
 * Parallel execution with concurrency limit
 */
export async function parallelLimit<T, R>(
  items: T[],
  concurrency: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  const entries = Array.from(items.entries());
  for (const [index, item] of entries) {
    const promise = processor(item).then((result) => {
      results[index] = result;
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * Retry failed operations
 */
export async function retry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number;
    delay?: number;
    backoff?: boolean;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
  } = options;

  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxAttempts) {
        if (onRetry) {
          onRetry(attempt, lastError);
        }

        const waitTime = backoff ? delay * Math.pow(2, attempt - 1) : delay;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  throw lastError!;
}

/**
 * Lazy load module
 */
export async function lazyLoad<T>(
  loader: () => Promise<{ default: T }>
): Promise<T> {
  const loadedModule = await loader();
  return loadedModule.default;
}

/**
 * Measure function execution time
 */
export async function measureTime<T>(
  name: string,
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await fn();
  const duration = Date.now() - start;

  return { result, duration };
}

/**
 * Create a queue for sequential execution
 */
export class Queue<T = any> {
  private queue: Array<() => Promise<T>> = [];
  private processing = false;

  async add(task: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
          return result;
        } catch (error) {
          reject(error);
          throw error;
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          logError(error, 'Queue');
        }
      }
    }

    this.processing = false;
  }

  get size(): number {
    return this.queue.length;
  }

  get isProcessing(): boolean {
    return this.processing;
  }
}

/**
 * Data compression utility
 */
export function compressData(data: any): string {
  try {
    return JSON.stringify(data);
  } catch (error) {
    logError(error, 'CompressData');
    return '';
  }
}

/**
 * Data decompression utility
 */
export function decompressData<T = any>(compressed: string): T | null {
  try {
    return JSON.parse(compressed);
  } catch (error) {
    logError(error, 'DecompressData');
    return null;
  }
}

