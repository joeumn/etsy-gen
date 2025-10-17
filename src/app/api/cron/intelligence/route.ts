import { NextRequest, NextResponse } from 'next/server';
import { runIntelligenceCycle } from '@/lib/cron/intelligence-cycle';
import { logError, logger } from '@/lib/logger';

/**
 * CRON 1: Intelligence Cycle Endpoint
 * 
 * Triggered by Vercel Cron every 3-6 hours
 * Scrapes all sources, analyzes trends, updates dashboards
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

    logger.info('🔍 Intelligence Cycle triggered by cron');

    // Run the intelligence cycle
    const result = await runIntelligenceCycle();

    logger.info('Intelligence Cycle completed', {
      ...result,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      cycle: 'intelligence',
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError(error, 'IntelligenceCron');
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

