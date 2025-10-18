/**
 * Authentication Session Helpers
 * 
 * Helper functions to get authenticated user from NextAuth session
 */

import { headers } from 'next/headers';
import { getUserById } from './auth-helper';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatar_url: string | null;
}

/**
 * Get the authenticated user from the request
 * This should be called in API routes after the middleware has validated the session
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  try {
    const headersList = await headers();
    const userId = headersList.get('x-user-id');
    const userEmail = headersList.get('x-user-email');

    if (!userId) {
      return null;
    }

    // Get full user data from database
    const user = await getUserById(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar_url: user.avatar_url,
    };
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Require an authenticated user - throws error if not authenticated
 */
export async function requireAuth(): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser();
  
  if (!user) {
    throw new Error('Unauthorized - No valid session');
  }

  return user;
}
