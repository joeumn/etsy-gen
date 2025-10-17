import { NextResponse } from 'next/server';

/**
 * Get feature flags from server-side environment variables
 * These are system-wide settings controlled by Vercel environment variables
 */
export async function GET() {
  try {
    // Read feature flags from environment
    const featureFlags = {
      zig3Studio: process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true',
      zig4Stripe: process.env.NEXT_PUBLIC_ENABLE_ZIG4_STRIPE === 'true',
      zig5Social: process.env.NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL === 'true',
      zig6Branding: process.env.NEXT_PUBLIC_ENABLE_ZIG6_BRANDING === 'true',
    };

    // Get system configuration status
    const systemConfig = {
      hasGeminiKey: !!process.env.GEMINI_API_KEY,
      hasOpenAIKey: !!process.env.OPENAI_API_KEY,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      hasAzureOpenAIKey: !!process.env.AZURE_OPENAI_API_KEY,
      hasEtsyConfig: !!(process.env.ETSY_API_KEY && process.env.ETSY_API_SECRET),
      hasShopifyConfig: !!(process.env.SHOPIFY_ACCESS_TOKEN && process.env.SHOPIFY_SHOP_DOMAIN),
      hasAmazonConfig: !!(process.env.AMAZON_ACCESS_KEY && process.env.AMAZON_SECRET_KEY),
      hasStripeConfig: !!(process.env.STRIPE_SECRET_KEY && process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
      hasSupabaseConfig: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
    };

    return NextResponse.json({
      features: featureFlags,
      systemConfig,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature flags' },
      { status: 500 }
    );
  }
}
