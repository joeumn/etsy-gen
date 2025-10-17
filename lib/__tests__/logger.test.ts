import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logger, createLogger, logRequest, logError, logAIGeneration, PerformanceLogger } from '../logger';

// Mock console methods
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});

describe('Logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logger methods', () => {
    it('should log info messages', () => {
      logger.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('INFO: Test info message')
      );
    });

    it('should log error messages', () => {
      logger.error('Test error message');
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('ERROR: Test error message')
      );
    });

    it('should log warn messages', () => {
      logger.warn('Test warn message');
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('WARN: Test warn message')
      );
    });
  });

  describe('createLogger', () => {
    it('should create a child logger with context', () => {
      const childLogger = createLogger('TestContext');
      childLogger.info('Test message');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestContext')
      );
    });
  });

  describe('logRequest', () => {
    it('should log successful requests', () => {
      logRequest('GET', '/api/test', 200, 150, 'user123');

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('API request completed')
      );
    });

    it('should log error requests', () => {
      logRequest('POST', '/api/test', 500, 200);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('API request failed')
      );
    });
  });

  describe('logError', () => {
    it('should log Error objects', () => {
      const error = new Error('Test error');
      logError(error, 'TestContext');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred')
      );
    });

    it('should log unknown errors', () => {
      logError('Unknown error', 'TestContext');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unknown error occurred')
      );
    });
  });

  describe('logAIGeneration', () => {
    it('should log successful AI generation', () => {
      logAIGeneration('openai', 'text-generation', true, 100, { tokens: 100 });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI text-generation completed')
      );
    });

    it('should log failed AI generation', () => {
      logAIGeneration('gemini', 'image-generation', false, 200, { error: 'API limit exceeded' });

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI image-generation failed')
      );
    });
  });

  describe('PerformanceLogger', () => {
    it('should measure execution time', () => {
      const perfLogger = new PerformanceLogger('TestOperation', 'test');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 5) {} // Busy wait for 5ms

      const duration = perfLogger.end({ result: 'success' });
      expect(duration).toBeGreaterThan(0);
      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('test completed')
      );
    });

    it('should log errors with duration', () => {
      const perfLogger = new PerformanceLogger('TestOperation', 'test');
      const error = new Error('Test error');

      // Simulate some work
      const start = Date.now();
      while (Date.now() - start < 5) {} // Busy wait for 5ms

      const duration = perfLogger.endWithError(error, { context: 'test' });
      expect(duration).toBeGreaterThan(0);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error occurred')
      );
    });
  });
});
