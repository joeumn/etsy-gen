import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set')
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  priceIds: {
    pro: process.env.STRIPE_PRO_PRICE_ID!,
    enterprise: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
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
    allow_promotion_codes: true,
  })

  return session
}

export async function createCustomer(email: string, name?: string) {
  const customer = await stripe.customers.create({
    email,
    name,
  })

  return customer
}

export async function getCustomer(customerId: string) {
  const customer = await stripe.customers.retrieve(customerId)
  return customer
}

export async function createBillingPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.cancel(subscriptionId)
  return subscription
}