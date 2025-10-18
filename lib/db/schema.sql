-- AI Product Dashboard Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'super_admin')),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Providers table
CREATE TABLE IF NOT EXISTS ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplaces table
CREATE TABLE IF NOT EXISTS marketplaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend data table
CREATE TABLE IF NOT EXISTS trend_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  marketplace VARCHAR(100) NOT NULL,
  category VARCHAR(255),
  keywords TEXT[],
  sales_velocity DECIMAL(10,2),
  price_min DECIMAL(10,2),
  price_max DECIMAL(10,2),
  competition_level VARCHAR(20) CHECK (competition_level IN ('low', 'medium', 'high')),
  seasonality TEXT[],
  target_audience TEXT[],
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generated products table
CREATE TABLE IF NOT EXISTS generated_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_provider VARCHAR(100) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  tags TEXT[],
  price DECIMAL(10,2),
  category VARCHAR(255),
  seo_keywords TEXT[],
  content TEXT,
  specifications JSONB,
  image_url TEXT,
  image_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product listings table
CREATE TABLE IF NOT EXISTS product_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  generated_product_id UUID REFERENCES generated_products(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  external_id VARCHAR(255),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  category VARCHAR(255),
  tags TEXT[],
  images TEXT[],
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'inactive', 'sold_out')),
  listing_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Earnings table
