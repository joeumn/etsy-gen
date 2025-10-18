import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we're in build phase (allow placeholders during build)
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

// Log missing configuration during runtime for better debugging
if (typeof window === 'undefined' && !isBuildPhase) {
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Database Configuration Warning:');
    if (!supabaseUrl) {
      console.warn('  - NEXT_PUBLIC_SUPABASE_URL is not set');
    }
    if (!supabaseKey) {
      console.warn('  - NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    }
    console.warn('  → Database operations will fail until these are configured.');
    console.warn('  → See .env.example for required configuration.');
  }
}

// Initialize the Supabase client
// During build: allow placeholder to prevent build failures
// During runtime: use real credentials or placeholder (will fail on actual DB operations)
const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Also check for the admin key, which is used for server-side operations.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Log admin key warning
if (typeof window === 'undefined' && process.env.NEXT_PHASE !== 'phase-production-build' && !supabaseServiceRoleKey) {
    console.warn('⚠️ Admin Database Access Warning:');
    console.warn('  - SUPABASE_SERVICE_ROLE_KEY is not set');
    console.warn('  → Admin-level operations will be limited.');
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