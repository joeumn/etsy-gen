import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { logError } from '@/lib/logger';
import { handleAPIError } from '@/lib/errors';

/**
 * Google Drive Integration API
 * Handles configuration and connection to Google Drive
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, clientId, clientSecret, refreshToken, folderId } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Save or update Google Drive configuration
    const { data, error } = await supabase
      .from('google_drive_config')
      .upsert({
        user_id: userId,
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        folder_id: folderId,
        is_active: true,
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
      message: 'Google Drive integration configured successfully',
      config: {
        id: data.id,
        folderId: data.folder_id,
        isActive: data.is_active,
      },
    });
  } catch (error) {
    logError(error, 'GoogleDriveConfig');
    const { response, statusCode } = handleAPIError(error, '/api/integrations/google-drive/config');
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
      .from('google_drive_config')
      .select('id, folder_id, is_active, created_at, updated_at')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      config: data || null,
    });
  } catch (error) {
    logError(error, 'GoogleDriveConfig');
    const { response, statusCode } = handleAPIError(error, '/api/integrations/google-drive/config');
    return NextResponse.json(response, { status: statusCode });
  }
}
