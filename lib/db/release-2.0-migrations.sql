-- Release 2.0: New Features Migration
-- Adds support for Google Drive, Scheduling, Themes, Forecasting, and Team Collaboration

-- Google Drive Integration Configuration
CREATE TABLE IF NOT EXISTS google_drive_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  client_id TEXT,
  client_secret TEXT,
  refresh_token TEXT,
  folder_id TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scheduled Scrape Jobs
CREATE TABLE IF NOT EXISTS scrape_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  marketplace VARCHAR(100) NOT NULL,
  category VARCHAR(255),
  frequency VARCHAR(50) NOT NULL CHECK (frequency IN ('hourly', 'daily', 'weekly', 'monthly')),
  time_of_day TIME,
  day_of_week INTEGER,
  is_active BOOLEAN DEFAULT true,
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Theme Customizations
CREATE TABLE IF NOT EXISTS theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  theme_name VARCHAR(100) DEFAULT 'default',
  primary_color VARCHAR(7) DEFAULT '#2D9CDB',
  secondary_color VARCHAR(7) DEFAULT '#FF6B22',
  accent_color VARCHAR(7) DEFAULT '#FFC400',
  dark_mode BOOLEAN DEFAULT false,
  font_family VARCHAR(100),
  custom_css TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Forecasting Models and Predictions
CREATE TABLE IF NOT EXISTS forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  forecast_type VARCHAR(50) NOT NULL CHECK (forecast_type IN ('revenue', 'sales', 'demand', 'trend')),
  target_date DATE NOT NULL,
  predicted_value DECIMAL(10,2),
  confidence_interval_low DECIMAL(10,2),
  confidence_interval_high DECIMAL(10,2),
  actual_value DECIMAL(10,2),
  accuracy_score DECIMAL(5,2),
  model_version VARCHAR(50),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team Members and Invitations
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  member_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(team_owner_id, member_user_id)
);

CREATE TABLE IF NOT EXISTS team_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Log for Team Collaboration
CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action_type VARCHAR(100) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scrape_schedules_user ON scrape_schedules(user_id);
CREATE INDEX IF NOT EXISTS idx_scrape_schedules_next_run ON scrape_schedules(next_run_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_forecasts_user_date ON forecasts(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_team_members_owner ON team_members(team_owner_id);
CREATE INDEX IF NOT EXISTS idx_team_invitations_token ON team_invitations(token);
CREATE INDEX IF NOT EXISTS idx_activity_log_user ON activity_log(user_id, created_at DESC);
