-- Prisma to Supabase Migration
-- This migration creates tables that match the Prisma schema for compatibility
-- All tables have RLS enabled and appropriate policies

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Settings table (replaces Prisma Setting model)
CREATE TABLE IF NOT EXISTS "public"."settings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  namespace VARCHAR(255) DEFAULT 'global',
  key VARCHAR(255) NOT NULL,
  value JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace, key, user_id)
);

-- Enable RLS
ALTER TABLE "public"."settings" ENABLE ROW LEVEL SECURITY;

-- Policies for settings
CREATE POLICY "Allow individual read access" ON "public"."settings"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."settings"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."settings"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."settings"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- API Keys table (replaces Prisma ApiKey model)
CREATE TABLE IF NOT EXISTS "public"."api_keys" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  namespace VARCHAR(255) DEFAULT 'global',
  name VARCHAR(255) NOT NULL,
  encrypted_value TEXT NOT NULL,
  iv TEXT NOT NULL,
  last_four VARCHAR(4) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(namespace, name, user_id)
);

-- Enable RLS
ALTER TABLE "public"."api_keys" ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Allow individual read access" ON "public"."api_keys"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."api_keys"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."api_keys"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."api_keys"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Jobs table (replaces Prisma Job model)
CREATE TABLE IF NOT EXISTS "public"."jobs" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_key VARCHAR(255) UNIQUE NOT NULL,
  stage VARCHAR(50) NOT NULL CHECK (stage IN ('SCRAPE', 'ANALYZE', 'GENERATE', 'LIST')),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING')),
  attempts INTEGER DEFAULT 0,
  result JSONB,
  error JSONB,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  metadata JSONB,
  parent_job_id UUID REFERENCES "public"."jobs"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "public"."jobs" ENABLE ROW LEVEL SECURITY;

-- Policies for jobs
CREATE POLICY "Allow individual read access" ON "public"."jobs"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."jobs"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."jobs"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."jobs"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for jobs
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON "public"."jobs"(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_stage_status ON "public"."jobs"(stage, status, created_at);
CREATE INDEX IF NOT EXISTS idx_jobs_job_key ON "public"."jobs"(job_key);

-- Scrape Results table (replaces Prisma ScrapeResult model)
CREATE TABLE IF NOT EXISTS "public"."scrape_results" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  product_id VARCHAR(255) NOT NULL,
  title TEXT NOT NULL,
  price DECIMAL(18, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  tags TEXT[],
  category VARCHAR(255),
  sales INTEGER,
  rating DECIMAL(3, 2),
  collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  job_id UUID REFERENCES "public"."jobs"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(marketplace, product_id, collected_at)
);

-- Enable RLS
ALTER TABLE "public"."scrape_results" ENABLE ROW LEVEL SECURITY;

-- Policies for scrape_results
CREATE POLICY "Allow individual read access" ON "public"."scrape_results"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."scrape_results"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."scrape_results"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."scrape_results"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for scrape_results
CREATE INDEX IF NOT EXISTS idx_scrape_results_user_id ON "public"."scrape_results"(user_id);
CREATE INDEX IF NOT EXISTS idx_scrape_results_marketplace ON "public"."scrape_results"(marketplace, collected_at);

-- Trends table (replaces Prisma Trend model)
CREATE TABLE IF NOT EXISTS "public"."trends" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  niche VARCHAR(255) NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  tam_approx DECIMAL(15, 2),
  momentum DECIMAL(5, 2),
  competition DECIMAL(5, 2),
  summary TEXT,
  recommended_assets JSONB,
  metadata JSONB,
  job_id UUID REFERENCES "public"."jobs"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "public"."trends" ENABLE ROW LEVEL SECURITY;

-- Policies for trends
CREATE POLICY "Allow individual read access" ON "public"."trends"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."trends"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."trends"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."trends"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for trends
CREATE INDEX IF NOT EXISTS idx_trends_user_id ON "public"."trends"(user_id);
CREATE INDEX IF NOT EXISTS idx_trends_niche ON "public"."trends"(niche, created_at);

-- Products table (replaces Prisma Product model)
CREATE TABLE IF NOT EXISTS "public"."products" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  tags TEXT[],
  attributes JSONB,
  asset_paths TEXT[],
  preview_url TEXT,
  metadata JSONB,
  job_id UUID REFERENCES "public"."jobs"(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Allow individual read access" ON "public"."products"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."products"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."products"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."products"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for products
CREATE INDEX IF NOT EXISTS idx_products_user_id ON "public"."products"(user_id);
CREATE INDEX IF NOT EXISTS idx_products_title ON "public"."products"(title);

-- Listings table (replaces Prisma Listing model)
CREATE TABLE IF NOT EXISTS "public"."listings" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  marketplace VARCHAR(100) NOT NULL,
  remote_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DRAFT', 'PUBLISHED', 'FAILED')),
  price DECIMAL(18, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  quantity INTEGER,
  product_id UUID REFERENCES "public"."products"(id) ON DELETE CASCADE,
  job_id UUID REFERENCES "public"."jobs"(id) ON DELETE SET NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(marketplace, remote_id)
);

-- Enable RLS
ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;

-- Policies for listings
CREATE POLICY "Allow individual read access" ON "public"."listings"
FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual insert access" ON "public"."listings"
FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual update access" ON "public"."listings"
FOR UPDATE USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow individual delete access" ON "public"."listings"
FOR DELETE USING (auth.uid() = user_id OR user_id IS NULL);

-- Indexes for listings
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON "public"."listings"(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_marketplace_status ON "public"."listings"(marketplace, status, created_at);
CREATE INDEX IF NOT EXISTS idx_listings_product_id ON "public"."listings"(product_id);

-- Triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON "public"."settings"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON "public"."api_keys"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON "public"."jobs"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scrape_results_updated_at BEFORE UPDATE ON "public"."scrape_results"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trends_updated_at BEFORE UPDATE ON "public"."trends"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON "public"."products"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON "public"."listings"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
