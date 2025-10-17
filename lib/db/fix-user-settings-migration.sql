-- Fix user_settings table to support all required fields
-- This migration updates the user_settings table schema

-- Drop the existing table structure and recreate with proper columns
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS ai_provider VARCHAR(100),
ADD COLUMN IF NOT EXISTS ai_keys JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS marketplace_connections JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "email": true,
  "push": false,
  "weeklyReport": true,
  "newTrends": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS feature_flags JSONB DEFAULT '{}'::jsonb;

-- Update the ai_keys and marketplace_connections to have proper defaults
UPDATE user_settings 
SET ai_keys = COALESCE(ai_keys, '{
  "gemini": "",
  "openai": "",
  "anthropic": "",
  "azureOpenAI": ""
}'::jsonb)
WHERE ai_keys IS NULL OR ai_keys = '{}'::jsonb;

UPDATE user_settings 
SET marketplace_connections = COALESCE(marketplace_connections, '{
  "etsy": {"connected": false, "apiKey": ""},
  "amazon": {"connected": false, "accessKey": "", "secretKey": "", "region": "us-east-1"},
  "shopify": {"connected": false, "accessToken": "", "shopDomain": ""}
}'::jsonb)
WHERE marketplace_connections IS NULL OR marketplace_connections = '{}'::jsonb;

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
