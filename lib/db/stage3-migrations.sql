-- Stage 3: AI Analytics + Forecasts + Affiliate/Leaderboard
-- SQL Migrations for new tables and views

-- 1) Analytics helper tables
CREATE TABLE IF NOT EXISTS analytics_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  key TEXT UNIQUE NOT NULL,
  payload JSONB NOT NULL,
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- 2) Affiliate core tables
CREATE TABLE IF NOT EXISTS affiliates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT UNIQUE NOT NULL,
  display_name TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL REFERENCES affiliates(code) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  ip INET,
  ua TEXT,
  landing_path TEXT,
  referrer TEXT
);

CREATE TABLE IF NOT EXISTS affiliate_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL REFERENCES affiliates(code) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  first_touch_click_id UUID REFERENCES affiliate_clicks(id)
);

-- Affiliate conversions (tied to Stripe subscriptions from Stage 2)
CREATE TABLE IF NOT EXISTS affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL REFERENCES affiliates(code) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  plan TEXT NOT NULL CHECK (plan IN ('pro', 'enterprise')),
  mrr_cents INTEGER NOT NULL DEFAULT 0,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  conversion_value_cents INTEGER DEFAULT 0
);

-- 3) Leaderboard materialization view
CREATE OR REPLACE VIEW affiliate_leaderboard AS
SELECT
  a.id,
  a.code,
  a.display_name,
  a.is_public,
  COALESCE(s.signups, 0) as signups,
  COALESCE(c.conversions, 0) as conversions,
  COALESCE(c.mrr_cents_total, 0) as mrr_cents_total,
  COALESCE(c.conversion_value_total, 0) as conversion_value_total,
  CASE 
    WHEN COALESCE(s.signups, 0) = 0 THEN 0
    ELSE ROUND((COALESCE(c.conversions, 0)::DECIMAL / s.signups) * 100, 2)
  END as conversion_rate,
  a.created_at
FROM affiliates a
LEFT JOIN (
  SELECT code, COUNT(*) as signups 
  FROM affiliate_signups 
  GROUP BY code
) s ON s.code = a.code
LEFT JOIN (
  SELECT 
    code, 
    COUNT(*) as conversions, 
    SUM(mrr_cents) as mrr_cents_total,
    SUM(conversion_value_cents) as conversion_value_total
  FROM affiliate_conversions 
  GROUP BY code
) c ON c.code = a.code;

-- 4) Telemetry (optional)
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ DEFAULT NOW(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  payload JSONB,
  session_id TEXT,
  ip INET,
  ua TEXT
);

