import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { supabase } from "./db/client";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database
          const { data, error } = await supabase
            .from("users")
            .select("id, email, name, avatar_url, password_hash, role")
            .eq("email", credentials.email)
            .single();

          if (error || !data) {
            return null;
          }

          // Explicitly type the user to help TypeScript
          const user = data as {
            id: string;
            email: string;
            name: string | null;
            avatar_url: string | null;
            password_hash: string;
            role: string;
          };

          // Ensure password_hash is a valid string
          const passwordHash = String(user.password_hash);
          if (!passwordHash || passwordHash === 'undefined' || passwordHash === '[object Object]') {
            return null;
          }

          // Verify password (Supabase type inference issue workaround)
          // @ts-expect-error - Supabase types password_hash as {} incorrectly
          const isPasswordValid: boolean = await bcrypt.compare(credentials.password, passwordHash);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar_url,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
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
        token.id = user.id;
        token.avatar = user.avatar;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper functions for authentication
// Re-export auth helpers
export { hashPassword, verifyPassword, createUser, getUserByEmail, getUserById, authenticateUser, verifyToken } from './auth-helper';

