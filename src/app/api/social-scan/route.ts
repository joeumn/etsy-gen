import { NextRequest, NextResponse } from 'next/server';
import { scrapeTikTokTrends } from '@/lib/scrapers/social-scraper';
import { supabase } from '@/lib/db/client';

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

    // Use real social scraping functionality
    const socialTrends = [];
    
    try {
      // Scrape TikTok trends using actual scraper
      const tiktokTrends = await scrapeTikTokTrends(keywords);
      
      // Transform scraped data to match expected format
      const transformedTrends = tiktokTrends.map(trend => ({
        platform: trend.platform,
        hashtag: trend.hashtag,
        engagementScore: trend.engagementScore,
        reachScore: trend.reachScore,
        viralScore: trend.viralScore,
        socialTrendScore: Math.round((trend.engagementScore + trend.reachScore + trend.viralScore) / 3),
        rawData: {
          posts: Math.floor(trend.mentions / 100),
          likes: trend.mentions,
          shares: Math.floor(trend.mentions * 0.1),
          comments: Math.floor(trend.mentions * 0.05),
        },
        createdAt: trend.timestamp.toISOString(),
      }));
      
      socialTrends.push(...transformedTrends);
      
      // Store in database for future reference
      await supabase.from('social_trends').insert(
        transformedTrends.map(trend => ({
          platform: trend.platform,
          hashtag: trend.hashtag,
          engagement_score: trend.engagementScore,
          reach_score: trend.reachScore,
          viral_score: trend.viralScore,
          keywords: keywords,
          raw_data: trend.rawData,
        }))
      );
    } catch (scraperError) {
      console.error('Social scraping error:', scraperError);
      // Return error instead of falling back to mock data
      return NextResponse.json(
        { error: 'Failed to scrape social trends. Please try again later.' },
        { status: 503 }
      );
    }

    // Calculate overall trend score from real data
    const avgSocialScore = socialTrends.reduce((sum, data) => sum + data.socialTrendScore, 0) / (socialTrends.length || 1);
    const overallTrendScore = Math.round(avgSocialScore);

    return NextResponse.json({
      success: true,
      data: {
        socialTrends,
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

    // Fetch from database first (cached data)
    const { data: cachedData } = await supabase
      .from('social_trends')
      .select('*')
      .eq('platform', platform)
      .contains('keywords', [hashtag])
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: {
          platform: cachedData.platform,
          hashtag: cachedData.hashtag,
          engagementScore: cachedData.engagement_score,
          reachScore: cachedData.reach_score,
          viralScore: cachedData.viral_score,
          socialTrendScore: Math.round((cachedData.engagement_score + cachedData.reach_score + cachedData.viral_score) / 3),
          rawData: cachedData.raw_data,
          createdAt: cachedData.created_at,
        },
      });
    }

    // If no cached data, scrape fresh data
    try {
      const trends = await scrapeTikTokTrends([hashtag]);
      if (trends.length > 0) {
        const trend = trends[0];
        const trendData = {
          platform: trend.platform,
          hashtag: trend.hashtag,
          engagementScore: trend.engagementScore,
          reachScore: trend.reachScore,
          viralScore: trend.viralScore,
          socialTrendScore: Math.round((trend.engagementScore + trend.reachScore + trend.viralScore) / 3),
          rawData: {
            posts: Math.floor(trend.mentions / 100),
            likes: trend.mentions,
            shares: Math.floor(trend.mentions * 0.1),
            comments: Math.floor(trend.mentions * 0.05),
          },
          createdAt: trend.timestamp.toISOString(),
        };

        // Store in database
        await supabase.from('social_trends').insert({
          platform: trendData.platform,
          hashtag: trendData.hashtag,
          engagement_score: trendData.engagementScore,
          reach_score: trendData.reachScore,
          viral_score: trendData.viralScore,
          keywords: [hashtag],
          raw_data: trendData.rawData,
        });

        return NextResponse.json({
          success: true,
          data: trendData,
        });
      }
    } catch (scraperError) {
      console.error('Social scraping error:', scraperError);
    }

    return NextResponse.json(
      { error: 'No social trend data available for the specified platform and hashtag' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Social scan GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to get social trend data' },
      { status: 500 }
    );
  }
}