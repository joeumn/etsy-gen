# Supabase Client Usage Guide

This guide explains how to use the consolidated Supabase client structure in the Etsy-Gen application.

## Overview

The application now uses a unified Supabase client structure located in `lib/supabase/`. This structure provides three distinct client types for different use cases:

1. **Browser Client** - For client-side components
2. **Server Client** - For server-side operations with user context (respects RLS)
3. **Admin Client** - For server-side admin operations (bypasses RLS)

## Client Types

### 1. Browser Client (`browser-client.ts`)

**Use when:** You're in a React Client Component and need to interact with Supabase.

**Technology:** Uses `@supabase/ssr` with `createBrowserClient`

**Import:**
```typescript
import { createClient } from '@/lib/supabase/client';
// or
import { createBrowserClient } from '@/lib/supabase';
```

**Example:**
```typescript
'use client'

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';

export default function MyComponent({ userId }: { userId: string }) {
  const [products, setProducts] = useState([]);
  const supabase = createClient();
  
  // Use the client
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId);
      
      if (!error && data) {
        setProducts(data);
      }
    };
    
    fetchData();
  }, [userId]);
  
  return <div>...</div>;
}
```

**Key Points:**
- Only works in client components (`'use client'` directive)
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
- Automatically handles authentication via cookies
- Respects Row Level Security (RLS) policies

---

### 2. Server Client (`server-client.ts`)

**Use when:** You're in a Server Component, API Route, or Server Action and need user-scoped database access.

**Technology:** Uses `@supabase/ssr` with `createServerClient` and Next.js cookies

**Import:**
```typescript
import { createClient } from '@/lib/supabase/server';
// or
import { createServerClient } from '@/lib/supabase';
```

**Example in API Route:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  
  // Get the current user from the session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Query data scoped to the authenticated user
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('user_id', session.user.id);
    
  return NextResponse.json({ data });
}
```

**Key Points:**
- Must be called with `await` (it's an async function)
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables
- Automatically manages cookies for authentication
- Respects Row Level Security (RLS) policies
- User context is maintained via cookies

---

### 3. Admin Client (`admin-client.ts`)

**Use when:** You need server-side admin access that bypasses RLS (e.g., authentication, user management, system operations).

**Technology:** Uses `@supabase/supabase-js` with service role key

**Import:**
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase/admin-client';
```

**Example:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function GET(request: NextRequest) {
  // Admin client bypasses RLS - use with caution!
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*');
    
  return NextResponse.json({ data });
}
```

**Example in Authentication (lib/auth.ts):**
```typescript
import { supabaseAdmin } from './supabase/admin-client';

// Query user without RLS restrictions
const { data, error } = await supabaseAdmin
  .from('users')
  .select('id, email, password_hash')
  .eq('email', email)
  .single();
```

**Key Points:**
- **BYPASSES Row Level Security** - Use with extreme caution!
- Uses `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` environment variables
- Only use for admin operations like:
  - User authentication
  - Admin dashboards
  - System-level operations
  - Bulk operations
- Never expose to the client side
- Always validate permissions before using

---

## Migration from Old Structure

### Before (❌ Old)
```typescript
// lib/db/client.ts
import { supabase, supabaseAdmin } from '@/lib/db/client';
```

### After (✅ New)
```typescript
// For admin operations (bypasses RLS)
import { supabase, supabaseAdmin } from '@/lib/supabase/admin-client';

// For server-side with user context (respects RLS)
import { createClient } from '@/lib/supabase/server';
const supabase = await createClient();

// For client components (respects RLS)
import { createClient } from '@/lib/supabase/client';
const supabase = createClient();
```

---

## Environment Variables

Ensure these environment variables are set:

```bash
# Public variables (accessible in browser)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server-only variables (never exposed to browser)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Best Practices

### 1. **Always Use RLS-Respecting Clients When Possible**
   - Prefer `server-client.ts` or `browser-client.ts` over `admin-client.ts`
   - Only use admin client when absolutely necessary

### 2. **Multi-Tenancy is Critical**
   - Always scope queries to the authenticated user
   - Use `eq('user_id', userId)` in your queries
   - Let RLS policies enforce data isolation

### 3. **Error Handling**
   ```typescript
   const { data, error } = await supabase
     .from('products')
     .select('*')
     .eq('user_id', userId);
     
   if (error) {
     console.error('Database error:', error);
     return NextResponse.json({ error: error.message }, { status: 500 });
   }
   ```

### 4. **Type Safety**
   ```typescript
   interface Product {
     id: string;
     user_id: string;
     name: string;
     price: number;
   }
   
   const { data, error } = await supabase
     .from('products')
     .select('*');
     
   // Type the result
   const products = data as Product[];
   ```

---

## Common Use Cases

### Client Component Data Fetching
```typescript
'use client'

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const supabase = createClient();
  
  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await supabase
        .from('products')
        .select('*');
      setProducts((data as Product[]) || []);
    };
    
    fetchProducts();
  }, []);
  
  return <div>...</div>;
}
```

### API Route with User Context
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const body = await request.json();
  
  const { data, error } = await supabase
    .from('products')
    .insert({
      ...body,
      user_id: session.user.id, // Always scope to user
    });
    
  return NextResponse.json({ data });
}
```

### Admin Operation
```typescript
import { supabaseAdmin } from '@/lib/supabase/admin-client';

export async function getAllUsers() {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, created_at, is_active');
    
  if (error) throw error;
  return data;
}
```

---

## Security Considerations

1. **Never use admin client in client components**
2. **Always validate user permissions before admin operations**
3. **Use RLS policies on all tables**
4. **Keep service role key secure and server-side only**
5. **Audit admin client usage regularly**

---

## Troubleshooting

### "Missing NEXT_PUBLIC_SUPABASE_URL" Error
- Ensure environment variables are set in `.env.local`
- Restart the dev server after changing environment variables

### "Unauthorized" Errors
- Check if the user is authenticated
- Verify RLS policies allow the operation
- Ensure `user_id` is correctly scoped

### Admin Operations Failing
- Verify `SUPABASE_SERVICE_ROLE_KEY` is set
- Check that you're using `supabaseAdmin` from `admin-client.ts`
- Ensure the operation is running server-side

---

## References

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
