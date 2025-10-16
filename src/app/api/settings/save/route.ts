import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';

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
      userId = searchParams.get('userId') || 'mock-user-1';
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
      console.error('Error saving settings:', error);
      return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings save error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
