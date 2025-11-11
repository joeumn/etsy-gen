import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma } from "../../../test/utils/fakePrisma";

const shouldRun = (process.env.ENABLE_MARKETPLACE_INTEGRATION_TESTS ?? "true") === "true";
const describeIf = shouldRun ? describe : describe.skip;

describeIf("ProductGenerator marketplace integrations", () => {
  const baseEnv = {
    NODE_ENV: "test" as const,
    PORT: 3001,
    DATABASE_URL: undefined,
    REDIS_URL: undefined,
    APP_ENCRYPTION_KEY: undefined,
    OPENAI_API_KEY: undefined,
    ETSY_API_KEY: "etsy-key",
    ETSY_ACCESS_TOKEN: "etsy-access",
    ETSY_SHOP_ID: "12345",
    STABILITY_API_KEY: undefined,
    SHOPIFY_API_KEY: undefined,
    SHOPIFY_ACCESS_TOKEN: "shopify-token",
    SHOPIFY_SHOP_DOMAIN: "foundersforge.myshopify.com",
    AMAZON_ASSOCIATE_TAG: "forge-tag",
    AMAZON_ACCESS_KEY: "amazon-key",
    AMAZON_SECRET_KEY: undefined,
    ADMIN_API_TOKEN: undefined,
    LOGGER_LEVEL: "silent" as const,
    JOB_CONCURRENCY: undefined,
    CRON_ENABLED: true,
    GOOGLE_TRENDS_API_KEY: "google-key",
  };

  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("scans marketplace APIs and persists scrape results", async () => {
    const fake = createFakePrisma();
    vi.doMock("@/config/db", () => fake);
    vi.doMock("@/config/env", () => ({ env: baseEnv }));

    const getSpy = vi.spyOn(axios, "get");
    getSpy.mockResolvedValueOnce({
      data: {
        results: [
          {
            listing_id: 54321,
            title: "Digital Vision Board Kit",
            price: { amount: 1499, divisor: 100, currency_code: "USD" },
            total_view_count: 910,
            num_favorers: 220,
            tags: ["digital", "vision"],
            category_path: ["Digital", "Vision"],
            url: "https://etsy.com/listing/54321/digital-vision-board",
          },
        ],
      },
    });
    getSpy.mockResolvedValueOnce({
      data: `)]}',\n${JSON.stringify({
        storySummaries: {
          trendingStories: [
            {
              id: "story-42",
              title: "AI Printable Checklists",
              formattedTraffic: "5,500+",
              entityNames: ["AI Printable Checklists"],
              shareUrl: "https://trends.google.com/story/42",
              articles: [{ title: "The rise of AI printables" }],
            },
          ],
        },
      })}`,
    });
    getSpy.mockResolvedValueOnce({
      data: {
        bestsellers: [
          {
            asin: "B0AIKIT",
            title: "AI Craft Kit",
            price: { value: 27.5, currency: "USD" },
            rank: 12,
            reviews: { total_reviews: 640, rating: 4.9 },
            categories: [{ name: "Arts" }, { name: "Craft Kits" }],
            link: "https://amazon.com/dp/B0AIKIT",
          },
        ],
      },
    });

    const { productGenerator } = await import("@/lib/automation/product-generator");
    const trends = await productGenerator.scanMarketplaceTrends();

    expect(trends).toHaveLength(3);
    expect(getSpy).toHaveBeenNthCalledWith(
      1,
      "https://openapi.etsy.com/v3/application/listings/active",
      expect.objectContaining({
        headers: expect.objectContaining({ "x-api-key": "etsy-key" }),
        params: expect.objectContaining({ limit: 20 }),
      }),
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      2,
      "https://trends.googleapis.com/trends/api/realtimetrends",
      expect.objectContaining({
        params: expect.objectContaining({ key: "google-key" }),
      }),
    );
    expect(getSpy).toHaveBeenNthCalledWith(
      3,
      "https://api.rainforestapi.com/request",
      expect.objectContaining({
        params: expect.objectContaining({ api_key: "amazon-key" }),
      }),
    );

    expect(fake.state.scrapeResults.size).toBe(3);
    const persisted = Array.from(fake.state.scrapeResults.values());
    expect(persisted.map((record) => record.marketplace).sort()).toEqual([
      "amazon",
      "etsy",
      "google_trends",
    ]);

    getSpy.mockRestore();
  });

  it("lists products on Etsy and Shopify and records remote ids", async () => {
    const fake = createFakePrisma();
    vi.doMock("@/config/db", () => fake);
    vi.doMock("@/config/env", () => ({ env: baseEnv }));

    const postSpy = vi.spyOn(axios, "post");
    postSpy.mockResolvedValueOnce({
      data: { listing_id: 99887, url: "https://etsy.com/listing/99887" },
    });
    postSpy.mockResolvedValueOnce({
      data: { product: { id: 77665, handle: "ai-digital-kit" } },
    });

    const { productGenerator } = await import("@/lib/automation/product-generator");
    const product = await fake.prisma.product.create({
      data: {
        id: "prod-1",
        title: "AI Digital Kit",
        description: "A comprehensive AI powered digital kit.",
        tags: ["ai", "digital"],
        attributes: { category: "Digital" },
        assetPaths: [],
        metadata: {
          pricing: { suggested: 21.5 },
        },
      },
    });

    const etsyResult = await productGenerator.listProductOnMarketplace(product.id, "etsy");
    expect(etsyResult).toEqual({
      listingId: "99887",
      url: "https://etsy.com/listing/99887",
    });

    const shopifyResult = await productGenerator.listProductOnMarketplace(product.id, "shopify");
    expect(shopifyResult).toEqual({
      listingId: "77665",
      url: "https://foundersforge.myshopify.com/products/ai-digital-kit",
    });

    const updatedProduct = fake.state.products.get(product.id)!;
    const listingsMetadata = (updatedProduct.metadata as any)?.listings;
    expect(listingsMetadata?.etsy?.listingId).toBe("99887");
    expect(listingsMetadata?.shopify?.listingId).toBe("77665");

    expect(fake.state.listings).toHaveLength(2);
    const [etsyListing, shopifyListing] = fake.state.listings;
    expect(etsyListing.remoteId).toBe("99887");
    expect(shopifyListing.remoteId).toBe("77665");

    const successJobs = fake.state.jobs.filter((job) => job.status === "SUCCESS");
    expect(successJobs).toHaveLength(2);
    successJobs.forEach((job) => {
      expect(job.stage).toBe("LIST");
      expect(job.metadata?.listingId).toBeDefined();
    });

    expect(postSpy).toHaveBeenNthCalledWith(
      1,
      "https://openapi.etsy.com/v3/application/shops/12345/listings",
      expect.objectContaining({ title: "AI Digital Kit" }),
      expect.objectContaining({ headers: expect.objectContaining({ "x-api-key": "etsy-key" }) }),
    );
    expect(postSpy).toHaveBeenNthCalledWith(
      2,
      "https://foundersforge.myshopify.com/admin/api/2024-01/products.json",
      expect.objectContaining({ product: expect.objectContaining({ title: "AI Digital Kit" }) }),
      expect.objectContaining({ headers: expect.objectContaining({ "X-Shopify-Access-Token": "shopify-token" }) }),
    );

    postSpy.mockRestore();
  });
});
