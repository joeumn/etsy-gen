/**
 * CRON 1: Intelligence Cycle
 * 
 * Master data collection & AI trend analysis loop
 * Runs every 3-6 hours
 * 
 * Responsibilities:
 * - Scrape all marketplaces
 * - Scrape social media platforms
 * - Aggregate and clean data
 * - Run AI trend analysis
 * - Detect product opportunities
 * - Update dashboards
 */

import { logger, logError, PerformanceLogger } from '../logger';
import { AIProviderFactory } from '../ai/aiFactory';
import { EtsyMarketplace } from '../marketplaces/etsy';
import { AmazonMarketplace } from '../marketplaces/amazon';
import { ShopifyMarketplace } from '../marketplaces/shopify';
import { supabase } from '../db/client';
import { setCache, CACHE_TTL } from '../cache';

export interface ScrapeSource {
  name: string;
  type: 'marketplace' | 'social' | 'web';
  priority: 'high' | 'medium' | 'low';
  scraper: () => Promise<any[]>;
}

export interface TrendOpportunity {
  id: string;
  title: string;
  source: string;
  keywords: string[];
  profitabilityIndex: number; // 0-100
  competitionLevel: 'low' | 'medium' | 'high';
  viralityScore: number; // 0-100
  launchDifficulty: 'easy' | 'medium' | 'hard';
  priority: 'immediate' | 'emerging' | 'high_potential';
  estimatedRevenue: { min: number; max: number };
  confidence: number; // 0-100
  recommendedAction: string;
  aiInsights: string[];
}

/**
 * MAIN INTELLIGENCE CYCLE FUNCTION
 * Called by cron job every 3-6 hours
 */