-- 5) Analytics queries cache for common questions
CREATE TABLE IF NOT EXISTS analytics_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_text TEXT NOT NULL,
  query_hash TEXT UNIQUE NOT NULL,
  sql_template TEXT NOT NULL,
  parameters JSONB,
  result_type TEXT NOT NULL CHECK (result_type IN ('table', 'timeseries', 'bar', 'radar', 'pie')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW(),
  usage_count INTEGER DEFAULT 1
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analytics_cache_key ON analytics_cache(key);
CREATE INDEX IF NOT EXISTS idx_analytics_cache_expires_at ON analytics_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_affiliates_user_id ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliates_code ON affiliates(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_code ON affiliate_clicks(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_occurred_at ON affiliate_clicks(occurred_at);
CREATE INDEX IF NOT EXISTS idx_affiliate_signups_code ON affiliate_signups(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_signups_user_id ON affiliate_signups(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_code ON affiliate_conversions(code);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_user_id ON affiliate_conversions(user_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_conversions_occurred_at ON affiliate_conversions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_name ON events(name);
CREATE INDEX IF NOT EXISTS idx_events_occurred_at ON events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_analytics_queries_hash ON analytics_queries(query_hash);
CREATE INDEX IF NOT EXISTS idx_analytics_queries_last_used ON analytics_queries(last_used_at);

-- Triggers for updating timestamps
CREATE TRIGGER update_affiliates_updated_at 
  BEFORE UPDATE ON affiliates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Stage 3 feature flags
INSERT INTO feature_flags (name, is_enabled, config) VALUES
('stage3_analytics', false, '{"description": "AI Analytics with NL queries, forecasting, and anomaly detection"}'),
('stage3_affiliates', false, '{"description": "Affiliate referral system with tracking and payouts"}'),
('stage3_leaderboard', false, '{"description": "Public leaderboard for affiliate performance"}'),
('stage3_telemetry', false, '{"description": "Event tracking and analytics telemetry"}')
ON CONFLICT (name) DO UPDATE SET 
  config = EXCLUDED.config,
  updated_at = NOW();

-- Function to clean up expired analytics cache
CREATE OR REPLACE FUNCTION cleanup_analytics_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM analytics_cache WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to generate affiliate code
CREATE OR REPLACE FUNCTION generate_affiliate_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generate 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT COUNT(*) INTO exists_count FROM affiliates WHERE code = generate_affiliate_code.code;
    
    -- Exit loop if code is unique
    EXIT WHEN exists_count = 0;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Function to track affiliate click
CREATE OR REPLACE FUNCTION track_affiliate_click(
  p_code TEXT,
  p_ip INET DEFAULT NULL,
  p_ua TEXT DEFAULT NULL,
  p_landing_path TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  click_id UUID;
BEGIN
  -- Insert click record
  INSERT INTO affiliate_clicks (code, ip, ua, landing_path, referrer)
  VALUES (p_code, p_ip, p_ua, p_landing_path, p_referrer)
  RETURNING id INTO click_id;
  
  RETURN click_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track affiliate signup
CREATE OR REPLACE FUNCTION track_affiliate_signup(
  p_code TEXT,
  p_user_id UUID,
  p_click_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  signup_id UUID;
BEGIN
  -- Insert signup record
  INSERT INTO affiliate_signups (code, user_id, first_touch_click_id)
  VALUES (p_code, p_user_id, p_click_id)
  RETURNING id INTO signup_id;
  
  RETURN signup_id;
END;
$$ LANGUAGE plpgsql;

-- Function to track affiliate conversion
CREATE OR REPLACE FUNCTION track_affiliate_conversion(
  p_code TEXT,
  p_user_id UUID,
  p_plan TEXT,
  p_mrr_cents INTEGER,
  p_stripe_customer_id TEXT DEFAULT NULL,
  p_stripe_subscription_id TEXT DEFAULT NULL,
  p_conversion_value_cents INTEGER DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  conversion_id UUID;
BEGIN
  -- Insert conversion record
  INSERT INTO affiliate_conversions (
    code, user_id, plan, mrr_cents, 
    stripe_customer_id, stripe_subscription_id, conversion_value_cents
  )
  VALUES (
    p_code, p_user_id, p_plan, p_mrr_cents,
    p_stripe_customer_id, p_stripe_subscription_id, p_conversion_value_cents
  )
  RETURNING id INTO conversion_id;
  
  RETURN conversion_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get affiliate stats
CREATE OR REPLACE FUNCTION get_affiliate_stats(p_code TEXT)
RETURNS TABLE (
  signups BIGINT,
  conversions BIGINT,
  mrr_cents BIGINT,
  conversion_rate DECIMAL,
  total_value_cents BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(s.signups, 0) as signups,
    COALESCE(c.conversions, 0) as conversions,
    COALESCE(c.mrr_cents, 0) as mrr_cents,
    CASE 
      WHEN COALESCE(s.signups, 0) = 0 THEN 0
      ELSE ROUND((COALESCE(c.conversions, 0)::DECIMAL / s.signups) * 100, 2)
    END as conversion_rate,
    COALESCE(c.total_value_cents, 0) as total_value_cents
  FROM affiliates a
  LEFT JOIN (
    SELECT code, COUNT(*) as signups 
    FROM affiliate_signups 
    WHERE code = p_code
    GROUP BY code
  ) s ON s.code = a.code
  LEFT JOIN (
    SELECT 
      code, 
      COUNT(*) as conversions,
      SUM(mrr_cents) as mrr_cents,
      SUM(conversion_value_cents) as total_value_cents
    FROM affiliate_conversions 
    WHERE code = p_code
    GROUP BY code
  ) c ON c.code = a.code
  WHERE a.code = p_code;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON analytics_cache TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON affiliates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON affiliate_clicks TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON affiliate_signups TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON affiliate_conversions TO authenticated;
GRANT SELECT ON affiliate_leaderboard TO authenticated;
GRANT SELECT, INSERT ON events TO authenticated;
GRANT SELECT, INSERT, UPDATE ON analytics_queries TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION generate_affiliate_code() TO authenticated;
GRANT EXECUTE ON FUNCTION track_affiliate_click(TEXT, INET, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION track_affiliate_signup(TEXT, UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION track_affiliate_conversion(TEXT, UUID, TEXT, INTEGER, TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_affiliate_stats(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_analytics_cache() TO authenticated;