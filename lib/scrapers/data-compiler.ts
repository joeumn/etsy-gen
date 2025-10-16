/**
 * Data Compilation and Storage Engine
 *
 * Aggregates scraped data, analyzes trends, and stores in database
 */

import { supabase } from '../db/client';
import { logger, logError } from '../logger';
import { WebTrend } from './web-scraper';
import { SocialTrend } from './social-scraper';

export interface CompiledTrendData {
  keyword: string;
  totalSearchVolume: number;
  avgGrowthRate: number;
  avgCompetitionScore: number;
  socialEngagement: number;
  socialVirality: number;
  totalMentions: number;
  topPlatforms: string[];
  relatedKeywords: string[];
  sentimentScore: number;
  trendStrength: 'weak' | 'moderate' | 'strong' | 'viral';
  category: string;
  targetAudience: string[];
  seasonality: string[];
  timestamp: Date;
}

/**
 * Compile web and social trends into unified data
 */
export async function compileTrendData(
  webTrends: WebTrend[],
  socialTrends: SocialTrend[],
  category?: string
): Promise<CompiledTrendData[]> {
  try {
    const compiledData: CompiledTrendData[] = [];

    // Group web trends by keyword
    const webTrendMap = new Map<string, WebTrend[]>();
    webTrends.forEach(trend => {
      const key = trend.topic.toLowerCase();
      if (!webTrendMap.has(key)) {
        webTrendMap.set(key, []);
      }
      webTrendMap.get(key)!.push(trend);
    });

    // Group social trends by keyword
    const socialTrendMap = new Map<string, SocialTrend[]>();
    socialTrends.forEach(trend => {
      trend.keywords.forEach(keyword => {
        const key = keyword.toLowerCase();
        if (!socialTrendMap.has(key)) {
          socialTrendMap.set(key, []);
        }
        socialTrendMap.get(key)!.push(trend);
      });
    });

    // Combine all unique keywords
    const allKeywords = new Set([...webTrendMap.keys(), ...socialTrendMap.keys()]);

    for (const keyword of allKeywords) {
      const webKeywordTrends = webTrendMap.get(keyword) || [];
      const socialKeywordTrends = socialTrendMap.get(keyword) || [];

      // Aggregate web data
      const totalSearchVolume = webKeywordTrends.reduce((sum, t) => sum + t.searchVolume, 0);
      const avgGrowthRate = webKeywordTrends.length > 0
        ? webKeywordTrends.reduce((sum, t) => sum + t.growthRate, 0) / webKeywordTrends.length
        : 0;
      const avgCompetitionScore = webKeywordTrends.length > 0
        ? webKeywordTrends.reduce((sum, t) => sum + t.competitionScore, 0) / webKeywordTrends.length
        : 50;

      // Aggregate social data
      const socialEngagement = socialKeywordTrends.reduce((sum, t) => sum + t.engagementScore, 0);
      const socialVirality = socialKeywordTrends.reduce((sum, t) => sum + t.viralScore, 0);
      const totalMentions = socialKeywordTrends.reduce((sum, t) => sum + t.mentions, 0);
      const topPlatforms = [...new Set(socialKeywordTrends.map(t => t.platform))];

      // Calculate sentiment score (simplified)
      const sentimentScore = socialKeywordTrends.length > 0
        ? socialKeywordTrends.reduce((sum, t) => {
            const sentimentValue = t.sentiment === 'positive' ? 1 : t.sentiment === 'neutral' ? 0 : -1;
            return sum + sentimentValue;
          }, 0) / socialKeywordTrends.length
        : 0;

      // Determine trend strength
      let trendStrength: 'weak' | 'moderate' | 'strong' | 'viral' = 'weak';
      const combinedScore = (totalSearchVolume / 1000) + (socialEngagement / 10) + (socialVirality / 10);

      if (combinedScore > 100) trendStrength = 'viral';
      else if (combinedScore > 50) trendStrength = 'strong';
      else if (combinedScore > 20) trendStrength = 'moderate';

      // Collect related keywords
      const relatedKeywords = [...new Set(
        webKeywordTrends.flatMap(t => t.relatedKeywords)
      )].slice(0, 10);

      // Infer category and audience (simplified)
      const inferredCategory = category || inferCategory(keyword);
      const targetAudience = inferTargetAudience(keyword);
      const seasonality = inferSeasonality(keyword);

      compiledData.push({
        keyword,
        totalSearchVolume,
        avgGrowthRate,
        avgCompetitionScore,
        socialEngagement,
        socialVirality,
        totalMentions,
        topPlatforms,
        relatedKeywords,
        sentimentScore,
        trendStrength,
        category: inferredCategory,
        targetAudience,
        seasonality,
        timestamp: new Date(),
      });
    }

    // Sort by trend strength and volume
    compiledData.sort((a, b) => {
      const strengthOrder = { viral: 4, strong: 3, moderate: 2, weak: 1 };
      const aStrength = strengthOrder[a.trendStrength];
      const bStrength = strengthOrder[b.trendStrength];

      if (aStrength !== bStrength) return bStrength - aStrength;
      return b.totalSearchVolume - a.totalSearchVolume;
    });

    logger.info({ count: compiledData.length }, 'Compiled trend data');
    return compiledData;
  } catch (error) {
    logError(error, 'DataCompiler');
    return [];
  }
}