export async function runIntelligenceCycle(): Promise<{
  success: boolean;
  scraped: number;
  opportunities: number;
  duration: number;
  errors: string[];
}> {
  const perfLogger = new PerformanceLogger('CRON', 'Intelligence-Cycle');
  const errors: string[] = [];

  try {
    logger.info('🔍 Starting Intelligence Cycle...');

    // Step 1: Scrape all sources
    const scrapedData = await scrapeAllSources();
    logger.info({ count: scrapedData.length }, 'Scraped data from all sources');

    // Step 2: Clean and aggregate data
    const cleanedData = await cleanAndAggregateData(scrapedData);
    logger.info({ count: cleanedData.length }, 'Cleaned and aggregated data');

    // Step 3: AI trend analysis
    const opportunities = await analyzeTrendsWithAI(cleanedData);
    logger.info({ count: opportunities.length }, 'Identified trend opportunities');

    // Step 4: Save to database
    await saveTrendsToDatabase(opportunities);
    logger.info('Saved opportunities to database');

    // Step 5: Update dashboard cache
    await updateDashboardCache(opportunities);
    logger.info('Updated dashboard cache');

    const duration = perfLogger.end({ 
      scraped: scrapedData.length, 
      opportunities: opportunities.length 
    });

    return {
      success: true,
      scraped: scrapedData.length,
      opportunities: opportunities.length,
      duration,
      errors,
    };
  } catch (error) {
    logError(error, 'IntelligenceCycle');
    perfLogger.endWithError(error);
    
    return {
      success: false,
      scraped: 0,
      opportunities: 0,
      duration: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}

/**
 * Scrape all data sources in parallel
 */
async function scrapeAllSources(): Promise<any[]> {
  const sources: ScrapeSource[] = [
    {
      name: 'Etsy',
      type: 'marketplace',
      priority: 'high',
      scraper: async () => {
        try {
          const marketplace = new EtsyMarketplace({
            apiKey: process.env.ETSY_API_KEY || '',
            secret: process.env.ETSY_SHARED_SECRET,
          });
          
          if (!marketplace.isAvailable) return [];
          
          return await marketplace.scanTrends(undefined, 100);
        } catch (error) {
          logError(error, 'EtsyScraper');
          return [];
        }
      },
    },
    {
      name: 'Shopify',
      type: 'marketplace',
      priority: 'high',
      scraper: async () => {
        try {
          const marketplace = new ShopifyMarketplace({
            apiKey: process.env.SHOPIFY_ACCESS_TOKEN || '',
            baseUrl: process.env.SHOPIFY_SHOP_DOMAIN,
          });
          
          if (!marketplace.isAvailable) return [];
          
          return await marketplace.scanTrends(undefined, 100);
        } catch (error) {
          logError(error, 'ShopifyScraper');
          return [];
        }
      },
    },
    {
      name: 'Amazon',
      type: 'marketplace',
      priority: 'medium',
      scraper: async () => {
        try {
          const marketplace = new AmazonMarketplace({
            apiKey: process.env.AMAZON_ACCESS_KEY || '',
            secret: process.env.AMAZON_SECRET_KEY,
            region: process.env.AMAZON_REGION,
          });
          
          if (!marketplace.isAvailable) return [];
          
          return await marketplace.scanTrends(undefined, 50);
        } catch (error) {
          logError(error, 'AmazonScraper');
          return [];
        }
      },
    },
    // Social media scrapers would go here
    // TikTok, Pinterest, Instagram, etc.
  ];

  // Execute all scrapers in parallel
  const results = await Promise.all(
    sources.map(async (source) => {
      try {
        const data = await source.scraper();
        logger.info({ source: source.name, count: data.length }, 'Scrape completed');
        return data.map(d => ({ ...d, source: source.name, sourceType: source.type }));
      } catch (error) {
        logError(error, `Scraper-${source.name}`);
        return [];
      }
    })
  );

  // Flatten results
  return results.flat();
}

/**
 * Clean and aggregate scraped data
 */
async function cleanAndAggregateData(data: any[]): Promise<any[]> {
  // Remove duplicates based on keywords
  const seen = new Set<string>();
  const cleaned = [];

  for (const item of data) {
    const key = item.keywords?.join('|').toLowerCase();
    if (key && !seen.has(key)) {
      seen.add(key);
      cleaned.push(item);
    }
  }

  return cleaned;
}

/**
 * Analyze trends with AI and score opportunities
 */
async function analyzeTrendsWithAI(data: any[]): Promise<TrendOpportunity[]> {
  if (data.length === 0) return [];

  try {
    const aiProvider = await AIProviderFactory.getProvider();
    if (!aiProvider.isAvailable) {
      logger.warn('AI provider unavailable for trend analysis');
      return [];
    }

    // Batch data into chunks for AI processing
    const chunks = chunkArray(data, 50);
    const opportunities: TrendOpportunity[] = [];

    for (const chunk of chunks) {
      try {
        // AI analyzes and scores each trend
        const analyzed = await aiProvider.analyzeTrends(chunk);
        
        // Convert to opportunities with scoring
        for (const trend of analyzed) {
          const opportunity = await scoreTrendOpportunity(trend);
          opportunities.push(opportunity);
        }
      } catch (error) {
        logError(error, 'AITrendAnalysis');
      }
    }

    // Sort by profitability index
    return opportunities.sort((a, b) => b.profitabilityIndex - a.profitabilityIndex);
  } catch (error) {
    logError(error, 'AnalyzeTrends');
    return [];
  }
}

/**
 * Score a trend opportunity
 */
async function scoreTrendOpportunity(trend: any): Promise<TrendOpportunity> {
  // Calculate profitability index
  const profitabilityIndex = calculateProfitabilityIndex(trend);
  
  // Calculate virality score
  const viralityScore = calculateViralityScore(trend);
  
  // Determine priority
  const priority = determinePriority(profitabilityIndex, viralityScore, trend.competitionLevel);
  
  // Calculate launch difficulty
  const launchDifficulty = calculateLaunchDifficulty(trend);

  return {
    id: `opp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: trend.keywords.slice(0, 3).join(' '),
    source: trend.marketplace || 'multi-source',
    keywords: trend.keywords,
    profitabilityIndex,
    competitionLevel: trend.competitionLevel,
    viralityScore,
    launchDifficulty,
    priority,
    estimatedRevenue: {
      min: trend.priceRange.min * 20, // Conservative estimate
      max: trend.priceRange.max * 100, // Optimistic estimate
    },
    confidence: Math.min(profitabilityIndex * 0.8 + viralityScore * 0.2, 100),
    recommendedAction: generateRecommendedAction(priority, launchDifficulty),
    aiInsights: generateAIInsights(trend, profitabilityIndex, viralityScore),
  };
}

// Helper functions
function calculateProfitabilityIndex(trend: any): number {
  const { priceRange, salesVelocity, competitionLevel } = trend;
  
  // Higher price = more profit potential
  const priceFactor = (priceRange.max / 100) * 30;
  
  // Higher velocity = more sales
  const velocityFactor = Math.min(salesVelocity / 10, 40);
  
  // Lower competition = better opportunity
  const competitionFactor = competitionLevel === 'low' ? 30 : competitionLevel === 'medium' ? 20 : 10;
  
  return Math.min(priceFactor + velocityFactor + competitionFactor, 100);
}

function calculateViralityScore(trend: any): number {
  // Based on social signals, keywords, and growth rate
  const keywordScore = trend.keywords.length * 5;
  const baseScore = 50;
  
  return Math.min(baseScore + keywordScore, 100);
}

function determinePriority(
  profitability: number,
  virality: number,
  competition: string
): 'immediate' | 'emerging' | 'high_potential' {
  if (profitability > 80 && competition === 'low') return 'immediate';
  if (virality > 70 || profitability > 60) return 'emerging';
  return 'high_potential';
}

function calculateLaunchDifficulty(trend: any): 'easy' | 'medium' | 'hard' {
  const { competitionLevel } = trend;
  
  if (competitionLevel === 'low') return 'easy';
  if (competitionLevel === 'medium') return 'medium';
  return 'hard';
}

function generateRecommendedAction(
  priority: string,
  difficulty: string
): string {
  if (priority === 'immediate') {
    return 'Create and list product immediately - high profit potential with low competition';
  } else if (priority === 'emerging') {
    return 'Monitor closely and prepare product for launch within 1-2 weeks';
  } else {
    return 'Add to watchlist and evaluate in next cycle';
  }
}

function generateAIInsights(trend: any, profitability: number, virality: number): string[] {
  const insights: string[] = [];
  
  if (profitability > 70) {
    insights.push('🎯 High profitability potential based on price and competition analysis');
  }
  
  if (virality > 60) {
    insights.push('📈 Strong viral potential across social platforms');
  }
  
  if (trend.competitionLevel === 'low') {
    insights.push('🚀 Low competition - perfect timing to enter this niche');
  }
  
  if (trend.seasonality && trend.seasonality.length > 0) {
    insights.push(`📅 Seasonal opportunity: ${trend.seasonality.join(', ')}`);
  }
  
  return insights;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Save opportunities to database
 */
async function saveTrendsToDatabase(opportunities: TrendOpportunity[]): Promise<void> {
  try {
    for (const opp of opportunities) {
      await supabase.from('trend_data').insert({
        marketplace: opp.source,
        category: opp.title,
        keywords: opp.keywords,
        sales_velocity: opp.viralityScore,
        price_min: opp.estimatedRevenue.min,
        price_max: opp.estimatedRevenue.max,
        competition_level: opp.competitionLevel,
        seasonality: [],
        target_audience: [],
        confidence_score: opp.confidence / 100,
      });
    }
  } catch (error) {
    logError(error, 'SaveTrendsToDatabase');
  }
}

/**
 * Update dashboard cache with fresh data
 */
async function updateDashboardCache(opportunities: TrendOpportunity[]): Promise<void> {
  try {
    // Cache top opportunities
    const topOpportunities = opportunities.slice(0, 20);
    await setCache('dashboard:opportunities', topOpportunities, CACHE_TTL.LONG);
    
    // Cache by priority
    const immediate = opportunities.filter(o => o.priority === 'immediate');
    const emerging = opportunities.filter(o => o.priority === 'emerging');
    
    await setCache('dashboard:immediate', immediate, CACHE_TTL.MEDIUM);
    await setCache('dashboard:emerging', emerging, CACHE_TTL.MEDIUM);
  } catch (error) {
    logError(error, 'UpdateDashboardCache');
  }
}

