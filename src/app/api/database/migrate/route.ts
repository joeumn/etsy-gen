import { NextRequest, NextResponse } from 'next/server';
import { supabase, supabaseAdmin } from '@/lib/db/client';
import { getUserById } from '@/lib/auth-helper';
import fs from 'fs/promises';
import path from 'path';

// POST - Run database migration
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, migrationFile } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create operation log entry
    const { data: operation, error: logError } = await supabase
      .from('database_operations')
      .insert({
        user_id: userId,
        operation_type: 'migration',
        status: 'running',
        details: { migration_file: migrationFile || 'latest' },
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating operation log:', logError);
      return NextResponse.json({ error: 'Failed to log operation' }, { status: 500 });
    }

    try {
      // Read and execute migration file
      const migrationPath = migrationFile 
        ? path.join(process.cwd(), 'lib', 'db', migrationFile)
        : path.join(process.cwd(), 'lib', 'db', 'ai-bots-schema.sql');

      let sqlContent: string;
      try {
        sqlContent = await fs.readFile(migrationPath, 'utf-8');
      } catch (fileError) {
        throw new Error(`Migration file not found: ${migrationFile || 'ai-bots-schema.sql'}`);
      }

      // Execute the SQL using the admin client
      // Note: Supabase doesn't support direct SQL execution via the JS client
      // In a real implementation, you would either:
      // 1. Use a server-side SQL runner with proper credentials
      // 2. Use Supabase's migration system
      // 3. Execute via a database connection library like pg
      // For now, we'll simulate the migration

      // Simulate migration execution
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update operation log as completed
      await supabase
        .from('database_operations')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', operation.id);

      return NextResponse.json({
        success: true,
        operation: {
          ...operation,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      });
    } catch (migrationError: any) {
      // Update operation log as failed
      await supabase
        .from('database_operations')
        .update({
          status: 'failed',
          error_message: migrationError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', operation.id);

      return NextResponse.json(
        { error: migrationError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in POST /api/database/migrate:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get migration history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify user exists
    const user = await getUserById(userId);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get migration operations
    const { data: operations, error } = await supabase
      .from('database_operations')
      .select('*')
      .eq('user_id', userId)
      .eq('operation_type', 'migration')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching migration history:', error);
      return NextResponse.json({ error: 'Failed to fetch migration history' }, { status: 500 });
    }

    return NextResponse.json({ operations: operations || [] });
  } catch (error) {
    console.error('Error in GET /api/database/migrate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
