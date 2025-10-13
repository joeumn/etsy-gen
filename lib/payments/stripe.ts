import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
});

export interface CreateCustomerData {
  email: string;
  name?: string;
  userId: string;
}

export interface CreateCheckoutSessionData {
  customerId?: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  userId: string;
}

export class StripeService {
  static async createCustomer(data: CreateCustomerData) {
    try {
      const customer = await stripe.customers.create({
        email: data.email,
        name: data.name,
        metadata: {
          userId: data.userId,
        },
      });

      return { success: true, customer };
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createCheckoutSession(data: CreateCheckoutSessionData) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: data.customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: data.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: data.successUrl,
        cancel_url: data.cancelUrl,
        metadata: {
          userId: data.userId,
        },
      });

      return { success: true, session };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async createPortalSession(customerId: string, returnUrl: string) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });

      return { success: true, session };
    } catch (error) {
      console.error('Error creating portal session:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async getSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  static async cancelSubscription(subscriptionId: string) {
    try {
      const subscription = await stripe.subscriptions.cancel(subscriptionId);
      return { success: true, subscription };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Price IDs for different plans
export const PRICE_IDS = {
  PRO_MONTHLY: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
  PRO_YEARLY: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly',
  ENTERPRISE_MONTHLY: process.env.STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || 'price_enterprise_monthly',
  ENTERPRISE_YEARLY: process.env.STRIPE_ENTERPRISE_YEARLY_PRICE_ID || 'price_enterprise_yearly',
} as const;