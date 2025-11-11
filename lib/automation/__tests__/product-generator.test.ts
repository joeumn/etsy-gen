import { beforeEach, describe, expect, it, vi } from "vitest";
import type { GeneratedProduct } from "@/lib/ai/IAIProvider";
import { createFakePrisma } from "../../../test/utils/fakePrisma";

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

describe("generateAIContent", () => {
  it("normalizes provider JSON output for product generation", async () => {
    const mockProduct: GeneratedProduct = {
      title: "Ultimate Test Product",
      description: "A compelling description for testing.",
      tags: ["test", "product", "digital"],
      price: 19.99,
      category: "Digital Templates",
      seoKeywords: ["test product"],
      imagePrompt: "An illustrative mockup",
      content: "PDF content placeholder",
      specifications: { pages: 24 },
    };

    const factoryModule = await import("@/lib/ai/aiFactory");

    const providerMock = {
      name: "MockProvider",
      isAvailable: true,
      generateProduct: vi.fn().mockResolvedValue(mockProduct),
      analyzeTrends: vi.fn(),
      generateImage: vi.fn(),
      generateListingContent: vi.fn(),
    };

    const getProviderSpy = vi
      .spyOn(factoryModule.AIProviderFactory, "getProvider")
      .mockResolvedValue(providerMock as any);

    const result = await factoryModule.generateAIContent({
      provider: "gemini",
      type: "product_generation",
      prompt: "Create a listing for Test Keyword",
      trend: {
        keyword: "Test Keyword",
        searchVolume: 120,
        competition: "medium",
        avgPrice: 18.5,
      },
    });

    expect(getProviderSpy).toHaveBeenCalledWith("gemini");
    expect(providerMock.generateProduct).toHaveBeenCalledTimes(1);
    const callArg = providerMock.generateProduct.mock.calls[0][0];
    expect(callArg.customPrompt).toContain("Test Keyword");
    expect(result.format).toBe("json");
    expect(result.json).toEqual(mockProduct);
    expect(result.text).toContain("Ultimate Test Product");

    getProviderSpy.mockRestore();
  });
});

describe("ProductGenerator.generateProduct", () => {
  it("persists structured content from generateAIContent", async () => {
    const fake = createFakePrisma();

    vi.doMock("@/config/db", () => fake);

    const helperResponse = {
      format: "json" as const,
      json: {
        title: "Handmade Aura Candle",
        description: "A soy-based candle infused with calming essential oils.",
        tags: ["candle", "handmade", "aromatherapy"],
        price: 24.5,
        category: "Home Decor",
      },
      text: JSON.stringify({
        title: "Handmade Aura Candle",
      }),
    };

    const actualFactory = await vi.importActual<any>("@/lib/ai/aiFactory");
    const generateAIContent = vi.fn().mockResolvedValue(helperResponse);

    vi.doMock("@/lib/ai/aiFactory", () => ({
      ...actualFactory,
      generateAIContent,
    }));

    const { ProductGenerator } = await import("@/lib/automation/product-generator");
    const generator = new ProductGenerator();

    const trend = {
      keyword: "Aura Candle",
      searchVolume: 85,
      competition: "low",
      avgPrice: 21.0,
    };

    const created = await generator.generateProduct(trend);

    expect(generateAIContent).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "product_generation",
        trend,
      }),
    );

    expect(created.title).toBe(helperResponse.json.title);
    expect(fake.state.products.get(created.id)?.tags).toEqual(helperResponse.json.tags);
    expect(fake.state.products.get(created.id)?.metadata).toMatchObject({
      generation: { provider: "gemini", promptTrend: trend.keyword },
      pricing: { suggested: helperResponse.json.price },
    });
  });
});
