import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/admin-client';
import { requireAuth } from '@/lib/auth-session';
import { createDatabaseBackup, listAvailableBackups } from '@/lib/db/backup-restore';
import { updateDatabaseOperationStatus } from '@/lib/realtime';

// POST - Create database backup
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from session
    const user = await requireAuth();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `backup-${timestamp}.sql`;

    // Create operation log entry
    const { data: operation, error: logError } = await supabase
      .from('database_operations')
      .insert({
        user_id: user.id,
        operation_type: 'backup',
        status: 'running',
        file_name: fileName,
        details: { timestamp },
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
        message: 'Starting database backup...',
      });

      // Create real database backup using pg_dump and upload to S3
      const { fileName, s3Key, size } = await createDatabaseBackup(user.id);

      // Update operation log as completed with real-time notification
      await updateDatabaseOperationStatus(operation.id, 'completed', {
        progress: 100,
        message: 'Backup completed successfully',
        fileUrl: s3Key,
        fileSize: size,
      });

      return NextResponse.json({
        success: true,
        operation: {
          ...operation,
          status: 'completed',
          file_url: s3Key,
          file_size: size,
          completed_at: new Date().toISOString(),
        },
      });
    } catch (backupError: any) {
      // Update operation log as failed with real-time notification
      await updateDatabaseOperationStatus(operation.id, 'failed', {
        progress: 0,
        message: 'Backup failed',
        error: backupError.message,
      });

      return NextResponse.json(
        { error: backupError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in POST /api/database/backup:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List backup history
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from session
    const user = await requireAuth();

    // Get backup operations from database
    const { data: operations, error: dbError } = await supabase
      .from('database_operations')
      .select('*')
      .eq('user_id', user.id)
      .eq('operation_type', 'backup')
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Error fetching backup history:', dbError);
      return NextResponse.json({ error: 'Failed to fetch backup history' }, { status: 500 });
    }

    // Get backup files from S3
    try {
      const s3Backups = await listAvailableBackups(user.id);
      
      // Merge S3 data with database operations
      const enrichedOperations = operations?.map(op => {
        const s3File = s3Backups.find(f => f.key === op.file_url);
        return {
          ...op,
          file_size: s3File?.size || op.file_size,
          s3_available: !!s3File,
        };
      });

      return NextResponse.json({ 
        operations: enrichedOperations || [],
        s3_backups: s3Backups,
      });
    } catch (s3Error) {
      // If S3 fails, still return database operations
      console.error('Error fetching S3 backups:', s3Error);
      return NextResponse.json({ 
        operations: operations || [],
        s3_error: 'Could not fetch cloud storage backups',
      });
    }
  } catch (error) {
    console.error('Error in GET /api/database/backup:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
