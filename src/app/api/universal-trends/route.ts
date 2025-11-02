import { NextRequest, NextResponse } from 'next/server';
import { UniversalScraper } from '@/modules/scrape/universal';
import { logger } from '@/config/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('query') || undefined;
    const sourcesParam = searchParams.get('sources');
    const analyze = searchParams.get('analyze') === 'true';
    
    const sources = sourcesParam 
      ? sourcesParam.split(',') as any[]
      : ['google_trends', 'reddit', 'pinterest'];

    logger.info({ query, sources, analyze }, 'Universal trends API called');

    // Fetch trends from all sources
    const trends = await UniversalScraper.searchTrends(query, sources);

    // If analyze flag is set, convert trends to product opportunities
    if (analyze) {
      const opportunities = await UniversalScraper.analyzeForProducts(trends);
      return NextResponse.json({
        success: true,
        count: opportunities.length,
        opportunities,
        sources,
      });
    }

    // Return raw trends
    return NextResponse.json({
      success: true,
      count: trends.length,
      trends,
      sources,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch universal trends');
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch trends',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, sources, analyze = false } = body;

    const trends = await UniversalScraper.searchTrends(query, sources);

    if (analyze) {
      const opportunities = await UniversalScraper.analyzeForProducts(trends);
      return NextResponse.json({
        success: true,
        opportunities,
      });
    }

    return NextResponse.json({
      success: true,
      trends,
    });
  } catch (error) {
    logger.error({ err: error }, 'Failed to process universal trends request');
    return NextResponse.json(
      { success: false, error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
