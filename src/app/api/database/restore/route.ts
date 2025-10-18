import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { getUserById, getUserByEmail } from '@/lib/auth-helper';

// POST - Restore database from backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, backupId } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
    }

    // Try to get user by ID first, then by email if that fails
    let user = await getUserById(userId);
    if (!user && userId.includes('@')) {
      user = await getUserByEmail(userId);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify backup exists and belongs to user
    const { data: backupOperation, error: backupError } = await supabase
      .from('database_operations')
      .select('*')
      .eq('id', backupId)
      .eq('user_id', user.id)
      .eq('operation_type', 'backup')
      .single();

    if (backupError || !backupOperation) {
      return NextResponse.json(
        { error: 'Backup not found or unauthorized' },
        { status: 404 }
      );
    }

    if (backupOperation.status !== 'completed') {
      return NextResponse.json(
        { error: 'Backup is not completed or has failed' },
        { status: 400 }
      );
    }

    // Create operation log entry
    const { data: operation, error: logError } = await supabase
      .from('database_operations')
      .insert({
        user_id: user.id,
        operation_type: 'restore',
        status: 'running',
        details: {
          backup_id: backupId,
          backup_file: backupOperation.file_name,
        },
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating operation log:', logError);
      return NextResponse.json({ error: 'Failed to log operation' }, { status: 500 });
    }

    try {
      // In a real implementation, you would:
      // 1. Download the backup file from cloud storage
      // 2. Use psql or Supabase's restore functionality
      // 3. Execute the SQL to restore the database
      // 4. Handle transactions and rollback on failure
      
      // For now, we'll simulate the restore process
      await new Promise(resolve => setTimeout(resolve, 3000));

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
    } catch (restoreError: any) {
      // Update operation log as failed
      await supabase
        .from('database_operations')
        .update({
          status: 'failed',
          error_message: restoreError.message,
          completed_at: new Date().toISOString(),
        })
        .eq('id', operation.id);

      return NextResponse.json(
        { error: restoreError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in POST /api/database/restore:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List restore history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Try to get user by ID first, then by email if that fails
    let user = await getUserById(userId);
    if (!user && userId.includes('@')) {
      user = await getUserByEmail(userId);
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get restore operations
    const { data: operations, error } = await supabase
      .from('database_operations')
      .select('*')
      .eq('user_id', user.id)
      .eq('operation_type', 'restore')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching restore history:', error);
      return NextResponse.json({ error: 'Failed to fetch restore history' }, { status: 500 });
    }

    return NextResponse.json({ operations: operations || [] });
  } catch (error) {
    console.error('Error in GET /api/database/restore:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
