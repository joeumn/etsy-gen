import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/client';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  // Delegate GET to POST so onboarding GET call works
  return POST(request);
}

export async function POST(_request: NextRequest) {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { 
          error: 'Database credentials not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.',
          success: false 
        },
        { status: 500 }
      );
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
        { 
          error: `Database connection failed: ${error.message}`,
          success: false 
        },
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
          error: `Missing tables: ${missingTables.join(', ')}. Please run database migrations.`,
          success: false
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
      { 
        error: `Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false 
      },
      { status: 500 }
    );
  }
}
