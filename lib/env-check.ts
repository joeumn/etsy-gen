/**
 * Environment Variable Validation
 * Helps debug environment variable loading issues
 */

export interface EnvCheckResult {
  name: string;
  value: string | undefined;
  isSet: boolean;
  isPublic: boolean;
}

/**
 * Check all environment variables and return their status
 */
export function checkEnvironmentVariables(): EnvCheckResult[] {
  const envVars = [
    // Database
    { name: 'SUPABASE_URL', isPublic: false },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', isPublic: true },
    { name: 'SUPABASE_ANON_KEY', isPublic: false },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', isPublic: true },
    
    // Auth
    { name: 'NEXTAUTH_SECRET', isPublic: false },
    { name: 'NEXTAUTH_URL', isPublic: false },
    
    // AI Providers
    { name: 'GEMINI_API_KEY', isPublic: false },
    { name: 'OPENAI_API_KEY', isPublic: false },
    { name: 'ANTHROPIC_API_KEY', isPublic: false },
    { name: 'AZURE_OPENAI_API_KEY', isPublic: false },
    
    // Marketplaces
    { name: 'ETSY_API_KEY', isPublic: false },
    { name: 'SHOPIFY_ACCESS_TOKEN', isPublic: false },
    { name: 'AMAZON_ACCESS_KEY', isPublic: false },
    
    // Feature Flags
    { name: 'NEXT_PUBLIC_ENABLE_ZIG3_STUDIO', isPublic: true },
    { name: 'NEXT_PUBLIC_ENABLE_ZIG4_STRIPE', isPublic: true },
    { name: 'NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL', isPublic: true },
    { name: 'NEXT_PUBLIC_ENABLE_ZIG6_BRANDING', isPublic: true },
    
    // Stripe
    { name: 'STRIPE_SECRET_KEY', isPublic: false },
    { name: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', isPublic: true },
  ];

  return envVars.map(({ name, isPublic }) => {
    const value = process.env[name];
    return {
      name,
      value: value ? '***SET***' : undefined,
      isSet: !!value,
      isPublic,
    };
  });
}

/**
 * Get a summary of environment configuration status
 */
export function getEnvironmentSummary() {
  const results = checkEnvironmentVariables();
  
  return {
    total: results.length,
    set: results.filter(r => r.isSet).length,
    missing: results.filter(r => !r.isSet).length,
    publicVars: results.filter(r => r.isPublic).length,
    privateVars: results.filter(r => !r.isPublic).length,
    results,
  };
}

/**
 * Check if critical environment variables are set
 */
export function checkCriticalEnvVars(): { isValid: boolean; missing: string[] } {
  const critical = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'NEXTAUTH_SECRET',
  ];

  const missing = critical.filter(name => !process.env[name]);

  return {
    isValid: missing.length === 0,
    missing,
  };
}

/**
 * Get feature flag status
 */
export function getFeatureFlagStatus() {
  return {
    zig3Studio: process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true',
    zig4Stripe: process.env.NEXT_PUBLIC_ENABLE_ZIG4_STRIPE === 'true',
    zig5Social: process.env.NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL === 'true',
    zig6Branding: process.env.NEXT_PUBLIC_ENABLE_ZIG6_BRANDING === 'true',
  };
}

/**
 * Check if running in Vercel
 */
export function isVercel(): boolean {
  return process.env.VERCEL === '1';
}

/**
 * Check if in production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Log environment status to console (server-side only)
 */
export function logEnvironmentStatus() {
  if (typeof window !== 'undefined') {
    console.warn('Environment status logging is only available server-side');
    return;
  }

  const summary = getEnvironmentSummary();
  const critical = checkCriticalEnvVars();
  const features = getFeatureFlagStatus();

  console.log('=== Environment Status ===');
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Vercel: ${isVercel()}`);
  console.log(`Production: ${isProduction()}`);
  console.log('\n=== Environment Variables ===');
  console.log(`Total: ${summary.total}`);
  console.log(`Set: ${summary.set}`);
  console.log(`Missing: ${summary.missing}`);
  console.log('\n=== Critical Variables ===');
  console.log(`Valid: ${critical.isValid}`);
  if (critical.missing.length > 0) {
    console.log(`Missing: ${critical.missing.join(', ')}`);
  }
  console.log('\n=== Feature Flags ===');
  console.log(JSON.stringify(features, null, 2));
  console.log('======================\n');
}
