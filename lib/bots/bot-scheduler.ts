/**
 * Bot Scheduler
 * 
 * Manages scheduled execution of bots using node-cron
 */

import cron from 'node-cron';
import { supabase } from '../supabase/admin-client';
import { logger, logError } from '../logger';
import { executeBot } from './bot-executor';

// Store active cron jobs
const activeCronJobs = new Map<string, ReturnType<typeof cron.schedule>>();

/**
 * Schedule a bot for automatic execution
 */
export function scheduleBot(botId: string, schedule: string): boolean {
  try {
    // Validate cron expression
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`);
    }

    // Cancel existing schedule if any
    if (activeCronJobs.has(botId)) {
      activeCronJobs.get(botId)?.stop();
      activeCronJobs.delete(botId);
    }

    // Create new cron job
    const task = cron.schedule(schedule, async () => {
      logger.info(`Scheduled execution triggered for bot: ${botId}`);
      try {
        await executeBot(botId);
      } catch (error) {
        logError(error, 'ScheduledBotExecution', { botId });
      }
    });

    activeCronJobs.set(botId, task);
    logger.info(`Bot ${botId} scheduled with cron: ${schedule}`);

    return true;
  } catch (error) {
    logError(error, 'ScheduleBot', { botId, schedule });
    return false;
  }
}

/**
 * Unschedule a bot
 */
export function unscheduleBot(botId: string): boolean {
  try {
    if (activeCronJobs.has(botId)) {
      activeCronJobs.get(botId)?.stop();
      activeCronJobs.delete(botId);
      logger.info(`Bot ${botId} unscheduled`);
      return true;
    }
    return false;
  } catch (error) {
    logError(error, 'UnscheduleBot', { botId });
    return false;
  }
}

/**
 * Initialize scheduler - load all active bots with schedules
 */
export async function initializeBotScheduler(): Promise<void> {
  try {
    logger.info('Initializing bot scheduler...');

    // Get all active bots with schedules
    const { data: bots, error } = await supabase
      .from('ai_bots')
      .select('id, name, schedule, status')
      .eq('status', 'active')
      .not('schedule', 'is', null);

    if (error) {
      throw error;
    }

    if (!bots || bots.length === 0) {
      logger.info('No active bots with schedules found');
      return;
    }

    // Schedule each bot
    let scheduledCount = 0;
    for (const bot of bots) {
      if (bot.schedule && scheduleBot(bot.id, bot.schedule)) {
        scheduledCount++;
      }
    }

    logger.info(`Bot scheduler initialized: ${scheduledCount} bots scheduled`);
  } catch (error) {
    logError(error, 'InitializeBotScheduler');
    throw new Error('Failed to initialize bot scheduler');
  }
}

/**
 * Shutdown scheduler - stop all cron jobs
 */
export function shutdownBotScheduler(): void {
  logger.info('Shutting down bot scheduler...');
  
  for (const [botId, task] of activeCronJobs.entries()) {
    task.stop();
    logger.info(`Stopped scheduler for bot: ${botId}`);
  }
  
  activeCronJobs.clear();
  logger.info('Bot scheduler shut down');
}

/**
 * Get scheduled bot IDs
 */
export function getScheduledBots(): string[] {
  return Array.from(activeCronJobs.keys());
}

/**
 * Common cron schedules
 */
export const CRON_SCHEDULES = {
  EVERY_MINUTE: '* * * * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_15_MINUTES: '*/15 * * * *',
  EVERY_30_MINUTES: '*/30 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_2_HOURS: '0 */2 * * *',
  EVERY_6_HOURS: '0 */6 * * *',
  EVERY_12_HOURS: '0 */12 * * *',
  DAILY_AT_MIDNIGHT: '0 0 * * *',
  DAILY_AT_NOON: '0 12 * * *',
  WEEKLY: '0 0 * * 0',
};