/**
 * Store compiled trend data in database
 */
export async function storeCompiledTrends(compiledData: CompiledTrendData[]): Promise<void> {
  try {
    const trendsToInsert = compiledData.map(data => ({
      marketplace: 'aggregated', // Since this combines multiple sources
      category: data.category,
      keywords: [data.keyword, ...data.relatedKeywords],
      sales_velocity: data.totalSearchVolume / 100, // Normalize for database
      price_min: null, // Not applicable for trends
      price_max: null,
      competition_level: data.avgCompetitionScore < 30 ? 'low' : data.avgCompetitionScore < 70 ? 'medium' : 'high',
      seasonality: data.seasonality,
      target_audience: data.targetAudience,
      confidence_score: Math.min(data.sentimentScore * 50 + 50, 100), // Convert to 0-100 scale
      created_at: data.timestamp.toISOString(),
    }));

    const { error } = await supabase
      .from('trend_data')
      .insert(trendsToInsert);

    if (error) {
      logError(error, 'StoreCompiledTrends');
      throw error;
    }

    logger.info({ count: trendsToInsert.length }, 'Stored compiled trends in database');
  } catch (error) {
    logError(error, 'StoreCompiledTrends');
    throw error;
  }
}

/**
 * Get aggregated trend analytics
 */
export async function getTrendAnalytics(category?: string, limit: number = 50): Promise<CompiledTrendData[]> {
  try {
    let query = supabase
      .from('trend_data')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      logError(error, 'GetTrendAnalytics');
      return [];
    }

    // Convert database format back to CompiledTrendData
    return data.map(row => ({
      keyword: row.keywords?.[0] || '',
      totalSearchVolume: (row.sales_velocity || 0) * 100,
      avgGrowthRate: 0, // Not stored in current schema
      avgCompetitionScore: row.competition_level === 'low' ? 25 : row.competition_level === 'medium' ? 50 : 75,
      socialEngagement: 0, // Not stored
      socialVirality: 0,
      totalMentions: 0,
      topPlatforms: [],
      relatedKeywords: row.keywords?.slice(1) || [],
      sentimentScore: ((row.confidence_score || 50) - 50) / 50, // Convert back
      trendStrength: 'moderate' as const, // Default
      category: row.category || '',
      targetAudience: row.target_audience || [],
      seasonality: row.seasonality || [],
      timestamp: new Date(row.created_at),
    }));
  } catch (error) {
    logError(error, 'GetTrendAnalytics');
    return [];
  }
}

/**
 * Helper functions for inference
 */
function inferCategory(keyword: string): string {
  const categoryMap: Record<string, string> = {
    'planner': 'Productivity',
    'template': 'Business',
    'wedding': 'Events',
    'birthday': 'Celebration',
    'christmas': 'Holiday',
    'halloween': 'Holiday',
    'printable': 'Education',
    'worksheet': 'Education',
    'calendar': 'Organization',
    'journal': 'Personal',
    'recipe': 'Food',
    'fitness': 'Health',
    'workout': 'Health',
  };

  for (const [key, category] of Object.entries(categoryMap)) {
    if (keyword.toLowerCase().includes(key)) {
      return category;
    }
  }

  return 'General';
}

function inferTargetAudience(keyword: string): string[] {
  const audiences: string[] = [];

  if (keyword.includes('business') || keyword.includes('professional')) {
    audiences.push('Business Owners');
  }
  if (keyword.includes('student') || keyword.includes('school')) {
    audiences.push('Students');
  }
  if (keyword.includes('parent') || keyword.includes('kids')) {
    audiences.push('Parents');
  }
  if (keyword.includes('women') || keyword.includes('girl')) {
    audiences.push('Women');
  }
  if (keyword.includes('men') || keyword.includes('guy')) {
    audiences.push('Men');
  }
  if (keyword.includes('creative') || keyword.includes('artist')) {
    audiences.push('Creatives');
  }

  return audiences.length > 0 ? audiences : ['General Audience'];
}

function inferSeasonality(keyword: string): string[] {
  const seasonal: string[] = [];

  if (keyword.includes('christmas') || keyword.includes('holiday')) {
    seasonal.push('Winter');
  }
  if (keyword.includes('summer') || keyword.includes('beach')) {
    seasonal.push('Summer');
  }
  if (keyword.includes('spring') || keyword.includes('flower')) {
    seasonal.push('Spring');
  }
  if (keyword.includes('fall') || keyword.includes('autumn')) {
    seasonal.push('Fall');
  }
  if (keyword.includes('birthday') || keyword.includes('party')) {
    seasonal.push('Year-round');
  }

  return seasonal.length > 0 ? seasonal : ['Year-round'];
}
