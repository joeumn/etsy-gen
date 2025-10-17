/**
 * Session helper utilities
 * Provides client-side session management
 */

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
}

/**
 * Get the current user ID from localStorage
 * This is a temporary solution until proper session management is implemented
 */
export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    // Try to get from localStorage (simple auth)
    const authData = localStorage.getItem('foundersforge_auth');
    if (authData) {
      const user = JSON.parse(authData);
      return user.id || null;
    }

    // Fallback to a default user ID for development
    // In production, this should fail if no user is logged in
    const isDevelopment = process.env.NODE_ENV === 'development';
    if (isDevelopment) {
      return 'mock-user-1';
    }

    return null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
}

/**
 * Get the current user from localStorage
 */
export function getCurrentUser(): SessionUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const authData = localStorage.getItem('foundersforge_auth');
    if (authData) {
      return JSON.parse(authData);
    }
    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Set the current user in localStorage
 */
export function setCurrentUser(user: SessionUser): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem('foundersforge_auth', JSON.stringify(user));
  } catch (error) {
    console.error('Error setting current user:', error);
  }
}

/**
 * Clear the current user from localStorage
 */
export function clearCurrentUser(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem('foundersforge_auth');
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
}
