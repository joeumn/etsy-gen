import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scheduleBot, unscheduleBot, getScheduledBots, CRON_SCHEDULES } from '../bots/bot-scheduler';

// Mock node-cron
vi.mock('node-cron', () => ({
  default: {
    schedule: vi.fn(() => ({
      stop: vi.fn(),
    })),
    validate: vi.fn((expr: string) => {
      // Simple validation - check if it looks like a cron expression
      return expr.split(' ').length === 5;
    }),
  },
}));

describe('Bot Scheduler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('scheduleBot', () => {
    it('should schedule a bot with valid cron expression', () => {
      const botId = 'bot-123';
      const schedule = CRON_SCHEDULES.EVERY_HOUR;

      const result = scheduleBot(botId, schedule);

      expect(result).toBe(true);
    });

    it('should return false for invalid cron expression', () => {
      const botId = 'bot-123';
      const schedule = 'invalid-cron';

      const result = scheduleBot(botId, schedule);

      expect(result).toBe(false);
    });

    it('should replace existing schedule for same bot', () => {
      const botId = 'bot-123';
      const schedule1 = CRON_SCHEDULES.EVERY_HOUR;
      const schedule2 = CRON_SCHEDULES.EVERY_30_MINUTES;

      scheduleBot(botId, schedule1);
      const result = scheduleBot(botId, schedule2);

      expect(result).toBe(true);
    });
  });

  describe('unscheduleBot', () => {
    it('should unschedule an existing bot', () => {
      const botId = 'bot-123';
      const schedule = CRON_SCHEDULES.EVERY_HOUR;

      scheduleBot(botId, schedule);
      const result = unscheduleBot(botId);

      expect(result).toBe(true);
    });

    it('should return false when unscheduling non-existent bot', () => {
      const result = unscheduleBot('non-existent-bot');

      expect(result).toBe(false);
    });
  });

  describe('getScheduledBots', () => {
    it('should return empty array when no bots scheduled', () => {
      const bots = getScheduledBots();

      expect(bots).toEqual([]);
    });

    it('should return list of scheduled bot IDs', () => {
      const botId1 = 'bot-123';
      const botId2 = 'bot-456';

      scheduleBot(botId1, CRON_SCHEDULES.EVERY_HOUR);
      scheduleBot(botId2, CRON_SCHEDULES.DAILY_AT_MIDNIGHT);

      const bots = getScheduledBots();

      expect(bots).toContain(botId1);
      expect(bots).toContain(botId2);
      expect(bots.length).toBe(2);
    });
  });

  describe('CRON_SCHEDULES', () => {
    it('should have valid cron schedule constants', () => {
      expect(CRON_SCHEDULES.EVERY_MINUTE).toBe('* * * * *');
      expect(CRON_SCHEDULES.EVERY_HOUR).toBe('0 * * * *');
      expect(CRON_SCHEDULES.DAILY_AT_MIDNIGHT).toBe('0 0 * * *');
      expect(CRON_SCHEDULES.WEEKLY).toBe('0 0 * * 0');
    });
  });
});
