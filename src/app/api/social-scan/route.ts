import { NextRequest, NextResponse } from 'next/server';
import { SocialMediaScraper } from '@/lib/scrapers/social-scraper';
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

    // Use real social media scraper to get live data
    const scraper = new SocialMediaScraper();
    const socialData = await scraper.scrapeSocialTrends(keywords, platforms);

    // Calculate overall trend score based on real social data
    const avgSocialScore = socialData.reduce((sum: number, data: any) => sum + (data.socialTrendScore || 0), 0) / socialData.length;

    return NextResponse.json({
      success: true,
      data: {
        socialTrends: socialData,
        overallTrendScore: Math.round(avgSocialScore),
        keywords,
        platforms,
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
    const scraper = new SocialMediaScraper();
    const data = await scraper.scrapePlatformData(platform, hashtag);

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