/**
 * Comprehensive Logging System for FoundersForge
 * 
 * Features:
 * - Structured logging with Pino
 * - Different log levels (trace, debug, info, warn, error, fatal)
 * - Request tracking and correlation IDs
 * - Performance monitoring
 * - Error tracking and reporting
 * - Production and development modes
 */

import pino from 'pino';

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Create base logger
export const logger = pino({
  level: logLevel,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    },
  }),
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  },
  base: {
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with context
 */
export function createLogger(context: string, metadata?: Record<string, any>) {
  return logger.child({
    context,
    ...metadata,
  });
}

/**
 * API Request Logger
 */
export function logRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  userId?: string,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'API' });
  
  const logData = {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userId,
    ...metadata,
  };

  if (statusCode >= 500) {
    log.error(logData, 'API request failed');
  } else if (statusCode >= 400) {
    log.warn(logData, 'API request error');
  } else {
    log.info(logData, 'API request completed');
  }
}

/**
 * Error Logger
 */
export function logError(
  error: Error | unknown,
  context: string,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context });
  
  if (error instanceof Error) {
    log.error({
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...metadata,
    }, 'Error occurred');
  } else {
    log.error({
      error: String(error),
      ...metadata,
    }, 'Unknown error occurred');
  }
}

/**
 * AI Generation Logger
 */
export function logAIGeneration(
  provider: string,
  operation: string,
  success: boolean,
  duration: number,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'AI' });
  
  log.info({
    provider,
    operation,
    success,
    duration: `${duration}ms`,
    ...metadata,
  }, `AI ${operation} ${success ? 'completed' : 'failed'}`);
}

/**
 * Database Operation Logger
 */
export function logDatabase(
  operation: string,
  table: string,
  success: boolean,
  duration?: number,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'Database' });
  
  log.info({
    operation,
    table,
    success,
    ...(duration && { duration: `${duration}ms` }),
    ...metadata,
  }, `Database ${operation} on ${table}`);
}

/**
 * Performance Logger
 */
export class PerformanceLogger {
  private startTime: number;
  private context: string;
  private operation: string;

  constructor(context: string, operation: string) {
    this.context = context;
    this.operation = operation;
    this.startTime = Date.now();
  }

  end(metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime;
    const log = logger.child({ context: this.context });
    
    log.info({
      operation: this.operation,
      duration: `${duration}ms`,
      ...metadata,
    }, `${this.operation} completed`);
    
    return duration;
  }

  endWithError(error: Error | unknown, metadata?: Record<string, any>) {
    const duration = Date.now() - this.startTime;
    logError(error, this.context, {
      operation: this.operation,
      duration: `${duration}ms`,
      ...metadata,
    });
    
    return duration;
  }
}

/**
 * Security Event Logger
 */
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  userId?: string,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'Security' });
  
  const logData = {
    event,
    severity,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  switch (severity) {
    case 'critical':
    case 'high':
      log.error(logData, `Security event: ${event}`);
      break;
    case 'medium':
      log.warn(logData, `Security event: ${event}`);
      break;
    case 'low':
      log.info(logData, `Security event: ${event}`);
      break;
  }
}

/**
 * User Activity Logger
 */
export function logUserActivity(
  userId: string,
  action: string,
  resource?: string,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'UserActivity' });
  
  log.info({
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata,
  }, `User action: ${action}`);
}

/**
 * Audit Logger (for compliance and tracking)
 */
export function logAudit(
  action: string,
  userId: string,
  entityType: string,
  entityId: string,
  changes?: Record<string, any>,
  metadata?: Record<string, any>
) {
  const log = logger.child({ context: 'Audit' });
  
  log.info({
    action,
    userId,
    entityType,
    entityId,
    changes,
    timestamp: new Date().toISOString(),
    ...metadata,
  }, `Audit: ${action} on ${entityType}`);
}

export default logger;

