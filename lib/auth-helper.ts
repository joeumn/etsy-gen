/**
 * Authentication Helper Functions
 * 
 * Provides utilities for authentication and session management
 */

import { supabase } from './db/client';
import bcrypt from 'bcryptjs';
import { AuthenticationError, ConflictError } from './errors';
import { logError, logSecurityEvent } from './logger';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar_url: string | null;
  is_active: boolean;
  email_verified: boolean;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  error?: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, is_active, email_verified')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    logError(error, 'GetUserById', { userId });
    return null;
  }
}

/**
 * Get user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, name, role, avatar_url, is_active, email_verified')
      .eq('email', email)
      .single();

    if (error || !data) {
      return null;
    }

    return data as User;
  } catch (error) {
    logError(error, 'GetUserByEmail', { email });
    return null;
  }
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  name?: string
): Promise<User> {
  try {
    // Check if user exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash,
        name,
        role: 'user',
        is_active: true,
        email_verified: false,
      })
      .select('id, email, name, role, avatar_url, is_active, email_verified')
      .single();

    if (error || !data) {
      throw new Error('Failed to create user');
    }

    return data as User;
  } catch (error) {
    logError(error, 'CreateUser', { email });
    throw error;
  }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(
  email: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Get user with password hash
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      logSecurityEvent('login_failed', 'low', undefined, {
        email,
        reason: 'user_not_found',
      });
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      logSecurityEvent('login_failed', 'medium', user.id, {
        email,
        reason: 'account_inactive',
      });
      
      throw new AuthenticationError('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password_hash);

    if (!isPasswordValid) {
      logSecurityEvent('login_failed', 'medium', user.id, {
        email,
        reason: 'invalid_password',
      });
      
      throw new AuthenticationError('Invalid email or password');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    logSecurityEvent('login_success', 'low', user.id, { email });

    // Generate token
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar_url: user.avatar_url,
        is_active: user.is_active,
        email_verified: user.email_verified,
      },
    };
  } catch (error) {
    logError(error, 'AuthenticateUser');
    
    if (error instanceof AuthenticationError) {
      return {
        success: false,
        error: error.message,
      };
    }
    
    return {
      success: false,
      error: 'Authentication failed',
    };
  }
}

/**
 * Verify auth token and get user
 */
export async function verifyToken(token: string): Promise<User | null> {
  try {
    // Decode token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userId = decoded.split(':')[0];

    // Get user
    const user = await getUserById(userId);
    
    if (!user || !user.is_active) {
      return null;
    }

    return user;
  } catch (error) {
    logError(error, 'VerifyToken');
    return null;
  }
}

