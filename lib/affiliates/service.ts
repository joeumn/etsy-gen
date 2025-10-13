// Affiliate service for managing referral codes, tracking, and payouts

import { supabase } from '@/lib/db/client';

export interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  display_name: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface AffiliateStats {
  signups: number;
  conversions: number;
  mrr_cents: number;
  conversion_rate: number;
  total_value_cents: number;
}

export interface AffiliateClick {
  id: string;
  code: string;
  occurred_at: string;
  ip: string | null;
  ua: string | null;
  landing_path: string | null;
  referrer: string | null;
}

export interface AffiliateSignup {
  id: string;
  code: string;
  user_id: string;
  occurred_at: string;
  first_touch_click_id: string | null;
}

export interface AffiliateConversion {
  id: string;
  code: string;
  user_id: string;
  occurred_at: string;
  plan: 'pro' | 'enterprise';
  mrr_cents: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  conversion_value_cents: number;
}

export class AffiliateService {
  private static instance: AffiliateService;

  static getInstance(): AffiliateService {
    if (!AffiliateService.instance) {
      AffiliateService.instance = new AffiliateService();
    }
    return AffiliateService.instance;
  }

  // Create affiliate code for user
  async createAffiliate(userId: string, displayName?: string): Promise<Affiliate> {
    try {
      // Check if user already has an affiliate code
      const { data: existing } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (existing) {
        return existing;
      }

      // Generate unique code
      const code = await this.generateUniqueCode();

      const { data, error } = await supabase
        .from('affiliates')
        .insert({
          user_id: userId,
          code,
          display_name: displayName || null,
          is_public: false
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create affiliate: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Create affiliate error:', error);
      throw error;
    }
  }

  // Get affiliate by user ID
  async getAffiliateByUserId(userId: string): Promise<Affiliate | null> {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No affiliate found
        }
        throw new Error(`Failed to get affiliate: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get affiliate error:', error);
      throw error;
    }
  }

  // Get affiliate by code
  async getAffiliateByCode(code: string): Promise<Affiliate | null> {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .eq('code', code)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No affiliate found
        }
        throw new Error(`Failed to get affiliate: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Get affiliate error:', error);
      throw error;
    }
  }

  // Update affiliate settings
  async updateAffiliate(
    userId: string, 
    updates: { display_name?: string; is_public?: boolean }
  ): Promise<Affiliate> {
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update affiliate: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Update affiliate error:', error);
      throw error;
    }
  }

  // Track affiliate click
  async trackClick(
    code: string,
    options: {
      ip?: string;
      ua?: string;
      landingPath?: string;
      referrer?: string;
    } = {}
  ): Promise<string> {
    try {
      // Verify affiliate exists
      const affiliate = await this.getAffiliateByCode(code);
      if (!affiliate) {
        throw new Error('Invalid affiliate code');
      }

      const { data, error } = await supabase
        .from('affiliate_clicks')
        .insert({
          code,
          ip: options.ip || null,
          ua: options.ua || null,
          landing_path: options.landingPath || null,
          referrer: options.referrer || null
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to track click: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Track click error:', error);
      throw error;
    }
  }

  // Track affiliate signup
  async trackSignup(
    code: string,
    userId: string,
    clickId?: string
  ): Promise<string> {
    try {
      // Verify affiliate exists
      const affiliate = await this.getAffiliateByCode(code);
      if (!affiliate) {
        throw new Error('Invalid affiliate code');
      }

      const { data, error } = await supabase
        .from('affiliate_signups')
        .insert({
          code,
          user_id: userId,
          first_touch_click_id: clickId || null
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to track signup: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Track signup error:', error);
      throw error;
    }
  }

  // Track affiliate conversion
  async trackConversion(
    code: string,
    userId: string,
    plan: 'pro' | 'enterprise',
    mrrCents: number,
    options: {
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      conversionValueCents?: number;
    } = {}
  ): Promise<string> {
    try {
      // Verify affiliate exists
      const affiliate = await this.getAffiliateByCode(code);
      if (!affiliate) {
        throw new Error('Invalid affiliate code');
      }

      const { data, error } = await supabase
        .from('affiliate_conversions')
        .insert({
          code,
          user_id: userId,
          plan,
          mrr_cents: mrrCents,
          stripe_customer_id: options.stripeCustomerId || null,
          stripe_subscription_id: options.stripeSubscriptionId || null,
          conversion_value_cents: options.conversionValueCents || 0
        })
        .select('id')
        .single();

      if (error) {
        throw new Error(`Failed to track conversion: ${error.message}`);
      }

      return data.id;
    } catch (error) {
      console.error('Track conversion error:', error);
      throw error;
    }
  }

  // Get affiliate stats
  async getAffiliateStats(code: string): Promise<AffiliateStats> {
    try {
      const { data, error } = await supabase.rpc('get_affiliate_stats', {
        p_code: code
      });

      if (error) {
        throw new Error(`Failed to get affiliate stats: ${error.message}`);
      }

      return data[0] || {
        signups: 0,
        conversions: 0,
        mrr_cents: 0,
        conversion_rate: 0,
        total_value_cents: 0
      };
    } catch (error) {
      console.error('Get affiliate stats error:', error);
      throw error;
    }
  }

  // Get affiliate clicks
  async getAffiliateClicks(
    code: string,
    limit: number = 50
  ): Promise<AffiliateClick[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_clicks')
        .select('*')
        .eq('code', code)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get affiliate clicks: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get affiliate clicks error:', error);
      throw error;
    }
  }

  // Get affiliate signups
  async getAffiliateSignups(
    code: string,
    limit: number = 50
  ): Promise<AffiliateSignup[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_signups')
        .select('*')
        .eq('code', code)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get affiliate signups: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get affiliate signups error:', error);
      throw error;
    }
  }

  // Get affiliate conversions
  async getAffiliateConversions(
    code: string,
    limit: number = 50
  ): Promise<AffiliateConversion[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_conversions')
        .select('*')
        .eq('code', code)
        .order('occurred_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get affiliate conversions: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get affiliate conversions error:', error);
      throw error;
    }
  }

  // Get leaderboard
  async getLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('affiliate_leaderboard')
        .select('*')
        .eq('is_public', true)
        .order('mrr_cents_total', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to get leaderboard: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Get leaderboard error:', error);
      throw error;
    }
  }

  // Generate payout report
  async generatePayoutReport(code: string, startDate?: string, endDate?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('affiliate_conversions')
        .select(`
          *,
          affiliates!inner(display_name, code)
        `)
        .eq('code', code);

      if (startDate) {
        query = query.gte('occurred_at', startDate);
      }
      if (endDate) {
        query = query.lte('occurred_at', endDate);
      }

      const { data, error } = await query.order('occurred_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to generate payout report: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Generate payout report error:', error);
      throw error;
    }
  }

  // Generate unique affiliate code
  private async generateUniqueCode(): Promise<string> {
    const { data, error } = await supabase.rpc('generate_affiliate_code');

    if (error) {
      throw new Error(`Failed to generate affiliate code: ${error.message}`);
    }

    return data;
  }

  // Get referral link
  getReferralLink(code: string, path: string = '/'): string {
    const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}${path}?ref=${code}`;
  }

  // Validate referral code from URL
  validateReferralCode(code: string): boolean {
    // Basic validation: 8 characters, alphanumeric
    return /^[A-Z0-9]{8}$/.test(code);
  }
}

// Export singleton instance
export const affiliateService = AffiliateService.getInstance();