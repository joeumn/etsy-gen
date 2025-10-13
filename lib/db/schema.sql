-- AI Product Dashboard Database Schema

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Providers table
CREATE TABLE ai_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplaces table
CREATE TABLE marketplaces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trend data table
CREATE TABLE trend_data (
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
CREATE TABLE generated_products (
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
CREATE TABLE product_listings (
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
CREATE TABLE earnings (
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
CREATE TABLE top_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  earnings_id UUID REFERENCES earnings(id) ON DELETE CASCADE,
  product_title VARCHAR(500),
  sales INTEGER,
  revenue DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI generation logs table
CREATE TABLE ai_generation_logs (
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
CREATE TABLE marketplace_api_logs (
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
CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  is_enabled BOOLEAN DEFAULT false,
  config JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  default_ai_provider VARCHAR(100),
  default_marketplace VARCHAR(100),
  notification_preferences JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_trend_data_marketplace ON trend_data(marketplace);
CREATE INDEX idx_trend_data_category ON trend_data(category);
CREATE INDEX idx_trend_data_created_at ON trend_data(created_at);
CREATE INDEX idx_generated_products_user_id ON generated_products(user_id);
CREATE INDEX idx_generated_products_created_at ON generated_products(created_at);
CREATE INDEX idx_product_listings_user_id ON product_listings(user_id);
CREATE INDEX idx_product_listings_marketplace ON product_listings(marketplace);
CREATE INDEX idx_product_listings_status ON product_listings(status);
CREATE INDEX idx_earnings_user_id ON earnings(user_id);
CREATE INDEX idx_earnings_period ON earnings(period);
CREATE INDEX idx_earnings_created_at ON earnings(created_at);
CREATE INDEX idx_ai_generation_logs_user_id ON ai_generation_logs(user_id);
CREATE INDEX idx_ai_generation_logs_created_at ON ai_generation_logs(created_at);
CREATE INDEX idx_marketplace_api_logs_user_id ON marketplace_api_logs(user_id);
CREATE INDEX idx_marketplace_api_logs_created_at ON marketplace_api_logs(created_at);
-- New indexes for Zig modules
CREATE INDEX idx_design_assets_user_id ON design_assets(user_id);
CREATE INDEX idx_design_assets_product_id ON design_assets(product_id);
CREATE INDEX idx_design_assets_created_at ON design_assets(created_at);
CREATE INDEX idx_user_usage_user_id ON user_usage(user_id);
CREATE INDEX idx_brands_user_id ON brands(user_id);
CREATE INDEX idx_brands_created_at ON brands(created_at);
CREATE INDEX idx_social_trends_trend_id ON social_trends(trend_id);
CREATE INDEX idx_social_trends_platform ON social_trends(platform);
CREATE INDEX idx_social_trends_created_at ON social_trends(created_at);

-- Insert default AI providers
INSERT INTO ai_providers (name, is_active, config) VALUES
('gemini', true, '{"model": "gemini-pro", "temperature": 0.7}'),
('openai', true, '{"model": "gpt-4", "temperature": 0.7}'),
('azure', true, '{"model": "gpt-4", "temperature": 0.7}'),
('anthropic', true, '{"model": "claude-3-sonnet-20240229", "temperature": 0.7}'),
('saunet', true, '{"model": "saunet-pro", "temperature": 0.7}');

-- Insert default marketplaces
INSERT INTO marketplaces (name, is_active, config) VALUES
('etsy', true, '{"api_version": "v3", "rate_limit": 100}'),
('amazon', true, '{"api_version": "2022-04-01", "rate_limit": 200}'),
('shopify', true, '{"api_version": "2023-10", "rate_limit": 40}');

-- Design assets table (Zig 3)
CREATE TABLE design_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES generated_products(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  image_type VARCHAR(20) DEFAULT 'png' CHECK (image_type IN ('png', 'jpg', 'svg')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User usage table (Zig 4)
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  plan VARCHAR(20) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'enterprise')),
  scans_used INTEGER DEFAULT 0,
  scans_limit INTEGER DEFAULT 10,
  generations_used INTEGER DEFAULT 0,
  generations_limit INTEGER DEFAULT 5,
  studio_access BOOLEAN DEFAULT false,
  social_signals BOOLEAN DEFAULT false,
  auto_branding BOOLEAN DEFAULT false,
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Brands table (Zig 6)
CREATE TABLE brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  logo_url TEXT,
  color_palette JSONB,
  typography JSONB,
  tagline TEXT,
  brand_kit_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Social trends table (Zig 5)
CREATE TABLE social_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trend_id UUID REFERENCES trend_data(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  hashtag VARCHAR(100),
  engagement_score DECIMAL(5,2),
  reach_score DECIMAL(5,2),
  viral_score DECIMAL(5,2),
  social_trend_score DECIMAL(5,2),
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default feature flags
INSERT INTO feature_flags (name, is_enabled, config) VALUES
('zig_1_edge_scaling', false, '{"description": "Run scanning via Cloudflare Workers or Vercel Edge Functions"}'),
('zig_2_vector_search', false, '{"description": "Add pgvector / Qdrant index to cluster trends & prevent duplicate listings"}'),
('zig_3_ai_design_studio', false, '{"description": "Integrate image generation for instant product mockups"}'),
('zig_4_monetization', false, '{"description": "Add Stripe billing + usage-based limits + affiliate tracking"}'),
('zig_5_social_signals', false, '{"description": "Scan TikTok, Pinterest, Instagram hashtags for trend ranking"}'),
('zig_6_auto_branding', false, '{"description": "Create store branding (logo, banner, colors, font kit) for each product line"}');

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_marketplaces_updated_at BEFORE UPDATE ON marketplaces FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_generated_products_updated_at BEFORE UPDATE ON generated_products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_listings_updated_at BEFORE UPDATE ON product_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON feature_flags FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();