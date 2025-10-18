# Authentication Setup Guide

## Overview

The application now uses **production-ready authentication** with NextAuth v5 and Supabase. Mock authentication has been completely removed.

## Features

✅ **Email/Password Authentication** - Secure login with bcrypt password hashing  
✅ **User Registration** - New users can sign up via `/signup`  
✅ **Protected Routes** - Automatic redirection to login for unauthenticated users  
✅ **Session Management** - JWT-based sessions with NextAuth  
✅ **User Profile** - Dropdown menu with settings and logout  
✅ **Password Validation** - Strong password requirements enforced  

## Quick Start

### 1. Environment Variables

Create a `.env.local` file in the project root with the following:

```bash
# Required for NextAuth
NEXTAUTH_SECRET=your-random-32-character-secret-here
NEXTAUTH_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 2. Database Setup

The application requires a Supabase PostgreSQL database with the users table. Run the schema migrations:

```bash
# Apply the database schema from lib/db/schema.sql
# This creates the users table with proper structure and RLS policies
```

The users table structure:
- `id` (UUID, primary key)
- `email` (unique, required)
- `password_hash` (bcrypt hashed)
- `name` (optional)
- `role` (user/admin/super_admin)
- `is_active` (boolean)
- `email_verified` (boolean)

### 3. Run the Application

```bash
npm install
npm run dev
```

Navigate to:
- Landing page: http://localhost:3000
- Sign up: http://localhost:3000/signup
- Sign in: http://localhost:3000/login
- Dashboard: http://localhost:3000/dashboard (requires auth)

## Authentication Flow

### Sign Up Flow

1. User visits `/signup`
2. Fills in name, email, password (with strength validation)
3. Password must meet requirements:
   - At least 8 characters
   - One uppercase letter
   - One lowercase letter
   - One number
4. API creates user with hashed password in Supabase
5. User redirected to `/login`

### Sign In Flow

1. User visits `/login`
2. Enters email and password
3. NextAuth validates credentials against Supabase
4. On success, creates JWT session
5. User redirected to `/dashboard`

### Protected Routes

All dashboard and app pages are wrapped with `ProtectedRoute` component:

```tsx
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function MyPage() {
  return (
    <ProtectedRoute>
      {/* Your protected content */}
    </ProtectedRoute>
  );
}
```

If user is not authenticated, they are automatically redirected to `/login`.

## API Routes

### POST /api/auth/signup

Create a new user account.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Error (409 Conflict):**
```json
{
  "error": "An account with this email already exists"
}
```

### POST /api/auth/signin

Handled automatically by NextAuth.

```bash
POST /api/auth/signin
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

### POST /api/auth/signout

Log out the current user.

```bash
POST /api/auth/signout
```

## Using Authentication in Components

### Client Components

```tsx
"use client";

import { useSession, signOut } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  if (status === "unauthenticated") {
    return <div>Please sign in</div>;
  }
  
  return (
    <div>
      <p>Welcome, {session?.user?.name}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  );
}
```

### Server Components

```tsx
import { auth } from "@/lib/auth";

export default async function ServerComponent() {
  const session = await auth();
  
  if (!session) {
    redirect("/login");
  }
  
  return <div>Welcome, {session.user.name}</div>;
}
```

### Custom Hook (Legacy Support)

For backward compatibility with existing code:

```tsx
"use client";

import { useAuth } from "@/lib/auth";

export function MyLegacyComponent() {
  const { user, isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;
  
  return <div>Hello, {user?.name}</div>;
}
```

## Middleware Configuration

The `middleware.ts` file protects API routes:

```typescript
// Public API routes (no auth required)
const publicApiRoutes = [
  '/api/auth',      // NextAuth endpoints
  '/api/health',    // Health check
  '/api/onboarding' // Public onboarding
];

// All other /api/* routes require authentication
```

## Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Sessions**: Secure, stateless sessions
- **Row-Level Security (RLS)**: Enforced at database level
- **HTTP-Only Cookies**: Session tokens not accessible via JavaScript
- **CSRF Protection**: Built into NextAuth
- **Password Strength**: Enforced client and server-side

## Migration from Mock Auth

**What was removed:**
- ❌ `FORCE_MOCK_AUTH` environment variable
- ❌ Mock user auto-login in middleware
- ❌ Client-side localStorage-based auth
- ❌ Hardcoded credentials in `lib/auth-mock.ts`
- ❌ `src/lib/auth.ts` AuthService class

**What was added:**
- ✅ NextAuth v5 integration
- ✅ Supabase credential provider
- ✅ `/login` and `/signup` pages
- ✅ `ProtectedRoute` component
- ✅ User dropdown with logout
- ✅ Proper session management

## Troubleshooting

### "Unauthorized - Please sign in" on API routes

- Check that `NEXTAUTH_SECRET` is set
- Verify user is logged in (check browser cookies)
- Ensure API route is not in `publicApiRoutes` if it should be public

### Build fails with "Missing NEXT_PUBLIC_SUPABASE_URL"

- Make sure `.env.local` exists
- Verify all required environment variables are set
- Restart dev server after adding env vars

### User can't sign up

- Check Supabase database is accessible
- Verify `users` table exists with correct schema
- Check RLS policies allow INSERT for new users
- Look at server logs for detailed error messages

### Session not persisting

- Clear browser cookies
- Check `NEXTAUTH_URL` matches your current URL
- Verify `NEXTAUTH_SECRET` is set and consistent

## Production Deployment

### Environment Variables (Vercel/Production)

Set these in your deployment platform:

```bash
NEXTAUTH_SECRET=<generate-new-secret-for-prod>
NEXTAUTH_URL=https://yourdomain.com
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

### Checklist

- [ ] Set all environment variables
- [ ] Run database migrations in production Supabase
- [ ] Test signup and login flows
- [ ] Verify RLS policies are enabled
- [ ] Test protected routes redirect to login
- [ ] Confirm logout works correctly

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

## Support

If you encounter issues:

1. Check browser console for errors
2. Check server logs (`npm run dev` output)
3. Verify all environment variables are set
4. Ensure Supabase database is properly configured
5. Review the migration guide above
