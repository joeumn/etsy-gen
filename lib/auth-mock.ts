/**
 * Mock Authentication for Local Development
 * 
 * Only used when VERCEL environment is not detected
 * Production uses real Supabase authentication
 */

import { logSecurityEvent } from './logger';

// Check if running in production/Vercel
const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';

// Mock users for development
const MOCK_USERS = [
  {
    id: 'mock-user-1',
    email: 'joeinduluth@gmail.com',
    password: 'Two1Eight',
    name: 'Joe Induluth',
    role: 'super_admin',
    avatar_url: null,
    is_active: true,
    email_verified: true,
  },
  {
    id: 'mock-user-2',
    email: 'demo@foundersforge.com',
    password: 'demo123',
    name: 'Demo User',
    role: 'user',
    avatar_url: null,
    is_active: true,
    email_verified: true,
  },
];

/**
 * Check if we should use mock data
 */
export function useMockAuth(): boolean {
  return !isProduction && !process.env.SUPABASE_URL?.includes('supabase.co');
}

/**
 * Mock login function
 */
export async function mockLogin(email: string, password: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    logSecurityEvent('mock_login_failed', 'low', undefined, { email });
    return {
      success: false,
      error: 'Invalid email or password',
    };
  }

  logSecurityEvent('mock_login_success', 'low', user.id, { email });

  // Generate mock token
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
    },
  };
}

/**
 * Mock user creation
 */
export async function mockCreateUser(email: string, password: string, name?: string) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Check if user exists
  const exists = MOCK_USERS.find(u => u.email === email);
  if (exists) {
    return {
      success: false,
      error: 'User with this email already exists',
    };
  }

  // Create mock user
  const newUser = {
    id: `mock-user-${Date.now()}`,
    email,
    password,
    name: name || 'New User',
    role: 'user',
    avatar_url: null,
    is_active: true,
    email_verified: false,
  };

  // In a real scenario, this would be added to the mock array
  // For now, just return success

  const token = Buffer.from(`${newUser.id}:${Date.now()}`).toString('base64');

  return {
    success: true,
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      avatar_url: newUser.avatar_url,
    },
  };
}

/**
 * Mock user verification
 */
export async function mockVerifyToken(token: string) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const userId = decoded.split(':')[0];

    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
      is_active: user.is_active,
      email_verified: user.email_verified,
    };
  } catch {
    return null;
  }
}

