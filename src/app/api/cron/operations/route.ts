import { NextRequest, NextResponse } from 'next/server';
import { runOperationsCycle } from '@/lib/cron/operations-cycle';
import { logError, logger } from '@/lib/logger';

/**
 * CRON 2: Operations Cycle Endpoint
 * 
 * Triggered by Vercel Cron every 6-12 hours
 * Creates products, lists them, optimizes pricing, sends notifications
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    logger.info('⚙️ Operations Cycle triggered by cron');

    // Run the operations cycle
    const result = await runOperationsCycle();

    logger.info('Operations Cycle completed', {
      ...result,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      cycle: 'operations',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'OperationsCron');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

