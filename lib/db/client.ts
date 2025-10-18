import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Only show detailed connection errors in a non-build, production-like environment
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build' && (!supabaseUrl || !supabaseKey)) {
  console.error('--- DATABASE CONNECTION FAILED ---');
  console.error('REASON: Supabase client-side environment variables not found.');
  if (!supabaseUrl) {
    console.error('MISSING: NEXT_PUBLIC_SUPABASE_URL was not found.');
  }
  if (!supabaseKey) {
    console.error('MISSING: NEXT_PUBLIC_SUPABASE_ANON_KEY was not found.');
  }
  console.error('SOLUTION: Please ensure these variables are set in your Vercel project environment variables.');
  console.error('------------------------------------');
}

// Initialize the Supabase client, using a placeholder if variables are missing to avoid crashing the app.
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Also check for the admin key, which is used for server-side operations.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only show detailed connection errors in a non-build, production-like environment
if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE !== 'phase-production-build' && !supabaseServiceRoleKey) {
    console.warn('--- ADMIN-LEVEL DB CONNECTION WARNING ---');
    console.warn('REASON: Supabase server-side environment variable not found.');
    console.warn('MISSING: SUPABASE_SERVICE_ROLE_KEY was not found.');
    console.warn('IMPACT: Admin-level operations will fail. Please set this variable for full functionality.');
    console.warn('------------------------------------');
}

// Initialize the admin client, falling back to the regular client if the service key is missing.
const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase;

export { supabase, supabaseAdmin };
export default supabase;