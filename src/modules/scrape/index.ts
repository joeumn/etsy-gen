import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { logger } from "../../config/logger";
import { ensureDir, appendNdjson, resolveDataPath } from "../../lib/storage";
import { SettingsService } from "../../services/settingsService";
import { fetchAmazonListings } from "./amazon";
import { fetchEtsyListings } from "./etsy";
import { fetchShopifyListings } from "./shopify";
import type { ScrapeContext, ScrapeSummary } from "./types";

const marketplaceFetchers = {
  etsy: fetchEtsyListings,
  shopify: fetchShopifyListings,
  amazon: fetchAmazonListings,
} as const;

type MarketplaceKey = keyof typeof marketplaceFetchers;

const defaultConfig: { marketplaces: MarketplaceKey[] } = {
  marketplaces: ["etsy"],
};

const toJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

export const runScrapeStage = async ({ jobId }: ScrapeContext) => {
  const config =
    (await SettingsService.get<{
      marketplaces?: MarketplaceKey[];
    }>("scrape.config")) ?? defaultConfig;

  const marketplaces = config.marketplaces?.length
    ? config.marketplaces
    : defaultConfig.marketplaces;

  const results: Prisma.InputJsonValue[] = [];
  const summary: ScrapeSummary = {
    count: 0,
    marketplaces: {},
  };

  for (const marketplace of marketplaces) {
    const fetcher = marketplaceFetchers[marketplace];
    if (!fetcher) {
      logger.warn({ marketplace }, "No fetcher for marketplace");
      continue;
    }

    const listings = await fetcher();
    summary.marketplaces[marketplace] = listings.length;
    summary.count += listings.length;

    for (const listing of listings) {
      const collectedAt = listing.collectedAt ?? new Date();
      await prisma.scrapeResult.upsert({
        where: {
          marketplace_productId_collectedAt: {
            marketplace: listing.marketplace,
            productId: listing.productId,
            collectedAt,
          },
        },
        create: {
          jobId,
          marketplace: listing.marketplace,
          productId: listing.productId,
          title: listing.title,
          price: listing.price,
          currency: listing.currency ?? "USD",
          tags: listing.tags,
          category: listing.category ?? undefined,
          sales: listing.sales ?? undefined,
          rating: listing.rating ?? undefined,
          collectedAt,
          metadata: toJson({
            raw: listing.raw,
            url: listing.url,
          }),
        },
        update: {
          title: listing.title,
          price: listing.price,
          currency: listing.currency ?? "USD",
          tags: listing.tags,
          category: listing.category ?? undefined,
          sales: listing.sales ?? undefined,
          rating: listing.rating ?? undefined,
          metadata: toJson({
            raw: listing.raw,
            url: listing.url,
          }),
        },
      });

      results.push(
        toJson({
          ...listing,
          jobId,
          collectedAt: collectedAt.toISOString(),
        }),
      );
    }
  }

  if (results.length > 0) {
    const filePath = resolveDataPath(
      "scrape",
      `${new Date().toISOString().slice(0, 10)}.ndjson`,
    );
    await ensureDir(resolveDataPath("scrape"));
    await appendNdjson(filePath, results);
  }

  logger.info(summary, "Scrape stage completed");

  return {
    summary,
  };
};
