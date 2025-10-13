import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, userId, clickId } = body;

    if (!code || !userId) {
      return NextResponse.json(
        { error: 'Affiliate code and user ID are required' },
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

    const signupId = await affiliateService.trackSignup(code, userId, clickId);

    return NextResponse.json({
      success: true,
      data: {
        signup_id: signupId,
        code,
        user_id: userId
      }
    });

  } catch (error) {
    console.error('Track signup error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to track signup',
        success: false 
      },
      { status: 500 }
    );
  }
}