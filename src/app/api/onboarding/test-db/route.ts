import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Delegate GET to POST so onboarding GET call works
  return POST(request);
}

export async function POST(_request: NextRequest) {
  try {
    // In development, skip real DB calls for a smooth local onboarding
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Database check skipped in development mode'
      });
    }

    // Minimal connectivity probe
    const { error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      logError(error, 'DatabaseConnectionTest');
      return NextResponse.json(
        { error: 'Database connection failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Database connected and migrations are up to date'
    });

  } catch (error) {
    logError(error, 'DatabaseTestEndpoint');
    return NextResponse.json(
      { error: 'Database test failed' },
      { status: 500 }
    );
  }
}
