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

    const settings = await request.json();

    // Save settings to database
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        ai_provider: settings.aiProvider,
        ai_keys: settings.aiKeys,
        marketplace_connections: {
          etsy: settings.etsy,
          amazon: settings.amazon,
          shopify: settings.shopify,
        },
        notifications: settings.notifications,
        feature_flags: settings.features,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError(error, 'SettingsSave');
    const { response, statusCode } = handleAPIError(error, '/api/settings/save');
    return NextResponse.json(response, { status: statusCode });
  }
}
