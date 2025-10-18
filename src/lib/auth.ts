/**
 * Client-side authentication helpers
 * 
 * This file provides utilities for accessing the authenticated user's session
 * on the client side using NextAuth.
 */

"use client";

import { useSession } from "next-auth/react";

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar?: string | null;
}

/**
 * Hook to get the current user session on the client side
 * 
 * @returns {object} Session data and loading state
 */
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user as User | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}

/**
 * Check if user is authenticated (client-side only)
 * Note: This should only be used in client components.
 * For server components, use the auth() function from @/lib/auth (the NextAuth one in /lib/auth.ts)
 */
export function useIsAuthenticated(): boolean {
  const { status } = useSession();
  return status === "authenticated";
}
