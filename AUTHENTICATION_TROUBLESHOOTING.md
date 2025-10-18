# Authentication Troubleshooting Guide

This guide helps diagnose and fix authentication issues in the Etsy-Gen application.

## Overview

The application uses **NextAuth v5** with a **CredentialsProvider** for username/password authentication. The authentication flow involves:

1. User submits credentials via the `/login` page
2. NextAuth's CredentialsProvider validates credentials against the database
3. On success, a JWT token is created and stored in a cookie
4. Middleware validates the JWT for protected API routes
5. API routes access user information via `x-user-id` header

## Architecture

```
┌─────────────┐
│ Login Page  │ (/login)
└──────┬──────┘
       │ POST credentials
       ▼
┌─────────────────────────────────┐
│ NextAuth CredentialsProvider    │ (lib/auth.ts)
│  - Queries database             │
│  - Verifies password with bcrypt│
│  - Returns user object or throws│
└──────┬──────────────────────────┘
       │ Success
       ▼
┌─────────────────────────────────┐
│ JWT Callback                    │
│  - Sets token.id = user.id      │
│  - Sets token.sub = user.id     │
│  - Includes email, name, avatar │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Session Callback                │
│  - Populates session.user       │
│  - Ensures user.id is set       │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ Middleware                      │ (middleware.ts)
│  - Validates JWT on API routes  │
│  - Extracts user ID from token  │
│  - Sets x-user-id header        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│ API Route                       │
│  - Reads x-user-id header       │
│  - Scopes queries to user       │
└─────────────────────────────────┘
```

## Common Issues and Solutions

### Issue 1: CredentialsSignin Error

**Symptom:** Users cannot log in, error shows `CredentialsSignin` in logs.

**Causes and Solutions:**

#### 1.1 Missing or Invalid Credentials
- **Check:** Are email and password provided?
- **Log Output:** `[NextAuth] Missing credentials - email or password not provided`
- **Solution:** Ensure the login form sends both email and password

#### 1.2 User Not Found in Database
- **Check:** Does the user exist in the database?
- **Log Output:** `[NextAuth] User not found in database: user@example.com`
- **Solution:** 
  - Create user account via `/signup` endpoint
  - Verify database connection is working
  - Check Supabase credentials in environment variables

#### 1.3 Incorrect Password
- **Check:** Is the password correct?
- **Log Output:** `[NextAuth] Password verification failed for: user@example.com`
- **Solution:**
  - Verify user is entering correct password
  - Check password hash in database is valid bcrypt hash
  - Ensure password was hashed with `bcryptjs.hash(password, 12)`

#### 1.4 Inactive Account
- **Check:** Is `is_active` set to `true` in the database?
- **Log Output:** `[NextAuth] Account is inactive: user@example.com`
- **Solution:** Update the user's `is_active` column to `true`

#### 1.5 Database Connection Error
- **Check:** Can the app connect to Supabase?
- **Log Output:** `[NextAuth] Database error: [error message]`
- **Solution:**
  - Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
  - Check Supabase project is active
  - Verify network connectivity

### Issue 2: 401 Unauthorized on API Routes

**Symptom:** API routes return 401 even after successful login.

**Causes and Solutions:**

#### 2.1 Missing NEXTAUTH_SECRET
- **Check:** Is `NEXTAUTH_SECRET` set?
- **Log Output:** `⚠️ NEXTAUTH_SECRET is not set!`
- **Solution:**
  ```bash
  # Generate a secret
  openssl rand -base64 32
  
  # Add to .env.local
  NEXTAUTH_SECRET=your-generated-secret
  ```

#### 2.2 Token Not Found in Middleware
- **Check:** Is the JWT cookie present?
- **Log Output:** `[Middleware] No valid token found for /api/...`
- **Solution:**
  - Clear browser cookies and log in again
  - Check if login was successful
  - Verify NEXTAUTH_SECRET is the same in all environments

#### 2.3 Token Missing User ID
- **Check:** Does the token contain user ID?
- **Log Output:** `[Middleware] Token missing user ID: {...}`
- **Solution:**
  - This indicates JWT callback is not setting `token.id` properly
  - Verify JWT callback in `lib/auth.ts` is executing
  - Check for errors in JWT callback

#### 2.4 Headers Not Propagating
- **Check:** Is `x-user-id` header reaching the API route?
- **Log Output:** API route logs show `userId` is null
- **Solution:**
  - Verify middleware is running (check matcher in `middleware.ts`)
  - Check if route is in `publicApiRoutes` list (should not be)

### Issue 3: Database Query Permissions

**Symptom:** Database queries fail with permission errors.

**Solution:**
- Authentication queries use `supabaseAdmin` which bypasses RLS
- User-scoped queries in API routes should use regular `supabase` client
- Ensure all user-scoped queries include `.eq('user_id', userId)`

## Debugging Steps

### 1. Enable Debug Logging

The app now includes comprehensive logging for authentication:

- `[NextAuth]` prefix: Auth provider logs
- `[NextAuth JWT]` prefix: JWT callback logs  
- `[NextAuth Session]` prefix: Session callback logs
- `[Middleware]` prefix: Middleware logs

In development, set `debug: true` in NextAuth config (already enabled).

### 2. Check Environment Variables

Required variables:
```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_SECRET=your-32-char-secret
NEXTAUTH_URL=http://localhost:3000  # or your production URL
```

### 3. Test Authentication Flow

#### Test 1: Create a User
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","name":"Test User"}'
```

#### Test 2: Log In
- Navigate to `/login`
- Enter credentials
- Check browser console and server logs for errors

#### Test 3: Access Protected API
```bash
# This should return 401 if not logged in
curl http://localhost:3000/api/dashboard/stats

# After login, should return data
curl http://localhost:3000/api/dashboard/stats \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### 4. Check Database Schema

Verify the `users` table exists with correct columns:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';
```

Required columns:
- `id` (UUID)
- `email` (VARCHAR)
- `password_hash` (VARCHAR)
- `name` (VARCHAR, nullable)
- `avatar_url` (TEXT, nullable)
- `role` (VARCHAR)
- `is_active` (BOOLEAN)
- `email_verified` (BOOLEAN)
- `last_login_at` (TIMESTAMP)

### 5. Inspect JWT Token

Use jwt.io or similar to decode the JWT cookie:

Expected claims:
```json
{
  "id": "user-uuid",
  "sub": "user-uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "url or null",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Security Considerations

1. **Never log passwords** - The code now logs only email addresses, not passwords
2. **Use admin client carefully** - `supabaseAdmin` bypasses RLS, only use for auth
3. **Validate user input** - All user inputs should be validated
4. **Use HTTPS in production** - Never send credentials over HTTP
5. **Rotate NEXTAUTH_SECRET** - Change secret if compromised
6. **Set secure cookie flags** - NextAuth handles this automatically

## Performance Notes

1. **Last login update is non-blocking** - Won't slow down login
2. **JWT strategy** - Faster than database sessions, no DB lookup on each request
3. **Middleware is edge-compatible** - Can run on edge networks

## Support

If issues persist:
1. Check Vercel logs for detailed error messages
2. Enable debug mode: `debug: true` in authConfig
3. Review the code changes in this PR
4. Open an issue with:
   - Error messages from logs
   - Steps to reproduce
   - Environment (dev/production)
