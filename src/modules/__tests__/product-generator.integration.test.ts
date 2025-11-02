import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma } from "../../../test/utils/fakePrisma";

const trendFixtures = [
  {
    keyword: "Digital Planner Templates",
    searchVolume: 120,
    competition: "medium",
    avgPrice: 19.99,
  },
  {
    keyword: "Printable Wall Art",
    searchVolume: 80,
    competition: "low",
    avgPrice: 14.0,
  },
];

describe("ProductGenerator integration", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it("runs the full pipeline and records listing jobs", async () => {
    const fake = createFakePrisma();

    vi.doMock("@/config/db", () => fake);

    const actualFactory = await vi.importActual<any>("@/lib/ai/aiFactory");
    const generateAIContent = vi
      .fn()
      .mockResolvedValue(
        JSON.stringify({
          title: "Ultimate Planner Bundle",
          description: "A comprehensive digital planner kit.",
          tags: ["planner", "digital", "productivity"],
          price: 17.99,
          category: "Digital Templates",
        }),
      );

    vi.doMock("@/lib/ai/aiFactory", () => ({
      ...actualFactory,
      generateAIContent,
    }));

    const timers = vi
      .spyOn(global, "setTimeout")
      .mockImplementation(((callback: (...args: any[]) => void) => {
        callback();
        return 0 as unknown as NodeJS.Timeout;
      }) as any);

    const { productGenerator } = await import("@/lib/automation/product-generator");

    const scanEtsySpy = vi
      .spyOn(productGenerator as any, "scanEtsyTrends")
      .mockResolvedValue([trendFixtures[0]]);
    const scanGoogleSpy = vi
      .spyOn(productGenerator as any, "scanGoogleTrends")
      .mockResolvedValue([trendFixtures[1]]);
    const scanAmazonSpy = vi
      .spyOn(productGenerator as any, "scanAmazonTrends")
      .mockResolvedValue([]);

    const listEtsySpy = vi
      .spyOn(productGenerator as any, "listOnEtsy")
      .mockResolvedValue({ listingId: "etsy-listing-1", url: "https://etsy.com/listing/1" });
    const listShopifySpy = vi
      .spyOn(productGenerator as any, "listOnShopify")
      .mockResolvedValue({ listingId: "shopify-listing-1", url: "https://shopify.com/listing/1" });

    const result = await productGenerator.runFullPipeline();

    expect(result).toEqual({ success: true, productsCreated: 2 });
    expect(generateAIContent).toHaveBeenCalledTimes(2);

    expect(fake.state.trends.size).toBeGreaterThan(0);
    expect(fake.state.products.size).toBeGreaterThan(0);
    expect(fake.state.listings.length).toBeGreaterThan(0);
    expect(fake.state.jobs.length).toBeGreaterThan(0);

    const successJobs = fake.state.jobs.filter((job) => job.status === "SUCCESS");
    expect(successJobs.length).toBe(2 * 2);
    successJobs.forEach((job) => {
      expect(job.stage).toBe("LIST");
      expect(job.metadata?.productId).toBeDefined();
      expect(job.metadata?.marketplace).toMatch(/etsy|shopify/);
    });

    expect(scanEtsySpy).toHaveBeenCalled();
    expect(scanGoogleSpy).toHaveBeenCalled();
    expect(scanAmazonSpy).toHaveBeenCalled();
    expect(listEtsySpy).toHaveBeenCalled();
    expect(listShopifySpy).toHaveBeenCalled();

    timers.mockRestore();
  });
});

