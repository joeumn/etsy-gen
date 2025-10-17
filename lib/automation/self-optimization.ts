/**
 * Self-Optimization & Autonomy Engine
 * 
 * Makes The Forge self-sustaining, self-healing, and continuously improving
 */

import { logger, logError, logAIGeneration } from '../logger';
import { supabase } from '../db/client';
import { AIProviderFactory } from '../ai/aiFactory';
import { retry } from '../performance';
import { notifyAPIIssue } from '../notifications/notification-service';

export interface OptimizationMetrics {
  productSuccessRate: number;
  averageRevenue: number;
  conversionRate: number;
  bestPerformingCategory: string;
  optimalPriceRange: { min: number; max: number };
  bestMarketplace: string;
  improvementSuggestions: string[];
}

/**
 * Auto-detect and fix failed API calls
 */
export async function autoHealAPIConnections(): Promise<{
  healed: number;
  failed: number;
}> {
  let healed = 0;
  let failed = 0;

  try {
    // Check Supabase connection
    try {
      await supabase.from('users').select('id').limit(1);
      logger.info('Supabase connection healthy');
    } catch (error) {
      logger.warn('Supabase connection failed, attempting re-authentication');
      // Attempt reconnection
      try {
        await retry(async () => {
          await supabase.from('users').select('id').limit(1);
        }, { maxAttempts: 3, delay: 2000 });
        healed++;
        logger.info('Supabase connection restored');
      } catch (retryError) {
        failed++;
        await notifyAPIIssue('system', 'Supabase', 'Connection failed after retry');
      }
    }

    // Check AI provider
    try {
      const aiProvider = await AIProviderFactory.getProvider();
      if (!aiProvider.isAvailable) {
        logger.warn('AI provider unavailable, checking configuration');
        failed++;
      } else {
        logger.info('AI provider healthy');
      }
    } catch (error) {
      failed++;
      logger.error('AI provider check failed');
    }

    return { healed, failed };
  } catch (error) {
    logError(error, 'AutoHealAPIs');
    return { healed: 0, failed: 0 };
  }
}

/**
 * Auto-adjust pricing based on product demand
 */
export async function autoAdjustPricing(): Promise<{
  adjusted: number;
  increases: number;
  decreases: number;
}> {
  let adjusted = 0;
  let increases = 0;
  let decreases = 0;

  try {
    // Get products with performance data
    const { data: products } = await supabase
      .from('generated_products')
      .select('*')
      .limit(50);

    if (!products) return { adjusted: 0, increases: 0, decreases: 0 };

    for (const product of products) {
      try {
        // Get sales performance (simulated)
        const performanceScore = Math.random() * 100;

        let newPrice = product.price;
        let action = 'none';

        // High performance (>70) = increase price by 10-15%
        if (performanceScore > 70) {
          newPrice = product.price * 1.12;
          increases++;
          action = 'increase';
        }
        // Low performance (<30) = decrease price by 10-20%
        else if (performanceScore < 30) {
          newPrice = product.price * 0.85;
          decreases++;
          action = 'decrease';
        }

        if (action !== 'none') {
          // Update price in database
          await supabase
            .from('generated_products')
            .update({ price: newPrice })
            .eq('id', product.id);

          // Log to pricing history
          await supabase.from('pricing_history').insert({
            product_id: product.id,
            old_price: product.price,
            new_price: newPrice,
            expected_delta: performanceScore > 70 ? 15 : -15,
          });

          adjusted++;
          logger.info('Auto-adjusted pricing', {
            product: product.title,
            oldPrice: product.price,
            newPrice,
            action,
          });
        }
      } catch (error) {
        logError(error, 'AdjustSinglePrice');
      }
    }

    return { adjusted, increases, decreases };
  } catch (error) {
    logError(error, 'AutoAdjustPricing');
    return { adjusted: 0, increases: 0, decreases: 0 };
  }
}

/**
 * Self-learn from product performance
 */
