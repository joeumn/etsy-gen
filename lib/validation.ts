/**
 * Validation Utilities and Schemas
 * 
 * Provides reusable validation schemas and utilities using Zod
 */

import { z } from 'zod';
import { ValidationError } from './errors';

/**
 * Common validation schemas
 */
export const schemas = {
  // Email validation
  email: z.string().email('Invalid email address'),
  
  // Password validation (min 8 chars, at least one uppercase, one lowercase, one number)
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // Marketplace validation
  marketplace: z.enum(['etsy', 'amazon', 'shopify']),
  
  // AI Provider validation
  aiProvider: z.enum(['gemini', 'openai', 'azure', 'anthropic', 'saunet']),
  
  // Product type validation
  productType: z.enum(['digital_download', 'printable', 'template', 'ebook', 'course']),
  
  // Plan validation
  plan: z.enum(['free', 'pro', 'enterprise']),
  
  // Pagination
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(20),
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
  }).refine(
    (data) => new Date(data.startDate) < new Date(data.endDate),
    { message: 'Start date must be before end date' }
  ),
};

/**
 * User registration schema
 */
export const registerSchema = z.object({
  email: schemas.email,
  password: schemas.password,
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

/**
 * User login schema
 */
export const loginSchema = z.object({
  email: schemas.email,
  password: z.string().min(1, 'Password is required'),
});

/**
 * Generate product schema
 */
export const generateProductSchema = z.object({
  trendData: z.object({
    category: z.string(),
    keywords: z.array(z.string()).optional(),
    marketplace: schemas.marketplace.optional(),
  }),
  productType: schemas.productType.default('digital_download'),
  targetMarketplace: schemas.marketplace.default('etsy'),
  customPrompt: z.string().optional(),
  aiProvider: schemas.aiProvider.default('gemini'),
});

/**
 * Create listing schema
 */
export const createListingSchema = z.object({
  generatedProductId: schemas.uuid,
  marketplace: schemas.marketplace,
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  price: z.number().positive(),
  tags: z.array(z.string()).max(13),
  images: z.array(z.string().url()).optional(),
});

/**
 * Update user settings schema
 */
export const updateUserSettingsSchema = z.object({
  defaultAiProvider: schemas.aiProvider.optional(),
  defaultMarketplace: schemas.marketplace.optional(),
  notificationPreferences: z.record(z.string(), z.boolean()).optional(),
});

/**
 * Generate brand schema
 */
export const generateBrandSchema = z.object({
  name: z.string().min(2).max(100),
  industry: z.string().optional(),
  style: z.enum(['modern', 'classic', 'minimal', 'bold', 'playful']).optional(),
  colorPreferences: z.array(z.string()).optional(),
  userId: z.string().uuid().optional(),
});

/**
 * Scan trends schema
 */
export const scanTrendsSchema = z.object({
  marketplace: schemas.marketplace,
  category: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  limit: z.number().int().positive().max(100).default(20),
});

/**
 * Affiliate code schema
 */
export const affiliateCodeSchema = z.object({
  displayName: z.string().min(2).max(100).optional(),
  isPublic: z.boolean().default(false),
});

/**
 * Validate data against schema
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
      
      throw new ValidationError('Validation failed', { errors });
    }
    throw error;
  }
}

/**
 * Validate data and return result with errors
 */
export function validateSafe<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.issues.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    return { success: false, errors };
  }
}

/**
 * Sanitize string input (prevent XSS)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove inline event handlers
    .trim();
}

/**
 * Sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeString(sanitized[key]) as any;
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key]);
    }
  }
  
  return sanitized;
}

