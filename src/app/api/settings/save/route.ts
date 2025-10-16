import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { authOptions } from '@/lib/auth';
import getServerSession from 'next-auth';

export async function POST(request: NextRequest) {
  try {
    // For development, skip authentication and use mock user
    const userId = 'mock-user-1'; // Use the admin user ID

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
