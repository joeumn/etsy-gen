import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, ip, ua, landingPath, referrer } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Affiliate code is required' },
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

    // Validate code format
    if (!affiliateService.validateReferralCode(code)) {
      return NextResponse.json(
        { error: 'Invalid affiliate code format' },
        { status: 400 }
      );
    }

    const clickId = await affiliateService.trackClick(code, {
      ip,
      ua,
      landingPath,
      referrer
    });

    return NextResponse.json({
      success: true,
      data: {
        click_id: clickId,
        code
      }
    });

  } catch (error) {
    console.error('Track click error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to track click',
        success: false 
      },
      { status: 500 }
    );
  }
}