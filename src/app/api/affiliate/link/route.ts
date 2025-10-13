import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const path = searchParams.get('path') || '/';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Get or create affiliate
    let affiliate = await affiliateService.getAffiliateByUserId(userId);
    
    if (!affiliate) {
      affiliate = await affiliateService.createAffiliate(userId);
    }

    const referralLink = affiliateService.getReferralLink(affiliate.code, path);

    return NextResponse.json({
      success: true,
      data: {
        code: affiliate.code,
        referral_link: referralLink,
        display_name: affiliate.display_name,
        is_public: affiliate.is_public
      }
    });

  } catch (error) {
    console.error('Get affiliate link error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get affiliate link',
        success: false 
      },
      { status: 500 }
    );
  }
}