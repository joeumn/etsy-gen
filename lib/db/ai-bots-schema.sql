-- AI Bots Management Schema
-- This schema supports the AI Bot Management feature

-- AI Bots table
CREATE TABLE IF NOT EXISTS ai_bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('scanner', 'generator', 'analytics', 'optimizer', 'custom')),
  status VARCHAR(20) DEFAULT 'paused' CHECK (status IN ('active', 'paused', 'error')),
  description TEXT,
  config JSONB DEFAULT '{}',
  last_run_at TIMESTAMP WITH TIME ZONE,
  next_run_at TIMESTAMP WITH TIME ZONE,
  tasks_completed INTEGER DEFAULT 0,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database operations log table
CREATE TABLE IF NOT EXISTS database_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  operation_type VARCHAR(50) NOT NULL CHECK (operation_type IN ('migration', 'backup', 'restore')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  details JSONB DEFAULT '{}',
  file_url TEXT,
  file_name VARCHAR(255),
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_bots_user_id ON ai_bots(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_bots_status ON ai_bots(status);
CREATE INDEX IF NOT EXISTS idx_ai_bots_type ON ai_bots(type);
CREATE INDEX IF NOT EXISTS idx_ai_bots_created_at ON ai_bots(created_at);
CREATE INDEX IF NOT EXISTS idx_database_operations_user_id ON database_operations(user_id);
CREATE INDEX IF NOT EXISTS idx_database_operations_type ON database_operations(operation_type);
CREATE INDEX IF NOT EXISTS idx_database_operations_status ON database_operations(status);
CREATE INDEX IF NOT EXISTS idx_database_operations_created_at ON database_operations(created_at);

-- Triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_ai_bots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trigger_update_ai_bots_updated_at 
  BEFORE UPDATE ON ai_bots 
  FOR EACH ROW 
  EXECUTE FUNCTION update_ai_bots_updated_at();
