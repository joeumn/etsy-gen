import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Check if leaderboard feature is enabled
    if (process.env.ENABLE_STAGE3_LEADERBOARD !== 'true') {
      return NextResponse.json(
        { error: 'Leaderboard feature is not enabled' },
        { status: 403 }
      );
    }

    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    const leaderboard = await affiliateService.getLeaderboard(limit);

    return NextResponse.json({
      success: true,
      data: leaderboard
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get leaderboard',
        success: false 
      },
      { status: 500 }
    );
  }
}