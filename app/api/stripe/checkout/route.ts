import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession } from '@/lib/payments/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { priceId, userId } = body

    if (!priceId || !userId) {
      return NextResponse.json(
        { error: 'Price ID and User ID are required' },
        { status: 400 }
      )
    }

    // Check if Zig 4 is enabled
    if (process.env.ENABLE_ZIG4_STRIPE !== 'true') {
      return NextResponse.json(
        { error: 'Stripe billing is not enabled' },
        { status: 403 }
      )
    }

    const result = await createCheckoutSession({
      priceId,
      userId,
      successUrl: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        sessionId: result.sessionId,
        url: result.url,
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}