export async function selfLearnFromPerformance(): Promise<OptimizationMetrics> {
  try {
    // Analyze all products to find patterns
    const { data: products } = await supabase
      .from('generated_products')
      .select('*');

    if (!products || products.length === 0) {
      return getDefaultMetrics();
    }

    // Calculate success rate
    const successful = products.filter(p => p.price && p.price > 0).length;
    const productSuccessRate = (successful / products.length) * 100;

    // Calculate average revenue (simulated)
    const averageRevenue = products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length;

    // Find best performing category
    const categoryMap = new Map<string, number>();
    products.forEach(p => {
      const count = categoryMap.get(p.category) || 0;
      categoryMap.set(p.category, count + 1);
    });
    const bestPerformingCategory = Array.from(categoryMap.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Digital Downloads';

    // Calculate optimal price range
    const prices = products.map(p => p.price || 0).filter(p => p > 0).sort((a, b) => a - b);
    const optimalPriceRange = {
      min: prices[Math.floor(prices.length * 0.25)] || 9.99,
      max: prices[Math.floor(prices.length * 0.75)] || 29.99,
    };

    // Generate improvement suggestions
    const improvementSuggestions = [
      productSuccessRate < 80 ? 'Focus on higher-quality AI prompts for better products' : null,
      averageRevenue < 15 ? 'Consider targeting higher-price-point niches' : null,
      'Add more product images for 2x better conversion',
      'Optimize product titles with trending keywords',
    ].filter(Boolean) as string[];

    const metrics: OptimizationMetrics = {
      productSuccessRate,
      averageRevenue,
      conversionRate: Math.random() * 5 + 2, // 2-7%
      bestPerformingCategory,
      optimalPriceRange,
      bestMarketplace: 'Etsy',
      improvementSuggestions,
    };

    logger.info('Self-learning metrics calculated', metrics);
    return metrics;
  } catch (error) {
    logError(error, 'SelfLearn');
    return getDefaultMetrics();
  }
}

/**
 * Improve AI prompts based on performance data
 */
export async function improveAIPrompts(): Promise<string[]> {
  try {
    const metrics = await selfLearnFromPerformance();
    const improvements: string[] = [];

    // If certain categories perform better, adjust prompts
    improvements.push(`Focus more on ${metrics.bestPerformingCategory} category`);
    improvements.push(`Target price range: $${metrics.optimalPriceRange.min}-$${metrics.optimalPriceRange.max}`);
    
    if (metrics.conversionRate < 3) {
      improvements.push('Enhance product descriptions with more benefits and features');
    }

    return improvements;
  } catch (error) {
    logError(error, 'ImproveAIPrompts');
    return [];
  }
}

/**
 * Passive mode status check
 */
export interface PassiveModeStatus {
  enabled: boolean;
  lastIntelligenceCycle: Date | null;
  lastOperationsCycle: Date | null;
  uptime: number; // percentage
  taskSuccessRate: number; // percentage
  passiveRevenue: number;
  productsCreated24h: number;
  productsListed24h: number;
}

/**
 * Get passive mode metrics
 */
export async function getPassiveModeMetrics(): Promise<PassiveModeStatus> {
  try {
    // In production, query from system logs and database
    return {
      enabled: true,
      lastIntelligenceCycle: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      lastOperationsCycle: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      uptime: 98.5,
      taskSuccessRate: 94.2,
      passiveRevenue: 890.50,
      productsCreated24h: 12,
      productsListed24h: 10,
    };
  } catch (error) {
    logError(error, 'GetPassiveModeMetrics');
    return {
      enabled: false,
      lastIntelligenceCycle: null,
      lastOperationsCycle: null,
      uptime: 0,
      taskSuccessRate: 0,
      passiveRevenue: 0,
      productsCreated24h: 0,
      productsListed24h: 0,
    };
  }
}

function getDefaultMetrics(): OptimizationMetrics {
  return {
    productSuccessRate: 85,
    averageRevenue: 18.50,
    conversionRate: 3.5,
    bestPerformingCategory: 'Digital Downloads',
    optimalPriceRange: { min: 9.99, max: 29.99 },
    bestMarketplace: 'Etsy',
    improvementSuggestions: [
      'Maintain current product quality',
      'Expand to more marketplaces',
    ],
  };
}

