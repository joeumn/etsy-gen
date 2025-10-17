import { NextRequest, NextResponse } from 'next/server';
import { supabase, adminSupabase } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';

export async function POST(request: NextRequest) {
  try {
    // Get user ID from request
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user exists and is admin
    const user = await getUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const action = body.action;

    const db = adminSupabase ?? supabase;

    if (action === 'test') {
      try {
        const { error } = await db.from('users').select('count').limit(1);
        if (error) {
          return NextResponse.json({
            success: false,
            connected: false,
            error: error.message,
            message: 'Database connection failed',
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          connected: true,
          message: 'Database connected successfully',
        });
      } catch (error) {
        return NextResponse.json({
          success: false,
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Database connection error',
        }, { status: 500 });
      }
    }

    if (action === 'check-tables') {
      const requiredTables = [
        'users',
        'user_settings',
        'trend_data',
        'generated_products',
        'product_listings',
        'earnings',
        'feature_flags',
        'ai_generation_logs',
        'marketplace_api_logs',
      ];

      const tableStatus: Record<string, boolean> = {};
      let allTablesExist = true;

      for (const table of requiredTables) {
        try {
          const { error } = await db.from(table).select('count').limit(1);
          tableStatus[table] = !error;
          if (error) allTablesExist = false;
        } catch {
          tableStatus[table] = false;
          allTablesExist = false;
        }
      }

      return NextResponse.json({
        success: true,
        allTablesExist,
        tables: tableStatus,
        message: allTablesExist 
          ? 'All required tables exist' 
          : 'Some tables are missing. Please run migrations in your Supabase dashboard.',
      });
    }

    if (action === 'fix-user-settings') {
      return NextResponse.json({
        success: false,
        message: 'Please run the fix-user-settings-migration.sql file in your Supabase SQL Editor',
        sql_file: '/lib/db/fix-user-settings-migration.sql',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const user = await getUserById(userId);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const db = adminSupabase ?? supabase;

    let dbConnected = false;
    let dbError: string | null = null;

    try {
      const { error } = await db.from('users').select('count').limit(1);
      dbConnected = !error;
      dbError = error?.message || null;
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }

    const hasSupabaseConfig = !!(
      process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
    );

    return NextResponse.json({
      connected: dbConnected,
      hasConfig: hasSupabaseConfig,
      error: dbError,
      supabaseUrl: process.env.SUPABASE_URL
        ? process.env.SUPABASE_URL.replace(/^https?:\/\/([^.]+)\..*$/, '***$1***')
        : null,
    });

  } catch (error) {
    console.error('Database status check error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
}
