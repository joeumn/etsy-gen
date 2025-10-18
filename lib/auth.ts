import NextAuth, { type NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabaseAdmin } from "./db/client";
import bcrypt from "bcryptjs";

export const authConfig: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log('[NextAuth] Authorize function called');
        
        if (!credentials?.email || !credentials?.password) {
          console.error('[NextAuth] Missing credentials - email or password not provided');
          throw new Error('Email and password are required');
        }

        console.log(`[NextAuth] Attempting to authenticate user: ${credentials.email}`);

        try {
          // Get user from database using admin client to bypass RLS
          const { data, error } = await supabaseAdmin
            .from("users")
            .select("id, email, name, avatar_url, password_hash, role, is_active")
            .eq("email", credentials.email)
            .single();

          if (error) {
            console.error('[NextAuth] Database error:', error.message);
            throw new Error('Failed to lookup user in database');
          }

          if (!data) {
            console.error('[NextAuth] User not found in database:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log(`[NextAuth] User found in database: ${data.id}`);

          // Explicitly type the user to help TypeScript
          const user = data as {
            id: string;
            email: string;
            name: string | null;
            avatar_url: string | null;
            password_hash: string;
            role: string;
            is_active: boolean;
          };

          // Check if account is active
          if (!user.is_active) {
            console.error('[NextAuth] Account is inactive:', credentials.email);
            throw new Error('Account is inactive. Please contact support.');
          }

          // Ensure password_hash is a valid string
          const passwordHash = String(user.password_hash);
          if (!passwordHash || passwordHash === 'undefined' || passwordHash === '[object Object]') {
            console.error('[NextAuth] Invalid password hash format in database');
            throw new Error('Account configuration error. Please contact support.');
          }

          console.log('[NextAuth] Verifying password...');

          // Verify password
          const isPasswordValid = await bcrypt.compare(
            String(credentials.password), 
            passwordHash
          );

          if (!isPasswordValid) {
            console.error('[NextAuth] Password verification failed for:', credentials.email);
            throw new Error('Invalid email or password');
          }

          console.log('[NextAuth] Authentication successful for user:', user.id);

          // Update last login timestamp (non-blocking)
          supabaseAdmin
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', user.id)
            .then(({ error }) => {
              if (error) {
                console.warn('[NextAuth] Failed to update last_login_at:', error);
              } else {
                console.log('[NextAuth] Updated last_login_at');
              }
            });

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar_url,
          };
        } catch (error: any) {
          console.error("[NextAuth] Auth error:", error.message || error);
          // Throw the error to provide better feedback to the user
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        console.log('[NextAuth JWT] Creating JWT for user:', user.id);
        // Set both 'id' and 'sub' for compatibility
        token.id = user.id;
        token.sub = user.id;
        token.email = user.email;
        token.name = user.name;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        console.log('[NextAuth Session] Creating session for token.id:', token.id || token.sub);
        session.user.id = token.id as string || token.sub as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.avatar = token.avatar as string;
        
        // Ensure session.user.id is set
        if (!session.user.id) {
          console.error('[NextAuth Session] Warning: session.user.id is not set!');
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Create the NextAuth instance
export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

// Helper functions for authentication
// Re-export auth helpers
export { hashPassword, verifyPassword, createUser, getUserByEmail, getUserById, authenticateUser, verifyToken } from './auth-helper';

