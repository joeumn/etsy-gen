/**
 * Database Backup and Restore Utilities
 * 
 * Provides real database backup/restore functionality using pg_dump and pg_restore
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { logError, logger } from '../logger';
import { uploadBackupToS3, downloadBackupFromS3, listBackupsFromS3 } from '../cloud-storage';

const execAsync = promisify(exec);

// Database connection info from Supabase URL
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Parse database connection from Supabase URL
function getDatabaseConfig() {
  try {
    // Supabase URL format: https://[project-ref].supabase.co
    // Database connection: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
    
    const url = new URL(SUPABASE_URL);
    const projectRef = url.hostname.split('.')[0];
    
    // For Supabase, we need to use the direct connection, not pooler
    // This typically requires the database password from environment
    const dbPassword = process.env.SUPABASE_DB_PASSWORD;
    
    if (!dbPassword) {
      throw new Error('SUPABASE_DB_PASSWORD is required for database backups');
    }

    return {
      host: `db.${projectRef}.supabase.co`,
      port: 5432,
      database: 'postgres',
      username: 'postgres',
      password: dbPassword,
    };
  } catch (error) {
    logError(error, 'GetDatabaseConfig');
    throw new Error('Failed to parse database configuration');
  }
}

/**
 * Create a database backup using pg_dump
 */
export async function createDatabaseBackup(userId: string): Promise<{ fileName: string; s3Key: string; size: number }> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileName = `backup-${timestamp}.sql`;
  const tempFilePath = join(tmpdir(), fileName);

  try {
    const dbConfig = getDatabaseConfig();
    
    logger.info(`Starting database backup for user ${userId}`);

    // Set password in environment for pg_dump
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    };

    // Execute pg_dump command
    const dumpCommand = [
      'pg_dump',
      `-h ${dbConfig.host}`,
      `-p ${dbConfig.port}`,
      `-U ${dbConfig.username}`,
      `-d ${dbConfig.database}`,
      '--clean',
      '--if-exists',
      '--no-owner',
      '--no-privileges',
      `-f ${tempFilePath}`,
    ].join(' ');

    await execAsync(dumpCommand, { env, maxBuffer: 50 * 1024 * 1024 }); // 50MB buffer

    // Read the backup file
    const backupContent = await readFile(tempFilePath);
    const size = backupContent.length;

    logger.info(`Database backup created: ${fileName} (${size} bytes)`);

    // Upload to S3
    const s3Key = await uploadBackupToS3(fileName, backupContent, userId, {
      size: size.toString(),
      timestamp,
    });

    // Clean up temp file
    await unlink(tempFilePath);

    return { fileName, s3Key, size };
  } catch (error) {
    logError(error, 'CreateDatabaseBackup', { userId, fileName });
    
    // Clean up temp file on error
    try {
      await unlink(tempFilePath);
    } catch {}

    throw new Error('Failed to create database backup');
  }
}

/**
 * Restore database from a backup file
 */
export async function restoreDatabaseBackup(s3Key: string): Promise<void> {
  const tempFilePath = join(tmpdir(), `restore-${Date.now()}.sql`);

  try {
    logger.info(`Starting database restore from ${s3Key}`);

    // Download backup from S3
    const backupContent = await downloadBackupFromS3(s3Key);

    // Write to temp file
    await writeFile(tempFilePath, backupContent);

    const dbConfig = getDatabaseConfig();

    // Set password in environment for psql
    const env = {
      ...process.env,
      PGPASSWORD: dbConfig.password,
    };

    // Execute psql command to restore
    const restoreCommand = [
      'psql',
      `-h ${dbConfig.host}`,
      `-p ${dbConfig.port}`,
      `-U ${dbConfig.username}`,
      `-d ${dbConfig.database}`,
      `-f ${tempFilePath}`,
    ].join(' ');

    await execAsync(restoreCommand, { env, maxBuffer: 50 * 1024 * 1024 });

    logger.info(`Database restore completed from ${s3Key}`);

    // Clean up temp file
    await unlink(tempFilePath);
  } catch (error) {
    logError(error, 'RestoreDatabaseBackup', { s3Key });
    
    // Clean up temp file on error
    try {
      await unlink(tempFilePath);
    } catch {}

    throw new Error('Failed to restore database backup');
  }
}

/**
 * List available backups for a user
 */
export async function listAvailableBackups(userId: string) {
  try {
    return await listBackupsFromS3(userId);
  } catch (error) {
    logError(error, 'ListAvailableBackups', { userId });
    throw new Error('Failed to list available backups');
  }
}

/**
 * Check if backup/restore functionality is available
 */
export function isBackupRestoreAvailable(): boolean {
  try {
    // Check if required environment variables are set
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_DB_PASSWORD &&
      process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY
    );
  } catch {
    return false;
  }
}
