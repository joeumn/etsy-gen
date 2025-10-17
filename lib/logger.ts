/**
 * Comprehensive Logging System for FoundersForge
 *
 * Features:
 * - Worker-thread safe console-based logging
 * - Different log levels (trace, debug, info, warn, error, fatal)
 * - Request tracking and correlation IDs
 * - Performance monitoring
 * - Error tracking and reporting
 * - Production and development modes
 */

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

// Log levels mapping
const LOG_LEVELS = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Get current log level value
const currentLogLevel = LOG_LEVELS[logLevel as LogLevel] || LOG_LEVELS.info;

// Helper function to format log messages
function formatLogMessage(level: string, message: string, data?: any): string {
  const timestamp = new Date().toISOString();
  const env = process.env.NODE_ENV || 'development';
  const formattedData = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] ${env.toUpperCase()} ${level.toUpperCase()}: ${message}${formattedData}`;
}

// Core logging function
function logMessage(level: LogLevel, message: string, data?: any) {
  if (LOG_LEVELS[level] < currentLogLevel) return;

  const formattedMessage = formatLogMessage(level, message, data);

  switch (level) {
    case 'trace':
    case 'debug':
      console.debug(formattedMessage);
      break;
    case 'info':
      console.info(formattedMessage);
      break;
    case 'warn':
      console.warn(formattedMessage);
      break;
    case 'error':
    case 'fatal':
      console.error(formattedMessage);
      break;
  }
}

// Create child logger function
function createChildLogger(context: Record<string, any>) {
  return {
    trace: (message: string, data?: any) => logMessage('trace', `[${JSON.stringify(context)}] ${message}`, data),
    debug: (message: string, data?: any) => logMessage('debug', `[${JSON.stringify(context)}] ${message}`, data),
    info: (message: string, data?: any) => logMessage('info', `[${JSON.stringify(context)}] ${message}`, data),
    warn: (message: string, data?: any) => logMessage('warn', `[${JSON.stringify(context)}] ${message}`, data),
    error: (message: string, data?: any) => logMessage('error', `[${JSON.stringify(context)}] ${message}`, data),
    fatal: (message: string, data?: any) => logMessage('fatal', `[${JSON.stringify(context)}] ${message}`, data),
    child: (additionalContext: Record<string, any>) => createChildLogger({ ...context, ...additionalContext }),
  };
}

// Create base logger
export const logger = {
  trace: (message: string, data?: any) => logMessage('trace', message, data),
  debug: (message: string, data?: any) => logMessage('debug', message, data),
  info: (message: string, data?: any) => logMessage('info', message, data),
  warn: (message: string, data?: any) => logMessage('warn', message, data),
  error: (message: string, data?: any) => logMessage('error', message, data),
  fatal: (message: string, data?: any) => logMessage('fatal', message, data),
  child: (context: Record<string, any>) => createChildLogger(context),
};

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
  const logData = {
    method,
    url,
    statusCode,
    duration: `${duration}ms`,
    userId,
    ...metadata,
  };

  if (statusCode >= 500) {
    logger.error('API request failed', logData);
  } else if (statusCode >= 400) {
    logger.warn('API request error', logData);
  } else {
    logger.info('API request completed', logData);
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
  if (error instanceof Error) {
    logger.error('Error occurred', {
      context,
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      ...metadata,
    });
  } else {
    logger.error('Unknown error occurred', {
      context,
      error: String(error),
      ...metadata,
    });
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
  logger.info(`AI ${operation} ${success ? 'completed' : 'failed'}`, {
    context: 'AI',
    provider,
    operation,
    success,
    duration: `${duration}ms`,
    ...metadata,
  });
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
  logger.info(`Database ${operation} on ${table}`, {
    context: 'Database',
    operation,
    table,
    success,
    ...(duration && { duration: `${duration}ms` }),
    ...metadata,
  });
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

    logger.info(`${this.operation} completed`, {
      context: this.context,
      operation: this.operation,
      duration: `${duration}ms`,
      ...metadata,
    });

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
  const logData = {
    context: 'Security',
    event,
    severity,
    userId,
    timestamp: new Date().toISOString(),
    ...metadata,
  };

  switch (severity) {
    case 'critical':
    case 'high':
      logger.error(`Security event: ${event}`, logData);
      break;
    case 'medium':
      logger.warn(`Security event: ${event}`, logData);
      break;
    case 'low':
      logger.info(`Security event: ${event}`, logData);
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
  logger.info(`User action: ${action}`, {
    context: 'UserActivity',
    userId,
    action,
    resource,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
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
  logger.info(`Audit: ${action} on ${entityType}`, {
    context: 'Audit',
    action,
    userId,
    entityType,
    entityId,
    changes,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

export default logger;

