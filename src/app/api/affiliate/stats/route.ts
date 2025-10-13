import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const userId = searchParams.get('userId');

    if (!code && !userId) {
      return NextResponse.json(
        { error: 'Either code or userId is required' },
        { status: 400 }
      );
    }

    // Check if affiliate feature is enabled
    if (process.env.ENABLE_STAGE3_AFFILIATES !== 'true') {
      return NextResponse.json(
        { error: 'Affiliate feature is not enabled' },
        { status: 403 }
      );
    }

    let affiliateCode = code;

    // If userId provided, get their affiliate code
    if (!affiliateCode && userId) {
      const affiliate = await affiliateService.getAffiliateByUserId(userId);
      if (!affiliate) {
        return NextResponse.json(
          { error: 'No affiliate code found for user' },
          { status: 404 }
        );
      }
      affiliateCode = affiliate.code;
    }

    if (!affiliateCode) {
      return NextResponse.json(
        { error: 'Affiliate code not found' },
        { status: 404 }
      );
    }

    // Get stats
    const stats = await affiliateService.getAffiliateStats(affiliateCode);
    const clicks = await affiliateService.getAffiliateClicks(affiliateCode, 10);
    const signups = await affiliateService.getAffiliateSignups(affiliateCode, 10);
    const conversions = await affiliateService.getAffiliateConversions(affiliateCode, 10);

    return NextResponse.json({
      success: true,
      data: {
        code: affiliateCode,
        stats,
        recent_clicks: clicks,
        recent_signups: signups,
        recent_conversions: conversions
      }
    });

  } catch (error) {
    console.error('Get affiliate stats error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get affiliate stats',
        success: false 
      },
      { status: 500 }
    );
  }
}