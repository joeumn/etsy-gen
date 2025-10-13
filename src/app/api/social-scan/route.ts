import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keywords, platforms = ['tiktok', 'pinterest', 'instagram'] } = body;

    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords array is required' },
        { status: 400 }
      );
    }

    // Check if Zig 5 is enabled
    if (process.env.ENABLE_ZIG5_SOCIAL !== 'true') {
      return NextResponse.json(
        { error: 'Social signals feature is not enabled' },
        { status: 403 }
      );
    }

    // Mock social media data - in production, this would call actual APIs
    const mockSocialData = platforms.map((platform: string) => {
      const baseScore = Math.random() * 100;
      return {
        platform,
        hashtag: keywords[0] || 'trending',
        engagementScore: Math.round(baseScore * 0.8),
        reachScore: Math.round(baseScore * 0.6),
        viralScore: Math.round(baseScore * 0.4),
        socialTrendScore: Math.round((baseScore * 0.8 + baseScore * 0.6 + baseScore * 0.4) / 3),
        rawData: {
          posts: Math.floor(Math.random() * 1000) + 100,
          likes: Math.floor(Math.random() * 10000) + 1000,
          shares: Math.floor(Math.random() * 1000) + 100,
          comments: Math.floor(Math.random() * 500) + 50,
        },
        createdAt: new Date().toISOString(),
      };
    });

    // Calculate overall trend score (60% sales velocity + 40% social buzz)
    const avgSocialScore = mockSocialData.reduce((sum: number, data: any) => sum + data.socialTrendScore, 0) / mockSocialData.length;
    const overallTrendScore = Math.round(avgSocialScore * 0.4 + Math.random() * 100 * 0.6);

    return NextResponse.json({
      success: true,
      data: {
        socialTrends: mockSocialData,
        overallTrendScore,
        keywords,
        platforms,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Social scan API error:', error);
    return NextResponse.json(
      { error: 'Failed to scan social trends' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || 'tiktok';
    const hashtag = searchParams.get('hashtag') || 'trending';

    // Check if Zig 5 is enabled
    if (process.env.ENABLE_ZIG5_SOCIAL !== 'true') {
      return NextResponse.json(
        { error: 'Social signals feature is not enabled' },
        { status: 403 }
      );
    }

    // Mock data for specific platform/hashtag
    const mockData = {
      platform,
      hashtag,
      engagementScore: Math.round(Math.random() * 100),
      reachScore: Math.round(Math.random() * 100),
      viralScore: Math.round(Math.random() * 100),
      socialTrendScore: Math.round(Math.random() * 100),
      rawData: {
        posts: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 10000) + 1000,
        shares: Math.floor(Math.random() * 1000) + 100,
        comments: Math.floor(Math.random() * 500) + 50,
      },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockData,
    });
  } catch (error) {
    console.error('Social scan GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to get social trend data' },
      { status: 500 }
    );
  }
}