// lib/supabase/index.ts
// Consolidated Supabase client initialization
// This file exports all Supabase client types needed across the application

// Export browser client (for client components)
export { createClient as createBrowserClient } from './browser-client';

// Export server client (for server-side with user context via cookies)
export { createClient as createServerClient } from './server-client';

// Export admin client (for server-side admin operations, bypassing RLS)
export { supabase, supabaseAdmin } from './admin-client';
