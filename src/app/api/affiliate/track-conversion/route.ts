import { NextRequest, NextResponse } from 'next/server';
import { affiliateService } from '@/lib/affiliates/service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      code, 
      userId, 
      plan, 
      mrrCents, 
      stripeCustomerId, 
      stripeSubscriptionId, 
      conversionValueCents 
    } = body;

    if (!code || !userId || !plan || mrrCents === undefined) {
      return NextResponse.json(
        { error: 'Affiliate code, user ID, plan, and MRR are required' },
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

    // Validate plan
    if (!['pro', 'enterprise'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan must be either "pro" or "enterprise"' },
        { status: 400 }
      );
    }

    // Validate code format
    if (!affiliateService.validateReferralCode(code)) {
      return NextResponse.json(
        { error: 'Invalid affiliate code format' },
        { status: 400 }
      );
    }

    const conversionId = await affiliateService.trackConversion(
      code, 
      userId, 
      plan, 
      mrrCents,
      {
        stripeCustomerId,
        stripeSubscriptionId,
        conversionValueCents
      }
    );

    return NextResponse.json({
      success: true,
      data: {
        conversion_id: conversionId,
        code,
        user_id: userId,
        plan,
        mrr_cents: mrrCents
      }
    });

  } catch (error) {
    console.error('Track conversion error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to track conversion',
        success: false 
      },
      { status: 500 }
    );
  }
}