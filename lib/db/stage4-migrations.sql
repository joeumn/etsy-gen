-- Stage 4: Automation Engine
-- SQL Migrations for new tables

-- Pricing history table
CREATE TABLE IF NOT EXISTS pricing_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid,
  old_price numeric,
  new_price numeric,
  expected_delta numeric,
  decided_at timestamptz default now()
);

-- Traffic sources table
CREATE TABLE IF NOT EXISTS traffic_sources (
  id uuid primary key default gen_random_uuid(),
  platform text,
  post_url text,
  impressions int,
  clicks int,
  conversions int,
  created_at timestamptz default now()
);

-- Auto-generated reports table
CREATE TABLE IF NOT EXISTS auto_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  summary text,
  actions jsonb
);

-- Payouts table
CREATE TABLE IF NOT EXISTS payouts (
  id uuid primary key default gen_random_uuid(),
  amount numeric,
  date timestamptz default now(),
  notes text
);