CREATE TABLE IF NOT EXISTS earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES product_listings(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  period VARCHAR(20) NOT NULL,
  total_sales INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_order_value DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Top products table (for earnings analysis)
CREATE TABLE IF NOT EXISTS top_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earnings_id UUID REFERENCES earnings(id) ON DELETE CASCADE,
  product_title VARCHAR(500),
  sales INTEGER,
  revenue DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generation logs table
CREATE TABLE IF NOT EXISTS ai_generation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ai_provider VARCHAR(100) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace API logs table
CREATE TABLE IF NOT EXISTS marketplace_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  request_data JSONB,
  response_data JSONB,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags table (for Zig modules)
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  default_ai_provider VARCHAR(100),
  default_marketplace VARCHAR(100),
  notification_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Design assets table (Zig 3 - AI Design Studio)
CREATE TABLE IF NOT EXISTS design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES generated_products(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type VARCHAR(20) DEFAULT 'png' CHECK (image_type IN ('png', 'jpg', 'jpeg', 'svg', 'webp')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User usage table (Zig 4 - Monetization)
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  monthly_scans INTEGER DEFAULT 0,
  monthly_generations INTEGER DEFAULT 0,
  monthly_designs INTEGER DEFAULT 0,
  monthly_brands INTEGER DEFAULT 0,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table (Zig 6 - Auto-Branding)
CREATE TABLE IF NOT EXISTS brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  color_palette JSONB,
  typography JSONB,
  tagline TEXT,
  brand_kit_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social trends table (Zig 5 - Social Signals)
CREATE TABLE IF NOT EXISTS social_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trend_data(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('tiktok', 'pinterest', 'instagram', 'twitter')),
  hashtag VARCHAR(255) NOT NULL,
  engagement_score DECIMAL(5,2) DEFAULT 0,
  reach_score DECIMAL(5,2) DEFAULT 0,
  viral_score DECIMAL(5,2) DEFAULT 0,
  social_trend_score DECIMAL(5,2) DEFAULT 0,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trend_data_marketplace ON trend_data(marketplace);
CREATE INDEX IF NOT EXISTS idx_trend_data_category ON trend_data(category);
CREATE INDEX IF NOT EXISTS idx_trend_data_created_at ON trend_data(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_products_user_id ON generated_products(user_id);
CREATE INDEX IF NOT EXISTS idx_generated_products_created_at ON generated_products(created_at);
CREATE INDEX IF NOT EXISTS idx_product_listings_user_id ON product_listings(user_id);
CREATE INDEX IF NOT EXISTS idx_product_listings_marketplace ON product_listings(marketplace);
CREATE INDEX IF NOT EXISTS idx_product_listings_status ON product_listings(status);
CREATE INDEX IF NOT EXISTS idx_earnings_user_id ON earnings(user_id);
CREATE INDEX IF NOT EXISTS idx_earnings_period ON earnings(period);
CREATE INDEX IF NOT EXISTS idx_earnings_created_at ON earnings(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generation_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_marketplace_api_logs_user_id ON marketplace_api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_api_logs_created_at ON marketplace_api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_design_assets_user_id ON design_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_design_assets_product_id ON design_assets(product_id);
CREATE INDEX IF NOT EXISTS idx_design_assets_created_at ON design_assets(created_at);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_plan ON user_usage(plan);
CREATE INDEX IF NOT EXISTS idx_brands_user_id ON brands(user_id);
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at);
CREATE INDEX IF NOT EXISTS idx_social_trends_trend_id ON social_trends(trend_id);
CREATE INDEX IF NOT EXISTS idx_social_trends_platform ON social_trends(platform);
CREATE INDEX IF NOT EXISTS idx_social_trends_created_at ON social_trends(created_at);

-- Insert default AI providers (only if they don't exist)
INSERT INTO ai_providers (name, is_active, config) VALUES
('gemini', true, '{"model": "gemini-pro", "temperature": 0.7}'),
('openai', true, '{"model": "gpt-4", "temperature": 0.7}'),
('azure', true, '{"model": "gpt-4", "temperature": 0.7}'),
('anthropic', true, '{"model": "claude-3-sonnet-20240229", "temperature": 0.7}'),
('saunet', true, '{"model": "saunet-pro", "temperature": 0.7}')
ON CONFLICT (name) DO NOTHING;

-- Insert default marketplaces (only if they don't exist)
INSERT INTO marketplaces (name, is_active, config) VALUES
('etsy', true, '{"api_version": "v3", "rate_limit": 100}'),
('amazon', true, '{"api_version": "2022-04-01", "rate_limit": 200}'),
('shopify', true, '{"api_version": "2023-10", "rate_limit": 40}')
ON CONFLICT (name) DO NOTHING;

-- Insert default feature flags (only if they don't exist)
INSERT INTO feature_flags (name, is_enabled, config) VALUES
('zig_1_edge_scaling', false, '{"description": "Run scanning via Cloudflare Workers or Vercel Edge Functions"}'),
('zig_2_vector_search', false, '{"description": "Add pgvector / Qdrant index to cluster trends & prevent duplicate listings"}'),
('zig_3_ai_design_studio', true, '{"description": "Integrate image generation for instant product mockups"}'),
('zig_4_monetization', true, '{"description": "Add Stripe billing + usage-based limits + affiliate tracking"}'),
('zig_5_social_signals', true, '{"description": "Scan TikTok, Pinterest, Instagram hashtags for trend ranking"}'),
('zig_6_auto_branding', true, '{"description": "Create store branding (logo, banner, colors, font kit) for each product line"}')
ON CONFLICT (name) DO NOTHING;

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps (Using DO blocks to prevent errors if triggers already exist)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_ai_providers_updated_at') THEN
    CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_marketplaces_updated_at') THEN
    CREATE TRIGGER update_marketplaces_updated_at BEFORE UPDATE ON marketplaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_generated_products_updated_at') THEN
    CREATE TRIGGER update_generated_products_updated_at BEFORE UPDATE ON generated_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_product_listings_updated_at') THEN
    CREATE TRIGGER update_product_listings_updated_at BEFORE UPDATE ON product_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feature_flags_updated_at') THEN
    CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_settings_updated_at') THEN
    CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_design_assets_updated_at') THEN
    CREATE TRIGGER update_design_assets_updated_at BEFORE UPDATE ON design_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_user_usage_updated_at') THEN
    CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_brands_updated_at') THEN
    CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;


-- Insert default admin user (password: ForgeAdmin2024!)
-- Password hash generated with bcrypt, rounds=12
INSERT INTO users (email, password_hash, name, role, is_active, email_verified) VALUES
('admin@foundersforge.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWcrcQwO', 'FoundersForge Admin', 'super_admin', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  is_active = EXCLUDED.is_active,
  email_verified = EXCLUDED.email_verified;

