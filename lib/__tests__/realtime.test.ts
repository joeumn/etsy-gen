import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateDatabaseOperationStatus, updateBotStatus } from '../realtime';
import { supabase } from '../db/client';

// Mock the supabase client
vi.mock('../db/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
  },
}));

describe('Realtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateDatabaseOperationStatus', () => {
    it('should update operation status to running', async () => {
      const operationId = 'op-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateDatabaseOperationStatus(operationId, 'running', {
        progress: 50,
        message: 'In progress',
      });

      expect(mockFrom).toHaveBeenCalledWith('database_operations');
    });

    it('should update operation status to completed', async () => {
      const operationId = 'op-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateDatabaseOperationStatus(operationId, 'completed', {
        progress: 100,
        message: 'Completed',
        fileUrl: 's3://bucket/file.sql',
        fileSize: 1024,
      });

      expect(mockFrom).toHaveBeenCalledWith('database_operations');
    });

    it('should update operation status to failed', async () => {
      const operationId = 'op-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateDatabaseOperationStatus(operationId, 'failed', {
        error: 'Operation failed',
      });

      expect(mockFrom).toHaveBeenCalledWith('database_operations');
    });

    it('should throw error when database update fails', async () => {
      const operationId = 'op-123';
      const mockError = new Error('Database error');
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: mockError })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await expect(
        updateDatabaseOperationStatus(operationId, 'running')
      ).rejects.toThrow();
    });
  });

  describe('updateBotStatus', () => {
    it('should update bot status to running', async () => {
      const botId = 'bot-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateBotStatus(botId, 'running', {
        lastRunAt: new Date().toISOString(),
      });

      expect(mockFrom).toHaveBeenCalledWith('ai_bots');
    });

    it('should update bot status to active with tasks completed', async () => {
      const botId = 'bot-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateBotStatus(botId, 'active', {
        tasksCompleted: 10,
      });

      expect(mockFrom).toHaveBeenCalledWith('ai_bots');
    });

    it('should update bot status to error with error message', async () => {
      const botId = 'bot-123';
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await updateBotStatus(botId, 'error', {
        lastError: 'Execution failed',
      });

      expect(mockFrom).toHaveBeenCalledWith('ai_bots');
    });

    it('should throw error when database update fails', async () => {
      const botId = 'bot-123';
      const mockError = new Error('Database error');
      const mockFrom = vi.fn(() => ({
        update: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: mockError })),
        })),
      }));
      
      (supabase.from as any) = mockFrom;

      await expect(
        updateBotStatus(botId, 'running')
      ).rejects.toThrow();
    });
  });
});
