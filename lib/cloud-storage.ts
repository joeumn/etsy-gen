/**
 * Cloud Storage Helper
 * 
 * Provides S3 integration for backup/restore file management
 */

import { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';
import { logError, logger } from './logger';

// S3 Configuration from environment variables
const S3_BUCKET = process.env.S3_BUCKET_NAME || 'etsy-gen-backups';
const S3_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_ACCESS_KEY = process.env.AWS_ACCESS_KEY_ID;
const S3_SECRET_KEY = process.env.AWS_SECRET_ACCESS_KEY;

// Initialize S3 client
let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    if (!S3_ACCESS_KEY || !S3_SECRET_KEY) {
      throw new Error('AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    }

    s3Client = new S3Client({
      region: S3_REGION,
      credentials: {
        accessKeyId: S3_ACCESS_KEY,
        secretAccessKey: S3_SECRET_KEY,
      },
    });

    logger.info(`S3 client initialized for region ${S3_REGION}`);
  }

  return s3Client;
}

export interface BackupFile {
  key: string;
  fileName: string;
  size: number;
  lastModified: Date;
  userId: string;
}

/**
 * Upload a backup file to S3
 */
export async function uploadBackupToS3(
  fileName: string,
  fileContent: Buffer | string,
  userId: string,
  metadata?: Record<string, string>
): Promise<string> {
  try {
    const client = getS3Client();
    const key = `backups/${userId}/${fileName}`;

    const upload = new Upload({
      client,
      params: {
        Bucket: S3_BUCKET,
        Key: key,
        Body: typeof fileContent === 'string' ? Buffer.from(fileContent) : fileContent,
        ContentType: 'application/sql',
        Metadata: {
          userId,
          uploadedAt: new Date().toISOString(),
          ...metadata,
        },
      },
    });

    await upload.done();
    
    logger.info(`Backup uploaded to S3: ${key}`);
    return key;
  } catch (error) {
    logError(error, 'UploadBackupToS3', { fileName, userId });
    throw new Error('Failed to upload backup to cloud storage');
  }
}

/**
 * Download a backup file from S3
 */
export async function downloadBackupFromS3(key: string): Promise<Buffer> {
  try {
    const client = getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const response = await client.send(command);
    
    if (!response.Body) {
      throw new Error('No file content received from S3');
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as Readable) {
      chunks.push(chunk);
    }
    
    const buffer = Buffer.concat(chunks);
    logger.info(`Backup downloaded from S3: ${key}, size: ${buffer.length} bytes`);
    
    return buffer;
  } catch (error) {
    logError(error, 'DownloadBackupFromS3', { key });
    throw new Error('Failed to download backup from cloud storage');
  }
}

/**
 * List all backup files for a user
 */
export async function listBackupsFromS3(userId: string): Promise<BackupFile[]> {
  try {
    const client = getS3Client();
    const prefix = `backups/${userId}/`;
    
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: prefix,
    });

    const response = await client.send(command);
    
    if (!response.Contents) {
      return [];
    }

    const files: BackupFile[] = response.Contents.map(item => ({
      key: item.Key || '',
      fileName: item.Key?.split('/').pop() || '',
      size: item.Size || 0,
      lastModified: item.LastModified || new Date(),
      userId,
    }));

    logger.info(`Listed ${files.length} backups for user ${userId}`);
    return files;
  } catch (error) {
    logError(error, 'ListBackupsFromS3', { userId });
    throw new Error('Failed to list backups from cloud storage');
  }
}

/**
 * Delete a backup file from S3
 */
export async function deleteBackupFromS3(key: string): Promise<void> {
  try {
    const client = getS3Client();
    
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    await client.send(command);
    logger.info(`Backup deleted from S3: ${key}`);
  } catch (error) {
    logError(error, 'DeleteBackupFromS3', { key });
    throw new Error('Failed to delete backup from cloud storage');
  }
}

/**
 * Generate a presigned URL for downloading a backup
 */
export async function getBackupDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
  try {
    const client = getS3Client();
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });

    const url = await getSignedUrl(client, command, { expiresIn });
    logger.info(`Generated presigned URL for backup: ${key}`);
    
    return url;
  } catch (error) {
    logError(error, 'GetBackupDownloadUrl', { key });
    throw new Error('Failed to generate download URL');
  }
}

/**
 * Check if S3 is properly configured
 */
export function isS3Configured(): boolean {
  return !!(S3_ACCESS_KEY && S3_SECRET_KEY);
}
