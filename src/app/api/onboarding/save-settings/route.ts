import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from authorization header or query params
    const authHeader = request.headers.get('authorization');
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        userId = decoded.split(':')[0];
      } catch {
        // Continue without userId
      }
    }

    if (!userId) {
      const { searchParams } = new URL(request.url);
      userId = searchParams.get('userId');
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      geminiApiKey,
      marketplaceKeys,
      features
    } = await request.json();

    // Save API keys (in production, these should be encrypted)
    const settingsData = {
      user_id: userId,
      gemini_api_key: geminiApiKey,
      etsy_api_key: marketplaceKeys?.etsy?.apiKey || null,
      amazon_access_key: marketplaceKeys?.amazon?.accessKey || null,
      amazon_secret_key: marketplaceKeys?.amazon?.secretKey || null,
      shopify_access_token: marketplaceKeys?.shopify?.accessToken || null,
      shopify_shop_domain: marketplaceKeys?.shopify?.shopDomain || null,
      features: features || {},
      updated_at: new Date().toISOString()
    };

    // Upsert user settings
    const { error } = await supabase
      .from('user_settings')
      .upsert(settingsData, {
        onConflict: 'user_id'
      });

    if (error) {
      logError(error, 'SettingsSave');
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    // Update user onboarding status
    await supabase
      .from('users')
      .update({
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      message: 'Settings saved successfully'
    });

  } catch (error) {
    logError(error, 'SettingsSaveEndpoint');
    return NextResponse.json(
      { error: 'Settings save failed' },
      { status: 500 }
    );
  }
}
