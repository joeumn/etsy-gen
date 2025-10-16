/**
 * DEPRECATED: Mock authentication has been removed.
 * 
 * This application now uses 100% real Supabase authentication.
 * All mock authentication functionality has been disabled.
 * 
 * If you need to test locally, ensure you have:
 * 1. Valid Supabase credentials in environment variables
 * 2. A real user account in the Supabase database
 * 3. Proper database migrations applied
 */

/**
 * Always returns false - mock auth is disabled
 */
export function useMockAuth(): boolean {
  return false;
}

/**
 * Throws error - mock login is disabled
 */
export async function mockLogin(email: string, password: string) {
  throw new Error('Mock authentication is disabled. Use real Supabase authentication.');
}

/**
 * Throws error - mock user creation is disabled
 */
export async function mockCreateUser(email: string, password: string, name?: string) {
  throw new Error('Mock authentication is disabled. Use real Supabase authentication.');
}

/**
 * Throws error - mock token verification is disabled
 */
export async function mockVerifyToken(token: string) {
  throw new Error('Mock authentication is disabled. Use real Supabase authentication.');
}

