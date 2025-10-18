/**
 * Real-Time Updates Helper
 * 
 * Provides real-time status updates using Supabase Realtime
 */

import { supabase } from './db/client';
import { logger, logError } from './logger';

export type OperationStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface StatusUpdate {
  id: string;
  status: OperationStatus;
  progress?: number;
  message?: string;
  error?: string;
  updatedAt: string;
}

/**
 * Update database operation status with real-time notification
 */
export async function updateDatabaseOperationStatus(
  operationId: string,
  status: OperationStatus,
  details?: {
    progress?: number;
    message?: string;
    error?: string;
    fileUrl?: string;
    fileSize?: number;
  }
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (details?.progress !== undefined) {
      updateData.progress = details.progress;
    }

    if (details?.message) {
      updateData.message = details.message;
    }

    if (details?.error) {
      updateData.error_message = details.error;
    }

    if (details?.fileUrl) {
      updateData.file_url = details.fileUrl;
    }

    if (details?.fileSize) {
      updateData.file_size = details.fileSize;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString();
    }

    // Update in database - Supabase Realtime will notify subscribers automatically
    const { error } = await supabase
      .from('database_operations')
      .update(updateData)
      .eq('id', operationId);

    if (error) {
      throw error;
    }

    logger.info(`Database operation ${operationId} updated: ${status}`);
  } catch (error) {
    logError(error, 'UpdateDatabaseOperationStatus', { operationId, status });
    throw error;
  }
}

/**
 * Update bot status with real-time notification
 */
export async function updateBotStatus(
  botId: string,
  status: 'active' | 'paused' | 'running' | 'error',
  details?: {
    tasksCompleted?: number;
    lastError?: string;
    lastRunAt?: string;
    nextRunAt?: string;
  }
): Promise<void> {
  try {
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (details?.tasksCompleted !== undefined) {
      updateData.tasks_completed = details.tasksCompleted;
    }

    if (details?.lastError !== undefined) {
      updateData.last_error = details.lastError;
    }

    if (details?.lastRunAt) {
      updateData.last_run_at = details.lastRunAt;
    }

    if (details?.nextRunAt !== undefined) {
      updateData.next_run_at = details.nextRunAt;
    }

    // Update in database - Supabase Realtime will notify subscribers automatically
    const { error } = await supabase
      .from('ai_bots')
      .update(updateData)
      .eq('id', botId);

    if (error) {
      throw error;
    }

    logger.info(`Bot ${botId} updated: ${status}`);
  } catch (error) {
    logError(error, 'UpdateBotStatus', { botId, status });
    throw error;
  }
}

/**
 * Client-side helper: Subscribe to database operation updates
 * This should be called from the frontend
 * 
 * Example usage:
 * ```typescript
 * const channel = subscribeToDatabaseOperations(userId, (payload) => {
 *   console.log('Operation updated:', payload.new);
 * });
 * 
 * // Later, unsubscribe
 * channel.unsubscribe();
 * ```
 */
export function subscribeToDatabaseOperations(
  userId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`database_operations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'database_operations',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Client-side helper: Subscribe to bot status updates
 * This should be called from the frontend
 * 
 * Example usage:
 * ```typescript
 * const channel = subscribeToBotUpdates(userId, (payload) => {
 *   console.log('Bot updated:', payload.new);
 * });
 * 
 * // Later, unsubscribe
 * channel.unsubscribe();
 * ```
 */
export function subscribeToBotUpdates(
  userId: string,
  callback: (payload: any) => void
) {
  const channel = supabase
    .channel(`ai_bots:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'ai_bots',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Enable Realtime for tables (run this in migration or setup)
 */
export async function enableRealtimeForTables(): Promise<void> {
  try {
    // Note: This requires admin privileges
    // In production, you would run these SQL commands directly:
    // ALTER PUBLICATION supabase_realtime ADD TABLE database_operations;
    // ALTER PUBLICATION supabase_realtime ADD TABLE ai_bots;
    
    logger.info('Realtime should be enabled for database_operations and ai_bots tables');
  } catch (error) {
    logError(error, 'EnableRealtimeForTables');
  }
}
