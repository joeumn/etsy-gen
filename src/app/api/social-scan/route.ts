import { NextRequest, NextResponse } from 'next/server';
import { scrapeTikTokTrends, scrapePinterestTrends, scrapeInstagramTrends, aggregateSocialTrends, SocialTrend } from '@/lib/scrapers/social-scraper';
import { AuthenticationError, handleAPIError } from '@/lib/errors';
import { logError } from '@/lib/logger';
import { supabase } from '@/lib/db/client';

export async function POST(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    
    // Decode token to get user ID
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split(':')[0];
    } catch {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new AuthenticationError('User not found');
    }

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

    // Use real social media scraper functions to get live data
    const socialTrends: SocialTrend[] = [];
    
    for (const platform of platforms) {
      try {
        let platformTrends: SocialTrend[] = [];
        
        switch (platform.toLowerCase()) {
          case 'tiktok':
            platformTrends = await scrapeTikTokTrends(keywords);
            break;
          case 'pinterest':
            platformTrends = await scrapePinterestTrends(keywords);
            break;
          case 'instagram':
            platformTrends = await scrapeInstagramTrends(keywords);
            break;
        }
        
        socialTrends.push(...platformTrends);
      } catch (error) {
        logError(error, `SocialScan${platform}`);
        // Continue with other platforms if one fails
      }
    }

    // Aggregate and calculate overall trend score
    const aggregated = aggregateSocialTrends(socialTrends);

    return NextResponse.json({
      success: true,
      data: {
        socialTrends,
        overallTrendScore: Math.round(aggregated.avgEngagement),
        keywords,
        platforms,
        aggregated,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logError(error, 'SocialScanAPI');
    const { response, statusCode } = handleAPIError(error, '/api/social-scan');
    return NextResponse.json(response, { status: statusCode });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('No authentication token provided');
    }

    const token = authHeader.substring(7);
    
    // Decode token to get user ID
    let userId: string;
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      userId = decoded.split(':')[0];
    } catch {
      throw new AuthenticationError('Invalid authentication token');
    }

    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new AuthenticationError('User not found');
    }

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

    // Use real social media scraper to get live data for specific platform
    let trends: SocialTrend[] = [];
    
    switch (platform.toLowerCase()) {
      case 'tiktok':
        trends = await scrapeTikTokTrends([hashtag]);
        break;
      case 'pinterest':
        trends = await scrapePinterestTrends([hashtag]);
        break;
      case 'instagram':
        trends = await scrapeInstagramTrends([hashtag]);
        break;
    }

    const data = trends[0] || {
      platform,
      hashtag,
      engagementScore: 0,
      reachScore: 0,
      viralScore: 0,
      mentions: 0,
      growth: 0,
      keywords: [hashtag],
      sentiment: 'neutral' as const,
      timestamp: new Date(),
    };

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    logError(error, 'SocialScanGETAPI');
    const { response, statusCode } = handleAPIError(error, '/api/social-scan');
    return NextResponse.json(response, { status: statusCode });
  }
}