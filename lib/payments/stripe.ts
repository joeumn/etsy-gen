import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY!,
  priceIds: {
    free: process.env.STRIPE_PRICE_ID_FREE || 'price_free',
    pro: process.env.STRIPE_PRICE_ID_PRO || 'price_pro',
  },
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
}

export interface CreateCheckoutSessionParams {
  priceId: string
  customerId?: string
  userId: string
  successUrl: string
  cancelUrl: string
}

export async function createCheckoutSession({
  priceId,
  customerId,
  userId,
  successUrl,
  cancelUrl,
}: CreateCheckoutSessionParams) {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      metadata: {
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    })

    return { success: true, sessionId: session.id, url: session.url }
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return { success: false, error: 'Failed to create checkout session' }
  }
}

export async function createCustomer(email: string, name?: string) {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
    })

    return { success: true, customerId: customer.id }
  } catch (error) {
    console.error('Error creating customer:', error)
    return { success: false, error: 'Failed to create customer' }
  }
}

export async function getSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    return { success: true, subscription }
  } catch (error) {
    console.error('Error retrieving subscription:', error)
    return { success: false, error: 'Failed to retrieve subscription' }
  }
}

export async function cancelSubscription(subscriptionId: string) {
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)
    return { success: true, subscription }
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return { success: false, error: 'Failed to cancel subscription' }
  }
}