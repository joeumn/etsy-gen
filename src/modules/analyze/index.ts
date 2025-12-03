import { subDays } from "date-fns";
import { db } from "../../config/db";
import { logger } from "../../config/logger";
import { generateText } from "../../lib/ai";
import { resolveDataPath, writeJsonFile, ensureDir } from "../../lib/storage";

interface AnalyzeContext {
  jobId: string;
  metadata?: Record<string, unknown>;
}

interface TrendAggregate {
  niche: string;
  volume: number;
  avgPrice: number;
  avgRating: number | null;
  totalSales: number;
}

const toJson = (value: unknown): any =>
  value as any;

/**
 * Enhanced scoring algorithm with multiple factors
 * 
 * Factors:
 * - Price optimization (25%): Higher prices = better margins
 * - Sales velocity (30%): Higher sales = proven demand  
 * - Quality/Rating (20%): Customer satisfaction indicator
 * - Competition level (15%): Lower competition = easier to enter
 * - Market size (10%): Larger markets = more opportunity
 */
const computeScore = (aggregate: TrendAggregate) => {
  // Price Factor: Optimal range is $20-$80
  const priceScore = (() => {
    if (aggregate.avgPrice < 10) return 0.3; // Too cheap
    if (aggregate.avgPrice < 20) return 0.6;
    if (aggregate.avgPrice < 50) return 1.0; // Optimal range
    if (aggregate.avgPrice < 100) return 0.8;
    return 0.5; // Too expensive for digital products
  })();
  
  // Sales Factor: Logarithmic scale for sales velocity
  const salesScore = Math.min(1, Math.log10(aggregate.totalSales + 1) / 3);
  
  // Rating Factor: Quality indicator
  const ratingScore = aggregate.avgRating ? 
    Math.pow(aggregate.avgRating / 5, 1.5) : 0.5;
  
  // Competition Factor: Sweet spot is 20-60 listings
  const competitionScore = (() => {
    if (aggregate.volume < 10) return 0.3; // Too niche
    if (aggregate.volume < 30) return 1.0; // Optimal
    if (aggregate.volume < 80) return 0.7;
    return 0.3; // Too competitive
  })();
  
  // Market Size Factor: Larger volume = more opportunity
  const marketSizeScore = Math.min(1, aggregate.volume / 60);
  
  // Calculate weighted score
  const weightedScore = 
    0.25 * priceScore +
    0.30 * salesScore +
    0.20 * ratingScore +
    0.15 * competitionScore +
    0.10 * marketSizeScore;
  
  return Number(weightedScore.toFixed(3));
};

/**
 * Calculate confidence level for the trend score
 */
const calculateConfidence = (aggregate: TrendAggregate): number => {
  let confidence = 0;
  
  // More data points = higher confidence
  if (aggregate.volume >= 30) confidence += 0.4;
  else if (aggregate.volume >= 15) confidence += 0.25;
  else confidence += 0.1;
  
  // Sales data presence increases confidence
  if (aggregate.totalSales > 100) confidence += 0.3;
  else if (aggregate.totalSales > 10) confidence += 0.2;
  else confidence += 0.1;
  
  // Rating data presence increases confidence
  if (aggregate.avgRating !== null) confidence += 0.2;
  else confidence += 0.05;
  
  // Price consistency (using avg as proxy)
  if (aggregate.avgPrice > 0) confidence += 0.1;
  
  return Number(Math.min(1, confidence).toFixed(2));
};

/**
 * Assess risk level for entering this niche
 */
const assessRiskLevel = (aggregate: TrendAggregate): 'low' | 'medium' | 'high' => {
  const score = computeScore(aggregate);
  const confidence = calculateConfidence(aggregate);
  
  if (score > 0.7 && confidence > 0.7) return 'low';
  if (score > 0.5 && confidence > 0.5) return 'medium';
  return 'high';
};

