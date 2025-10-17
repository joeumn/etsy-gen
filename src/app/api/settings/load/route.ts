import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userId = session.user.id;

        const { data: settings, error } = await supabase
            .from('user_settings')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code !== 'PGRST116') { // Ignore "not found" error
            console.error('Error loading settings:', error);
            return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 });
        }

        const featureFlags = {
            zig3Studio: process.env.NEXT_PUBLIC_ENABLE_ZIG3_STUDIO === 'true',
            zig4Stripe: process.env.NEXT_PUBLIC_ENABLE_ZIG4_STRIPE === 'true',
            zig5Social: process.env.NEXT_PUBLIC_ENABLE_ZIG5_SOCIAL === 'true',
            zig6Branding: process.env.NEXT_PUBLIC_ENABLE_ZIG6_BRANDING === 'true',
        };

        const systemConfig = {
            hasGeminiKey: !!process.env.GEMINI_API_KEY,
            hasOpenAIKey: !!process.env.OPENAI_API_KEY,
            hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
            hasAzureOpenAIKey: !!process.env.AZURE_OPENAI_API_KEY,
            hasEtsyConfig: !!process.env.ETSY_API_KEY,
            hasShopifyConfig: !!process.env.SHOPIFY_ACCESS_TOKEN,
            hasAmazonConfig: !!process.env.AMAZON_ACCESS_KEY,
            hasSupabaseConfig: !!process.env.SUPABASE_URL,
            hasStripeConfig: !!process.env.STRIPE_SECRET_KEY,
        };

        const defaultSettings = {
            aiProvider: "gemini",
            aiKeys: { gemini: "", openai: "", anthropic: "", azureOpenAI: "" },
            etsy: { connected: false, apiKey: "" },
            amazon: { connected: false, accessKey: "", secretKey: "", region: "us-east-1" },
            shopify: { connected: false, accessToken: "", shopDomain: "" },
            notifications: { email: true, push: false, weeklyReport: true, newTrends: true },
        };

        const mergedSettings = {
            aiProvider: settings?.ai_provider || defaultSettings.aiProvider,
            aiKeys: settings?.ai_keys || defaultSettings.aiKeys,
            etsy: settings?.marketplace_connections?.etsy || defaultSettings.etsy,
            amazon: settings?.marketplace_connections?.amazon || defaultSettings.amazon,
            shopify: settings?.marketplace_connections?.shopify || defaultSettings.shopify,
            notifications: settings?.notifications || defaultSettings.notifications,
            features: featureFlags,
            systemConfig: systemConfig,
        };

        return NextResponse.json(mergedSettings);

    } catch (error) {
        console.error('An unexpected error occurred in settings load route:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}