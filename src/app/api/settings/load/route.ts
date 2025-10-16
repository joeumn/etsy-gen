import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';

export async function GET(request: NextRequest) {
  try {
    // For development, use mock user ID
    const userId = 'mock-user-1'; // Use the admin user ID

    // Load settings from database
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error loading settings:', error);
      return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
    }

    // Return default settings if none found
    const defaultSettings = {
      aiProvider: "gemini",
      aiKeys: {
        gemini: "",
        openai: "",
        anthropic: "",
        azureOpenAI: "",
      },
      etsy: {
        connected: false,
        apiKey: "",
      },
      amazon: {
        connected: false,
        accessKey: "",
        secretKey: "",
        region: "us-east-1",
      },
      shopify: {
        connected: false,
        accessToken: "",
        shopDomain: "",
      },
      notifications: {
        email: true,
        push: false,
        weeklyReport: true,
        newTrends: true,
      },
      features: {
        zig3Studio: process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true',
        zig4Stripe: process.env.NEXT_PUBLIC_ENABLE_ZIG4_STRIPE === 'true',
        zig5Social: process.env.NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL === 'true',
        zig6Branding: process.env.NEXT_PUBLIC_ENABLE_ZIG6_BRANDING === 'true',
      },
    };

    // Merge saved settings with defaults
    const mergedSettings = settings ? {
      aiProvider: settings.ai_provider || defaultSettings.aiProvider,
      aiKeys: settings.ai_keys || defaultSettings.aiKeys,
      etsy: settings.marketplace_connections?.etsy || defaultSettings.etsy,
      amazon: settings.marketplace_connections?.amazon || defaultSettings.amazon,
      shopify: settings.marketplace_connections?.shopify || defaultSettings.shopify,
      notifications: settings.notifications || defaultSettings.notifications,
      features: settings.feature_flags || defaultSettings.features,
    } : defaultSettings;

    return NextResponse.json(mergedSettings);
  } catch (error) {
    console.error('Settings load error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
