import { Prisma } from "@prisma/client";
import { subDays } from "date-fns";
import { prisma } from "../../config/db";
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

const toJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

const computeScore = (aggregate: TrendAggregate) => {
  const priceFactor = Math.min(1, aggregate.avgPrice / 50);
  const salesFactor = Math.min(1, aggregate.totalSales / 500);
  const ratingFactor = aggregate.avgRating ? aggregate.avgRating / 5 : 0.5;
  const volumePenalty = Math.max(0, 1 - aggregate.volume / 100);
  return Number(
    (0.35 * priceFactor +
      0.4 * salesFactor +
      0.2 * ratingFactor +
      0.05 * volumePenalty).toFixed(2),
  );
};

const toTrendRecord = async (jobId: string, aggregate: TrendAggregate) => {
  const summaryPrompt = `
Niche: ${aggregate.niche}
Listings analyzed: ${aggregate.volume}
Average price: $${aggregate.avgPrice.toFixed(2)}
Average rating: ${aggregate.avgRating ?? "unknown"}
Total recent sales: ${aggregate.totalSales}

Write a 2 sentence summary explaining why this niche matters now and what kind of digital assets could win.
`;
  const summary = await generateText(summaryPrompt);
  const recommendedAssets = [
    `Create a digital bundle for ${aggregate.niche.toLowerCase()} with customizable templates.`,
    `Design matching printable assets targeting ${aggregate.niche.toLowerCase()} buyers.`,
  ];

  const score = computeScore(aggregate);

  return prisma.trend.upsert({
    where: { id: `${aggregate.niche}-${jobId}` },
    update: {
      score,
      tamApprox: aggregate.volume * aggregate.avgPrice,
      momentum: Number((score * 0.8).toFixed(2)),
      competition: Number((aggregate.volume / 120).toFixed(2)),
      summary: summary.text,
      recommendedAssets: toJson(recommendedAssets),
      jobId,
      metadata: toJson({
        volume: aggregate.volume,
        avgPrice: aggregate.avgPrice,
        avgRating: aggregate.avgRating,
        totalSales: aggregate.totalSales,
      }),
    },
    create: {
      id: `${aggregate.niche}-${jobId}`,
      niche: aggregate.niche,
      score,
      tamApprox: aggregate.volume * aggregate.avgPrice,
      momentum: Number((score * 0.8).toFixed(2)),
      competition: Number((aggregate.volume / 120).toFixed(2)),
      summary: summary.text,
      recommendedAssets: toJson(recommendedAssets),
      jobId,
      metadata: toJson({
        volume: aggregate.volume,
        avgPrice: aggregate.avgPrice,
        avgRating: aggregate.avgRating,
        totalSales: aggregate.totalSales,
      }),
    },
  });
};

export const runAnalyzeStage = async ({ jobId }: AnalyzeContext) => {
  const since = subDays(new Date(), 7);

  const scrapeResults = await prisma.scrapeResult.findMany({
    where: {
      collectedAt: { gte: since },
    },
  });

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

  const trendRecords: Prisma.InputJsonValue[] = [];

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
