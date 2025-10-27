import { existsSync } from "fs";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma } from "../utils/fakePrisma";

describe("Pipeline E2E", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("executes scrape -> analyze -> generate -> list pipeline", async () => {
    const fake = createFakePrisma();
    const axiosGet = vi.fn().mockResolvedValue({
      data: {
        results: [
          {
            listing_id: "12345",
            title: "Test Printable Planner",
            price: { amount: 2999, currency_code: "USD" },
            tags: ["planner", "digital"],
            taxonomy_path: ["Digital Downloads"],
            quantity_sold: 42,
            review_info: { average_rating: 4.8 },
            url: "https://etsy.com/listing/12345",
          },
        ],
      },
    });

    const openAiResponsesCreate = vi
      .fn()
      .mockResolvedValue({ output_text: "Great niche insights and plan." });

    vi.doMock("axios", () => ({
      default: {
        get: axiosGet,
      },
    }));

    vi.doMock("openai", () => ({
      default: class {
        responses = { create: openAiResponsesCreate };
      },
    }));

    vi.doMock("../../src/config/db", () => fake);

    const { runScrapeStage } = await import("../../src/modules/scrape");
    const { runAnalyzeStage } = await import("../../src/modules/analyze");
    const { runGenerateStage } = await import("../../src/modules/generate");
    const { runListStage } = await import("../../src/modules/list");

    await runScrapeStage({ jobId: "job-scrape" });
    await runAnalyzeStage({ jobId: "job-analyze" });
    await runGenerateStage({ jobId: "job-generate" });
    await runListStage({ jobId: "job-list" });

    expect(fake.state.scrapeResults.size).toBeGreaterThan(0);
    expect(fake.state.trends.size).toBeGreaterThan(0);
    expect(fake.state.products.size).toBeGreaterThan(0);
    expect(fake.state.listings.length).toBeGreaterThan(0);

    const scrapeFile = path.join(
      process.env.DATA_ROOT ?? "",
      "scrape",
      `${new Date().toISOString().slice(0, 10)}.ndjson`,
    );
    expect(existsSync(scrapeFile)).toBe(true);

    const generatedDir = process.env.GENERATED_ROOT ?? "";
    expect(existsSync(generatedDir)).toBe(true);
  });
});
