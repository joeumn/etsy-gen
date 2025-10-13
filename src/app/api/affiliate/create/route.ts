import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, displayName } = body;

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

    const affiliate = await affiliateService.createAffiliate(userId, displayName);

    return NextResponse.json({
      success: true,
      data: {
        code: affiliate.code,
        display_name: affiliate.display_name,
        is_public: affiliate.is_public,
        referral_link: affiliateService.getReferralLink(affiliate.code)
      }
    });

  } catch (error) {
    console.error('Create affiliate error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create affiliate',
        success: false 
      },
      { status: 500 }
    );
  }
}