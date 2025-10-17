import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/client';
import { logError } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // For development, skip actual database check and return success
    // This allows onboarding to proceed with mock data
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({
        success: true,
        message: 'Database check skipped in development mode'
      });
    }

    // Use admin client for reliable database checks (bypasses RLS)
    const client = supabaseAdmin || supabase;

    // Test database connection
    const { data, error } = await client
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

    // Check if migrations are applied by looking for key tables
    const tables = ['users', 'trend_data', 'product_listings', 'earnings'];
    const missingTables: string[] = [];

    for (const table of tables) {
      try {
        const { error: tableError } = await client
          .from(table)
          .select('count')
          .limit(1);

        if (tableError) {
          missingTables.push(table);
        }
      } catch {
        missingTables.push(table);
      }
    }

    if (missingTables.length > 0) {
      return NextResponse.json(
        {
          error: `Missing tables: ${missingTables.join(', ')}. Please run database migrations.`
        },
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
