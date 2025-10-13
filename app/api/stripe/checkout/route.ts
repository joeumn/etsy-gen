import { NextRequest, NextResponse } from 'next/server'
import { createCheckoutSession, createCustomer } from '@/lib/payments/stripe'

export async function POST(request: NextRequest) {
  try {
    const { priceId, userId, userEmail, userName } = await request.json()

    if (!priceId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Create or get customer
    let customerId: string
    try {
      // For now, create a new customer each time
      // In production, you'd want to check if customer exists first
      const customer = await createCustomer(userEmail, userName)
      customerId = customer.id
    } catch (error) {
      console.error('Error creating customer:', error)
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      )
    }

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      customerId,
      userId,
      successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
    })

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout API error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}