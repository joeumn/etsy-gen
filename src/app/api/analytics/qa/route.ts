import { NextRequest, NextResponse } from 'next/server';
import { nlRouter } from '@/lib/analytics/nlRouter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if analytics feature is enabled
    if (process.env.ENABLE_STAGE3_ANALYTICS !== 'true') {
      return NextResponse.json(
        { error: 'Analytics feature is not enabled' },
        { status: 403 }
      );
    }

    const result = await nlRouter.processQuery(query, userId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Analytics QA error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process query',
        success: false 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, userId } = body;

    if (!query || !userId) {
      return NextResponse.json(
        { error: 'Query and userId are required' },
        { status: 400 }
      );
    }

    // Check if analytics feature is enabled
    if (process.env.ENABLE_STAGE3_ANALYTICS !== 'true') {
      return NextResponse.json(
        { error: 'Analytics feature is not enabled' },
        { status: 403 }
      );
    }

    const result = await nlRouter.processQuery(query, userId);

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Analytics QA error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to process query',
        success: false 
      },
      { status: 500 }
    );
  }
}