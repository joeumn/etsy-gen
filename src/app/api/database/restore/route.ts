import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/client';
import { requireAuth } from '@/lib/auth-session';
import { restoreDatabaseBackup } from '@/lib/db/backup-restore';
import { updateDatabaseOperationStatus } from '@/lib/realtime';

// POST - Restore database from backup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId } = body;

    if (!backupId) {
      return NextResponse.json({ error: 'Backup ID required' }, { status: 400 });
    }

    // Get authenticated user from session
    const user = await requireAuth();

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
      // Update status to running with real-time notification
      await updateDatabaseOperationStatus(operation.id, 'running', {
        progress: 10,
        message: 'Starting database restore...',
      });

      // Restore database from backup file in S3
      await restoreDatabaseBackup(backupOperation.file_url);

      // Update operation log as completed with real-time notification
      await updateDatabaseOperationStatus(operation.id, 'completed', {
        progress: 100,
        message: 'Restore completed successfully',
      });

      return NextResponse.json({
        success: true,
        operation: {
          ...operation,
          status: 'completed',
          completed_at: new Date().toISOString(),
        },
      });
    } catch (restoreError: any) {
      // Update operation log as failed with real-time notification
      await updateDatabaseOperationStatus(operation.id, 'failed', {
        progress: 0,
        message: 'Restore failed',
        error: restoreError.message,
      });

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
    // Get authenticated user from session
    const user = await requireAuth();

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
