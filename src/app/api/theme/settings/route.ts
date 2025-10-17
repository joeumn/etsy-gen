import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';

/**
 * Theme Settings API
 * Manages user theme customizations
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, themeName, primaryColor, secondaryColor, accentColor, darkMode, fontFamily, customCss } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('theme_settings')
      .upsert({
        user_id: userId,
        theme_name: themeName || 'default',
        primary_color: primaryColor || '#2D9CDB',
        secondary_color: secondaryColor || '#FF6B22',
        accent_color: accentColor || '#FFC400',
        dark_mode: darkMode ?? false,
        font_family: fontFamily,
        custom_css: customCss,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Theme settings saved successfully',
      theme: data,
    });
  } catch (error) {
    logError(error, 'ThemeSettings');
    const { response, statusCode } = handleAPIError(error, '/api/theme/settings');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('theme_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      theme: data || {
        theme_name: 'default',
        primary_color: '#2D9CDB',
        secondary_color: '#FF6B22',
        accent_color: '#FFC400',
        dark_mode: false,
      },
    });
  } catch (error) {
    logError(error, 'ThemeSettings');
    const { response, statusCode } = handleAPIError(error, '/api/theme/settings');
    return NextResponse.json(response, { status: statusCode });
  }
}
