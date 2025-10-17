import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// In production, fail fast if required env vars are missing
if (
  process.env.NODE_ENV === 'production' && (!supabaseUrl || !supabaseAnonKey)
) {
  throw new Error(
    'Missing Supabase configuration (SUPABASE_URL and/or SUPABASE_ANON_KEY).'
  );
}

// In development, warn if missing (placeholder will be used)
if (
  process.env.NODE_ENV !== 'production' && (!supabaseUrl || !supabaseAnonKey)
) {
  // eslint-disable-next-line no-console
  console.warn(
    '[dev] Supabase env not set. Using placeholder client; DB calls will fail.'
  );
}

// Public (anon) client for client-side and non-privileged server routes
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key');

// Admin client for privileged server-side operations (only if service role provided)
export const adminSupabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : undefined;

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          name: string | null;
          avatar_url: string | null;
          role: string;
          is_active: boolean;
          email_verified: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_active?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          name?: string | null;
          avatar_url?: string | null;
          role?: string;
          is_active?: boolean;
          email_verified?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      trend_data: {
        Row: {
          id: string;
          marketplace: string;
          category: string | null;
          keywords: string[];
          sales_velocity: number | null;
          price_min: number | null;
          price_max: number | null;
          competition_level: 'low' | 'medium' | 'high' | null;
          seasonality: string[];
          target_audience: string[];
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          marketplace: string;
          category?: string | null;
          keywords?: string[];
          sales_velocity?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          competition_level?: 'low' | 'medium' | 'high' | null;
          seasonality?: string[];
          target_audience?: string[];
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          marketplace?: string;
          category?: string | null;
          keywords?: string[];
          sales_velocity?: number | null;
          price_min?: number | null;
          price_max?: number | null;
          competition_level?: 'low' | 'medium' | 'high' | null;
          seasonality?: string[];
          target_audience?: string[];
          confidence_score?: number | null;
          created_at?: string;
        };
      };
      generated_products: {
        Row: {
          id: string;
          user_id: string;
          ai_provider: string;
          title: string;
          description: string | null;
          tags: string[];
          price: number | null;
          category: string | null;
          seo_keywords: string[];
          content: string | null;
          specifications: any | null;
          image_url: string | null;
          image_prompt: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ai_provider: string;
          title: string;
          description?: string | null;
          tags?: string[];
          price?: number | null;
          category?: string | null;
          seo_keywords?: string[];
          content?: string | null;
          specifications?: any | null;
          image_url?: string | null;
          image_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ai_provider?: string;
          title?: string;
          description?: string | null;
          tags?: string[];
          price?: number | null;
          category?: string | null;
          seo_keywords?: string[];
          content?: string | null;
          specifications?: any | null;
          image_url?: string | null;
          image_prompt?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_listings: {
        Row: {
          id: string;
          user_id: string;
          generated_product_id: string;
          marketplace: string;
          external_id: string | null;
          title: string;
          description: string | null;
          price: number | null;
          category: string | null;
          tags: string[];
          images: string[];
          status: 'draft' | 'active' | 'inactive' | 'sold_out';
          listing_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          generated_product_id: string;
          marketplace: string;
          external_id?: string | null;
          title: string;
          description?: string | null;
          price?: number | null;
          category?: string | null;
          tags?: string[];
          images?: string[];
          status?: 'draft' | 'active' | 'inactive' | 'sold_out';
          listing_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          generated_product_id?: string;
          marketplace?: string;
          external_id?: string | null;
          title?: string;
          description?: string | null;
          price?: number | null;
          category?: string | null;
          tags?: string[];
          images?: string[];
          status?: 'draft' | 'active' | 'inactive' | 'sold_out';
          listing_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      earnings: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string;
          marketplace: string;
          period: string;
          total_sales: number;
          total_revenue: number;
          average_order_value: number;
          conversion_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id: string;
          marketplace: string;
          period: string;
          total_sales?: number;
          total_revenue?: number;
          average_order_value?: number;
          conversion_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string;
          marketplace?: string;
          period?: string;
          total_sales?: number;
          total_revenue?: number;
          average_order_value?: number;
          conversion_rate?: number;
          created_at?: string;
        };
      };
      feature_flags: {
        Row: {
          id: string;
          name: string;
          is_enabled: boolean;
          config: any | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_enabled?: boolean;
          config?: any | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          is_enabled?: boolean;
          config?: any | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Stage 3: Analytics tables
      analytics_cache: {
        Row: {
          id: string;
          created_at: string;
          key: string;
          payload: any;
          expires_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          key: string;
          payload: any;
          expires_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          key?: string;
          payload?: any;
          expires_at?: string;
        };
      };
      analytics_queries: {
        Row: {
          id: string;
          query_text: string;
          query_hash: string;
          sql_template: string;
          parameters: any | null;
          result_type: 'table' | 'timeseries' | 'bar' | 'radar' | 'pie';
          created_at: string;
          last_used_at: string;
          usage_count: number;
        };
        Insert: {
          id?: string;
          query_text: string;
          query_hash: string;
          sql_template: string;
          parameters?: any | null;
          result_type: 'table' | 'timeseries' | 'bar' | 'radar' | 'pie';
          created_at?: string;
          last_used_at?: string;
          usage_count?: number;
        };
        Update: {
          id?: string;
          query_text?: string;
          query_hash?: string;
          sql_template?: string;
          parameters?: any | null;
          result_type?: 'table' | 'timeseries' | 'bar' | 'radar' | 'pie';
          created_at?: string;
          last_used_at?: string;
          usage_count?: number;
        };
      };
      // Stage 3: Affiliate tables
      affiliates: {
        Row: {
          id: string;
          user_id: string;
          code: string;
          display_name: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          code: string;
          display_name?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          code?: string;
          display_name?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      affiliate_clicks: {
        Row: {
          id: string;
          code: string;
          occurred_at: string;
          ip: string | null;
          ua: string | null;
          landing_path: string | null;
          referrer: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          occurred_at?: string;
          ip?: string | null;
          ua?: string | null;
          landing_path?: string | null;
          referrer?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          occurred_at?: string;
          ip?: string | null;
          ua?: string | null;
          landing_path?: string | null;
          referrer?: string | null;
        };
      };
      affiliate_signups: {
        Row: {
          id: string;
          code: string;
          user_id: string;
          occurred_at: string;
          first_touch_click_id: string | null;
        };
        Insert: {
          id?: string;
          code: string;
          user_id: string;
          occurred_at?: string;
          first_touch_click_id?: string | null;
        };
        Update: {
          id?: string;
          code?: string;
          user_id?: string;
          occurred_at?: string;
          first_touch_click_id?: string | null;
        };
      };
      affiliate_conversions: {
        Row: {
          id: string;
          code: string;
          user_id: string;
          occurred_at: string;
          plan: 'pro' | 'enterprise';
          mrr_cents: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          conversion_value_cents: number;
        };
        Insert: {
          id?: string;
          code: string;
          user_id: string;
          occurred_at?: string;
          plan: 'pro' | 'enterprise';
          mrr_cents?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          conversion_value_cents?: number;
        };
        Update: {
          id?: string;
          code?: string;
          user_id?: string;
          occurred_at?: string;
          plan?: 'pro' | 'enterprise';
          mrr_cents?: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          conversion_value_cents?: number;
        };
      };
      // Stage 3: Events/Telemetry
      events: {
        Row: {
          id: string;
          occurred_at: string;
          user_id: string | null;
          name: string;
          payload: any | null;
          session_id: string | null;
          ip: string | null;
          ua: string | null;
        };
        Insert: {
          id?: string;
          occurred_at?: string;
          user_id?: string | null;
          name: string;
          payload?: any | null;
          session_id?: string | null;
          ip?: string | null;
          ua?: string | null;
        };
        Update: {
          id?: string;
          occurred_at?: string;
          user_id?: string | null;
          name?: string;
          payload?: any | null;
          session_id?: string | null;
          ip?: string | null;
          ua?: string | null;
        };
      };
    };
  };
}

// Helper functions for database operations
export class DatabaseService {
  static async saveTrendData(trendData: any) {
    const { data, error } = await supabase
      .from('trend_data')
      .insert(trendData);

    if (error) {
      console.error('Error saving trend data:', error);
      throw error;
    }

    return data;
  }

  static async getTrendData(marketplace?: string, limit = 100) {
    let query = supabase
      .from('trend_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (marketplace) {
      query = query.eq('marketplace', marketplace);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching trend data:', error);
      throw error;
    }

    return data;
  }

  static async saveGeneratedProduct(product: any) {
    const { data, error } = await supabase
      .from('generated_products')
      .insert(product);

    if (error) {
      console.error('Error saving generated product:', error);
      throw error;
    }

    return data;
  }

  static async getGeneratedProducts(userId: string, limit = 50) {
    const { data, error } = await supabase
      .from('generated_products')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching generated products:', error);
      throw error;
    }

    return data;
  }

  static async saveProductListing(listing: any) {
    const { data, error } = await supabase
      .from('product_listings')
      .insert(listing);

    if (error) {
      console.error('Error saving product listing:', error);
      throw error;
    }

    return data;
  }

  static async getProductListings(userId: string, marketplace?: string) {
    let query = supabase
      .from('product_listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (marketplace) {
      query = query.eq('marketplace', marketplace);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching product listings:', error);
      throw error;
    }

    return data;
  }

  static async saveEarnings(earnings: any) {
    const { data, error } = await supabase
      .from('earnings')
      .insert(earnings);

    if (error) {
      console.error('Error saving earnings:', error);
      throw error;
    }

    return data;
  }

  static async getEarnings(userId: string, period = '30d') {
    const { data, error } = await supabase
      .from('earnings')
      .select('*')
      .eq('user_id', userId)
      .eq('period', period)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching earnings:', error);
      throw error;
    }

    return data;
  }

  static async getFeatureFlags() {
    const { data, error } = await supabase
      .from('feature_flags')
      .select('*')
      .eq('is_enabled', true);

    if (error) {
      console.error('Error fetching feature flags:', error);
      throw error;
    }

    return data;
  }

  static async logAIGeneration(log: any) {
    const { data, error } = await supabase
      .from('ai_generation_logs')
      .insert(log);

    if (error) {
      console.error('Error logging AI generation:', error);
      throw error;
    }

    return data;
  }

  static async logMarketplaceAPI(log: any) {
    const { data, error } = await supabase
      .from('marketplace_api_logs')
      .insert(log);

    if (error) {
      console.error('Error logging marketplace API:', error);
      throw error;
    }

    return data;
  }
}