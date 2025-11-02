import client from "prom-client";

export const metricsRegister = new client.Registry();

metricsRegister.setDefaultLabels({
  service: "etsy-gen",
  environment: process.env.NODE_ENV || "development",
});

client.collectDefaultMetrics({
  register: metricsRegister,
  prefix: "etsygen_",
});

// ==================
// Pipeline Metrics
// ==================

export const jobDurationHistogram = new client.Histogram({
  name: "pipeline_job_duration_ms",
  help: "Duration of pipeline jobs in milliseconds",
  labelNames: ["stage", "status"],
  buckets: [100, 500, 1000, 5000, 15000, 60000, 300000],
  registers: [metricsRegister],
});

export const jobFailureCounter = new client.Counter({
  name: "pipeline_job_failures_total",
  help: "Total number of pipeline job failures",
  labelNames: ["stage", "reason"],
  registers: [metricsRegister],
});

export const jobSuccessCounter = new client.Counter({
  name: "pipeline_job_success_total",
  help: "Total number of successful pipeline jobs",
  labelNames: ["stage"],
  registers: [metricsRegister],
});

export const activeJobsGauge = new client.Gauge({
  name: "pipeline_active_jobs",
  help: "Number of currently active jobs",
  labelNames: ["stage"],
  registers: [metricsRegister],
});

export const queueDepthGauge = new client.Gauge({
  name: "pipeline_queue_depth",
  help: "Number of jobs waiting in queue",
  labelNames: ["queue"],
  registers: [metricsRegister],
});

// ==================
// AI Provider Metrics
// ==================

export const aiProviderLatency = new client.Histogram({
  name: "ai_provider_duration_seconds",
  help: "AI provider response times",
  labelNames: ["provider", "model", "operation"],
  buckets: [0.1, 0.5, 1, 2, 5, 10, 30],
  registers: [metricsRegister],
});

export const aiProviderErrors = new client.Counter({
  name: "ai_provider_errors_total",
  help: "Total number of AI provider errors",
  labelNames: ["provider", "error_type"],
  registers: [metricsRegister],
});

export const aiTokensUsed = new client.Counter({
  name: "ai_tokens_used_total",
  help: "Total number of AI tokens consumed",
  labelNames: ["provider", "model", "type"],
  registers: [metricsRegister],
});

// ==================
// Marketplace Metrics
// ==================

export const marketplaceHealthScore = new client.Gauge({
  name: "marketplace_health_score",
  help: "Health score of each marketplace integration (0-1)",
  labelNames: ["marketplace"],
  registers: [metricsRegister],
});

export const marketplaceRequestDuration = new client.Histogram({
  name: "marketplace_request_duration_seconds",
  help: "Duration of marketplace API requests",
  labelNames: ["marketplace", "endpoint", "status"],
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  registers: [metricsRegister],
});

export const marketplaceRateLimit = new client.Gauge({
  name: "marketplace_rate_limit_remaining",
  help: "Remaining API calls before rate limit",
  labelNames: ["marketplace"],
  registers: [metricsRegister],
});

// ==================
// Cache Metrics
// ==================

export const cacheHitCounter = new client.Counter({
  name: "cache_hits_total",
  help: "Total number of cache hits",
  labelNames: ["cache_key_prefix"],
  registers: [metricsRegister],
});

export const cacheMissCounter = new client.Counter({
  name: "cache_misses_total",
  help: "Total number of cache misses",
  labelNames: ["cache_key_prefix"],
  registers: [metricsRegister],
});

export const cacheSize = new client.Gauge({
  name: "cache_size_bytes",
  help: "Total size of cached data in bytes",
  labelNames: ["cache_type"],
  registers: [metricsRegister],
});

// ==================
// Database Metrics
// ==================

export const dbQueryDuration = new client.Histogram({
  name: "database_query_duration_seconds",
  help: "Database query execution time",
  labelNames: ["operation", "table"],
  buckets: [0.001, 0.01, 0.1, 0.5, 1, 2, 5],
  registers: [metricsRegister],
});

export const dbConnectionPoolSize = new client.Gauge({
  name: "database_connection_pool_size",
  help: "Current database connection pool size",
  labelNames: ["status"],
  registers: [metricsRegister],
});

// ==================
// Business Metrics
// ==================

export const productsGeneratedCounter = new client.Counter({
  name: "products_generated_total",
  help: "Total number of products generated",
  labelNames: ["niche", "quality_score"],
  registers: [metricsRegister],
});

export const listingsCreatedCounter = new client.Counter({
  name: "listings_created_total",
  help: "Total number of marketplace listings created",
  labelNames: ["marketplace", "status"],
  registers: [metricsRegister],
});

export const revenueGauge = new client.Gauge({
  name: "revenue_total_usd",
  help: "Total revenue in USD",
  labelNames: ["marketplace", "period"],
  registers: [metricsRegister],
});

export const trendScoreHistogram = new client.Histogram({
  name: "trend_score_distribution",
  help: "Distribution of trend scores",
  labelNames: ["niche_category"],
  buckets: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
  registers: [metricsRegister],
});

// ==================
// System Health Metrics
// ==================

export const systemHealthScore = new client.Gauge({
  name: "system_health_score",
  help: "Overall system health score (0-1)",
  registers: [metricsRegister],
});

export const errorRate = new client.Gauge({
  name: "error_rate_percent",
  help: "System-wide error rate percentage",
  labelNames: ["service"],
  registers: [metricsRegister],
});

/**
 * Helper function to record AI provider metrics
 */
export function recordAIMetrics(
  provider: string,
  model: string,
  duration: number,
  tokensUsed: { prompt: number; completion: number },
  error?: Error
) {
  aiProviderLatency.observe({ provider, model, operation: "generate" }, duration);
  
  if (error) {
    aiProviderErrors.inc({ provider, error_type: error.name });
  }
  
  aiTokensUsed.inc({ provider, model, type: "prompt" }, tokensUsed.prompt);
  aiTokensUsed.inc({ provider, model, type: "completion" }, tokensUsed.completion);
}

/**
 * Helper function to record marketplace metrics
 */
export function recordMarketplaceMetrics(
  marketplace: string,
  endpoint: string,
  duration: number,
  status: number,
  rateLimitRemaining?: number
) {
  marketplaceRequestDuration.observe(
    { marketplace, endpoint, status: status.toString() },
    duration
  );
  
  if (rateLimitRemaining !== undefined) {
    marketplaceRateLimit.set({ marketplace }, rateLimitRemaining);
  }
  
  // Update health score based on error rate
  const healthScore = status < 400 ? 1.0 : status < 500 ? 0.5 : 0.0;
  marketplaceHealthScore.set({ marketplace }, healthScore);
}
