import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { AuthenticationError, handleAPIError } from '@/lib/errors';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    
    // Decode token to get user ID
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split(':')[0];
    } catch {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new AuthenticationError('User not found');
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
    const { response, statusCode } = handleAPIError(error, '/api/onboarding/save-settings');
    return NextResponse.json(response, { status: statusCode });
  }
}
