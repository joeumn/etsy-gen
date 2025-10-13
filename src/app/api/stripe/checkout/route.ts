import { NextRequest, NextResponse } from 'next/server';
import { StripeService, PRICE_IDS } from '@/lib/payments/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, customerId, successUrl, cancelUrl } = body;

    if (!planId || !userId) {
      return NextResponse.json(
        { error: 'Plan ID and User ID are required' },
        { status: 400 }
      );
    }

    // Map plan IDs to Stripe price IDs
    const priceIdMap: Record<string, string> = {
      'pro-monthly': PRICE_IDS.PRO_MONTHLY,
      'pro-yearly': PRICE_IDS.PRO_YEARLY,
      'enterprise-monthly': PRICE_IDS.ENTERPRISE_MONTHLY,
      'enterprise-yearly': PRICE_IDS.ENTERPRISE_YEARLY,
    };

    const priceId = priceIdMap[planId];
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan ID' },
        { status: 400 }
      );
    }

    const result = await StripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl: successUrl || `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancelUrl: cancelUrl || `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
      userId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionId: result.session?.id,
      url: result.session?.url,
    });
  } catch (error) {
    console.error('Checkout API error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}