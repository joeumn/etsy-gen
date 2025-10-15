/**
 * Custom Error Classes and Error Handling Utilities
 * 
 * Provides structured error handling with proper typing and context
 */

/**
 * Base Application Error
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, any>;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, any>
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    Error.captureStackTrace(this);
  }
}

/**
 * Validation Error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 400, true, context);
  }
}

/**
 * Authentication Error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: Record<string, any>) {
    super(message, 401, true, context);
  }
}

/**
 * Authorization Error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', context?: Record<string, any>) {
    super(message, 403, true, context);
  }
}

/**
 * Not Found Error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: Record<string, any>) {
    super(`${resource} not found`, 404, true, context);
  }
}

/**
 * Conflict Error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 409, true, context);
  }
}

/**
 * Rate Limit Error (429)
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message: string = 'Too many requests', retryAfter?: number, context?: Record<string, any>) {
    super(message, 429, true, context);
    this.retryAfter = retryAfter;
  }
}

/**
 * Internal Server Error (500)
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal server error', context?: Record<string, any>) {
    super(message, 500, true, context);
  }
}

/**
 * External Service Error (502)
 */
export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message?: string, context?: Record<string, any>) {
    super(message || `${service} service unavailable`, 502, true, context);
    this.service = service;
  }
}

/**
 * AI Provider Error
 */
export class AIProviderError extends AppError {
  public readonly provider: string;

  constructor(provider: string, message: string, context?: Record<string, any>) {
    super(message, 500, true, { provider, ...context });
    this.provider = provider;
  }
}

/**
 * Database Error
 */
export class DatabaseError extends AppError {
  public readonly operation: string;

  constructor(operation: string, message: string, context?: Record<string, any>) {
    super(message, 500, true, { operation, ...context });
    this.operation = operation;
  }
}

/**
 * Payment Error
 */
export class PaymentError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 402, true, context);
  }
}

/**
 * Error Response Structure
 */
export interface ErrorResponse {
  error: {
    message: string;
    code: string;
    statusCode: number;
    context?: Record<string, any>;
    timestamp: string;
    path?: string;
  };
}

/**
 * Format error for API response
 */
export function formatErrorResponse(
  error: Error | AppError,
  path?: string
): ErrorResponse {
  const isAppError = error instanceof AppError;

  return {
    error: {
      message: error.message,
      code: error.name,
      statusCode: isAppError ? error.statusCode : 500,
      ...(isAppError && error.context && { context: error.context }),
      timestamp: new Date().toISOString(),
      ...(path && { path }),
    },
  };
}

/**
 * Check if error is operational (safe to expose to client)
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * Error Handler for API Routes
 */
export function handleAPIError(error: unknown, path?: string): {
  response: ErrorResponse;
  statusCode: number;
} {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      response: formatErrorResponse(error, path),
      statusCode: error.statusCode,
    };
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return {
      response: formatErrorResponse(
        new InternalServerError(
          process.env.NODE_ENV === 'production'
            ? 'An unexpected error occurred'
            : error.message
        ),
        path
      ),
      statusCode: 500,
    };
  }

  // Handle unknown errors
  return {
    response: formatErrorResponse(
      new InternalServerError('An unexpected error occurred'),
      path
    ),
    statusCode: 500,
  };
}

/**
 * Async handler wrapper for API routes
 * Catches errors and passes them to the error handler
 */
export function asyncHandler<T = any>(
  handler: (...args: any[]) => Promise<T>
) {
  return async (...args: any[]): Promise<T> => {
    try {
      return await handler(...args);
    } catch (error) {
      throw error; // Re-throw to be caught by API route error handler
    }
  };
}

/**
 * Retry logic for external service calls
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  backoffMultiplier: number = 2
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new ExternalServiceError(
    'RetryService',
    `Failed after ${maxRetries} attempts: ${lastError!.message}`,
    { lastError: lastError!.message }
  );
}

