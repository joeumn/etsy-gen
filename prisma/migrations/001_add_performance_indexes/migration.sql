-- Migration: Add Performance Indexes and Data Retention
-- Created: 2025-11-02
-- Description: Adds critical indexes for query performance and implements data retention

-- Add performance indexes for scrape results
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scrape_results_marketplace_time 
  ON "ScrapeResult"(marketplace, "collectedAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_scrape_results_job_collected 
  ON "ScrapeResult"("jobId", "collectedAt" DESC);

-- Add indexes for jobs table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_stage_status_created 
  ON "Job"(stage, status, "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_jobs_parent_created 
  ON "Job"("parentJobId", "createdAt" DESC) WHERE "parentJobId" IS NOT NULL;

-- Add indexes for trends table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trends_score_created 
  ON "Trend"(score DESC, "createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_trends_niche_score 
  ON "Trend"(niche, score DESC);

-- Add indexes for products table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created 
  ON "Product"("createdAt" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_job_created 
  ON "Product"("jobId", "createdAt" DESC);

-- Add indexes for listings table
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_product_marketplace 
  ON "Listing"("productId", marketplace, status);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_listings_status_updated 
  ON "Listing"(status, "updatedAt" DESC);

-- Add index for settings lookup
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_settings_lookup 
  ON "Setting"(namespace, key) WHERE namespace = 'global';

-- Add partial index for active API keys
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_apikeys_active 
  ON "ApiKey"(namespace, name) 
  WHERE "createdAt" > NOW() - INTERVAL '1 year';

-- Create function to automatically delete old scrape results
CREATE OR REPLACE FUNCTION cleanup_old_scrape_results()
RETURNS void AS $$
BEGIN
  -- Delete scrape results older than 90 days
  DELETE FROM "ScrapeResult"
  WHERE "collectedAt" < NOW() - INTERVAL '90 days';
  
  -- Log the cleanup
  RAISE NOTICE 'Cleaned up old scrape results';
END;
$$ LANGUAGE plpgsql;

-- Create function to archive completed jobs
CREATE OR REPLACE FUNCTION archive_old_jobs()
RETURNS void AS $$
BEGIN
  -- Update old completed jobs to reduce active dataset
  UPDATE "Job"
  SET metadata = jsonb_set(
    COALESCE(metadata, '{}'::jsonb),
    '{archived}',
    'true'::jsonb
  )
  WHERE status IN ('SUCCESS', 'FAILED')
    AND "completedAt" < NOW() - INTERVAL '30 days'
    AND NOT (metadata->>'archived' = 'true');
  
  RAISE NOTICE 'Archived old jobs';
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON INDEX idx_scrape_results_marketplace_time IS 
  'Optimizes queries for recent scrape results by marketplace';

COMMENT ON INDEX idx_jobs_stage_status_created IS 
  'Optimizes job status queries by stage';

COMMENT ON INDEX idx_trends_score_created IS 
  'Optimizes trending niche queries by score';

COMMENT ON FUNCTION cleanup_old_scrape_results() IS 
  'Removes scrape results older than 90 days to maintain database performance';

COMMENT ON FUNCTION archive_old_jobs() IS 
  'Archives completed jobs older than 30 days';
