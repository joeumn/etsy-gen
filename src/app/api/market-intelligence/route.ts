// /app/api/market-intelligence/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getAndSaveMarketIntelligence, getUserMarketReports } from '@/lib/ai/intelligence';

// POST: Generate new market intelligence report
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, userId } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required and must be a string' },
        { status: 400 }
      );
    }

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Generate and save the market intelligence report
    const report = await getAndSaveMarketIntelligence(topic, userId);

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error: any) {
    console.error('Market Intelligence API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to generate market intelligence',
      },
      { status: 500 }
    );
  }
}

// GET: Retrieve all market reports for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const reports = await getUserMarketReports(userId);

    return NextResponse.json({
      success: true,
      reports,
    });
  } catch (error: any) {
    console.error('Market Intelligence API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch market reports',
      },
      { status: 500 }
    );
  }
}