const toTrendRecord = async (jobId: string, aggregate: TrendAggregate) => {
  const score = computeScore(aggregate);
  const confidence = calculateConfidence(aggregate);
  const riskLevel = assessRiskLevel(aggregate);
  
  const summaryPrompt = `
Niche: ${aggregate.niche}
Listings analyzed: ${aggregate.volume}
Average price: $${aggregate.avgPrice.toFixed(2)}
Average rating: ${aggregate.avgRating ?? "unknown"}
Total recent sales: ${aggregate.totalSales}
Opportunity score: ${(score * 100).toFixed(1)}%
Confidence: ${(confidence * 100).toFixed(1)}%
Risk level: ${riskLevel}

Write a compelling 2-3 sentence summary explaining why this niche is profitable now and what specific digital products would succeed.
`;
  const summary = await generateText(summaryPrompt);
  
  // Generate AI-powered asset recommendations
  const recommendedAssets = [
    `Create a premium digital bundle for ${aggregate.niche.toLowerCase()} with customizable templates.`,
    `Design matching printable assets targeting ${aggregate.niche.toLowerCase()} buyers.`,
    `Develop an automated workflow template for ${aggregate.niche.toLowerCase()} professionals.`,
  ];

  return db.trend.create({
    data: {
      id: `${aggregate.niche}-${jobId}`,
      niche: aggregate.niche,
      score,
      tam_approx: aggregate.volume * aggregate.avgPrice,
      momentum: Number((score * confidence).toFixed(3)),
      competition: Number((aggregate.volume / 100).toFixed(3)),
      summary: summary.text,
      recommended_assets: toJson(recommendedAssets),
      job_id: jobId,
      metadata: toJson({
        volume: aggregate.volume,
        avgPrice: aggregate.avgPrice,
        avgRating: aggregate.avgRating,
        totalSales: aggregate.totalSales,
        confidence,
        riskLevel,
        priceOptimal: aggregate.avgPrice >= 20 && aggregate.avgPrice <= 80,
        competitionLevel: aggregate.volume < 30 ? 'low' : aggregate.volume < 80 ? 'medium' : 'high',
        analysisDate: new Date().toISOString(),
      }),
    },
  });
};

export const runAnalyzeStage = async ({ jobId }: AnalyzeContext) => {
  const since = subDays(new Date(), 7);

  const { supabase } = await import("../../config/db");
  const { data: scrapeResults, error } = await supabase
    .from('scrape_results')
    .select('*')
    .gte('collected_at', since.toISOString());

  if (error) throw error;
  if (!scrapeResults) {
    logger.warn("No scrape results found for analysis window");
    return {
      summary: {
        analyzed: 0,
        trends: 0,
      },
    };
  }

  if (!scrapeResults.length) {
    logger.warn("No scrape results found for analysis window");
    return {
      summary: {
        analyzed: 0,
        trends: 0,
      },
    };
  }

  const aggregates = new Map<string, TrendAggregate>();

  for (const result of scrapeResults) {
    const key = result.category ?? result.tags[0] ?? "Uncategorized";
    const existing = aggregates.get(key);
    if (existing) {
      existing.volume += 1;
      existing.avgPrice =
        (existing.avgPrice * (existing.volume - 1) + Number(result.price ?? 0)) /
        existing.volume;
      existing.totalSales += result.sales ?? 0;
      existing.avgRating = existing.avgRating
        ? Number(
            (
              (existing.avgRating * (existing.volume - 1) +
                (result.rating ?? existing.avgRating)) /
              existing.volume
            ).toFixed(2),
          )
        : result.rating ?? null;
    } else {
      aggregates.set(key, {
        niche: key,
        volume: 1,
        avgPrice: Number(result.price ?? 0),
        avgRating: result.rating ?? null,
        totalSales: result.sales ?? 0,
      });
    }
  }

  const trendRecords: any[] = [];

  for (const aggregate of aggregates.values()) {
    const record = await toTrendRecord(jobId, aggregate);
    trendRecords.push(
      toJson({
        niche: record.niche,
        score: record.score,
        momentum: record.momentum,
        competition: record.competition,
      }),
    );
  }

  const filePath = resolveDataPath(
    "analysis",
    `${new Date().toISOString().slice(0, 13)}00.json`,
  );
  await ensureDir(resolveDataPath("analysis"));
  await writeJsonFile(filePath, {
    generatedAt: new Date().toISOString(),
    trends: trendRecords,
  });

  logger.info(
    { analyzed: scrapeResults.length, trends: trendRecords.length },
    "Analyze stage completed",
  );

  return {
    summary: {
      analyzed: scrapeResults.length,
      trends: trendRecords.length,
    },
  };
};
