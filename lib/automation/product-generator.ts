import { JobStage, JobStatus, ListingStatus, Prisma } from "@prisma/client";
import { prisma } from "@/config/db";
import { logger } from "@/config/logger";
import { generateAIContent } from "@/lib/ai/aiFactory";
import type { GeneratedProduct } from "@/lib/ai/IAIProvider";

interface TrendData {
  keyword: string;
  searchVolume: number;
  competition: string;
  avgPrice: number;
}

/**
 * Core Product Generation Pipeline
 * This scans the web, identifies trends, creates products, and lists them
 */
export class ProductGenerator {

  private normalizeTrendId(keyword: string): string {
    return `market-${keyword.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}`;
  }

  private computeScore(trend: TrendData): number {
    const normalizedVolume = Math.max(0, trend.searchVolume);
    const volumeScore = Math.min(1, normalizedVolume / 100);
    const competitionPenalty = (() => {
      const normalized = trend.competition?.toLowerCase() ?? "";
      if (normalized.includes("high")) return 0.4;
      if (normalized.includes("medium")) return 0.7;
      return 0.9;
    })();
    return Number(Math.max(0.1, volumeScore * competitionPenalty).toFixed(3));
  }

  private toTrendMetadata(trend: TrendData): Prisma.JsonObject {
    return {
      source: "marketplace_scan",
      keyword: trend.keyword,
      searchVolume: trend.searchVolume,
      competitionLabel: trend.competition,
      averagePrice: trend.avgPrice,
      scannedAt: new Date().toISOString(),
    } satisfies Record<string, unknown>;
  }
  
  /**
   * Step 1: Scan marketplaces for trending products
   */
  async scanMarketplaceTrends(): Promise<TrendData[]> {
    logger.info("Scanning marketplaces for trending products...");
    
    const trends: TrendData[] = [];
    
    try {
      // Etsy trending search
      const etsyTrends = await this.scanEtsyTrends();
      trends.push(...etsyTrends);
      
      // Google Trends integration
      const googleTrends = await this.scanGoogleTrends();
      trends.push(...googleTrends);
      
      // Amazon bestsellers
      const amazonTrends = await this.scanAmazonTrends();
      trends.push(...amazonTrends);
      
      // Store trends in database
      for (const trend of trends) {
        const trendId = this.normalizeTrendId(trend.keyword);
        const score = this.computeScore(trend);
        const competitionValue = trend.competition
          ? (() => {
              const normalized = trend.competition?.toLowerCase() ?? "";
              if (normalized.includes("high")) return 0.9;
              if (normalized.includes("medium")) return 0.6;
              if (normalized.includes("low")) return 0.3;
              return null;
            })()
          : null;

        await prisma.trend.upsert({
          where: { id: trendId },
          update: {
            niche: trend.keyword,
            score,
            tamApprox:
              typeof trend.avgPrice === "number"
                ? trend.avgPrice * Math.max(1, trend.searchVolume)
                : null,
            momentum: Number((score * 0.85).toFixed(3)),
            competition: competitionValue ?? undefined,
            metadata: this.toTrendMetadata(trend),
            updatedAt: new Date(),
          },
          create: {
            id: trendId,
            niche: trend.keyword,
            score,
            tamApprox:
              typeof trend.avgPrice === "number"
                ? trend.avgPrice * Math.max(1, trend.searchVolume)
                : null,
            momentum: Number((score * 0.85).toFixed(3)),
            competition: competitionValue ?? undefined,
            metadata: this.toTrendMetadata(trend),
          },
        });
      }
      
      logger.info(`Found ${trends.length} trending opportunities`);
      return trends;
      
    } catch (error) {
      logger.error({ err: error }, "Error scanning marketplace trends");
      throw error;
    }
  }
  
  /**
   * Step 2: Generate product based on trend
   */
  async generateProduct(trend: TrendData) {
    logger.info(`Generating product for: ${trend.keyword}`);
    
    try {
      // Use AI to generate product details
      const aiResult = await generateAIContent({
        provider: "gemini",
        prompt: `Create a digital product listing for: ${trend.keyword}

        Generate:
        1. Product title (SEO optimized)
        2. Description (compelling, benefit-focused)
        3. Tags (13 relevant keywords)
        4. Price recommendation
        5. Product type suggestion`,
        type: "product_generation",
        trend,
      });

      // Parse AI response
      const product: GeneratedProduct = (() => {
        if (aiResult.format === "json") {
          return aiResult.json;
        }

        try {
          return JSON.parse(aiResult.text) as GeneratedProduct;
        } catch (parseError) {
          logger.error({ err: parseError, aiResponse: aiResult.text }, "Failed to parse AI content");
          throw new Error("AI provider returned invalid product data");
        }
      })();

      const tags = Array.isArray(product.tags)
        ? product.tags
        : typeof product.tags === "string"
          ? product.tags
              .split(",")
              .map((tag: string) => tag.trim())
              .filter(Boolean)
          : [];

      const productMetadata: Prisma.JsonObject = {
        pricing: {
          suggested: product.price ?? trend.avgPrice ?? 9.99,
        },
        generation: {
          provider: "gemini",
          promptTrend: trend.keyword,
        },
        status: "draft",
        trend: {
          keyword: trend.keyword,
          searchVolume: trend.searchVolume,
        },
      };

      // Create product in database
      const dbProduct = await prisma.product.create({
        data: {
          title: product.title,
          description: product.description,
          tags,
          attributes: {
            category: product.category ?? "Digital Downloads",
            originTrend: trend.keyword,
          } as Prisma.JsonObject,
          assetPaths: [],
          metadata: productMetadata,
        },
      });
      
      logger.info(`Product created: ${dbProduct.id}`);
      return dbProduct;
      
    } catch (error) {
      logger.error({ err: error }, "Error generating product");
      throw error;
    }
  }
  
  /**
   * Step 3: List product on marketplace
   */
  async listProductOnMarketplace(productId: string, marketplace: string) {
    logger.info(`Listing product ${productId} on ${marketplace}`);
    
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      
      if (!product) throw new Error("Product not found");
      
      let listingResult;
      
      switch (marketplace) {
        case "etsy":
          listingResult = await this.listOnEtsy(product);
          break;
        case "shopify":
          listingResult = await this.listOnShopify(product);
          break;
        case "gumroad":
          listingResult = await this.listOnGumroad(product);
          break;
        default:
          throw new Error(`Unsupported marketplace: ${marketplace}`);
      }
      
      // Update product with marketplace listing ID
      const nextMetadata = (() => {
        const base = (product.metadata ?? {}) as Record<string, unknown>;
        const listings = (base.listings as Record<string, unknown>) ?? {};
        return {
          ...base,
          status: "published",
          listings: {
            ...listings,
            [marketplace]: {
              listingId: listingResult.listingId,
              url: listingResult.url,
              publishedAt: new Date().toISOString(),
            },
          },
        } satisfies Record<string, unknown>;
      })();

      await prisma.product.update({
        where: { id: productId },
        data: {
          metadata: nextMetadata as Prisma.InputJsonValue,
        },
      });

      const baseMetadata = (product.metadata ?? {}) as Record<string, unknown>;
      const pricingInfo = baseMetadata.pricing as { suggested?: number } | undefined;
      const suggestedPrice =
        typeof pricingInfo?.suggested === "number" ? pricingInfo.suggested : undefined;

      await prisma.listing.create({
        data: {
          marketplace,
          remoteId: listingResult.listingId,
          status:
            marketplace === "etsy" ? ListingStatus.DRAFT : ListingStatus.PUBLISHED,
          price: suggestedPrice,
          currency: "USD",
          productId,
          metadata: {
            url: listingResult.url,
            marketplace,
          } as Prisma.JsonObject,
        },
      });

      // Create job record
      await prisma.job.create({
        data: {
          jobKey: `product_listing:${marketplace}:${productId}:${Date.now()}`,
          stage: JobStage.LIST,
          status: JobStatus.SUCCESS,
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
          result: {
            listingId: listingResult.listingId,
            marketplace,
          },
          metadata: {
            productId,
            marketplace,
            listingId: listingResult.listingId,
          } as Prisma.JsonObject,
        },
      });
      
      logger.info(`Product listed successfully: ${listingResult.listingId}`);
      return listingResult;
      
    } catch (error) {
      logger.error({ err: error }, "Error listing product");
      
      // Log failed job
      await prisma.job.create({
        data: {
          jobKey: `product_listing:${marketplace}:${productId}:${Date.now()}:error`,
          stage: JobStage.LIST,
          status: JobStatus.FAILED,
          startedAt: new Date(),
          completedAt: new Date(),
          durationMs: 0,
          error:
            error instanceof Error
              ? { message: error.message }
              : { message: "Unknown error" },
          metadata: {
            productId,
            marketplace,
          } as Prisma.JsonObject,
        },
      });

      throw error;
    }
  }
  
  /**
   * Full automation pipeline
   */
  async runFullPipeline() {
    logger.info("Starting full product generation pipeline...");
    
    try {
      // Step 1: Scan for trends
      const trends = await this.scanMarketplaceTrends();
      
      // Step 2: Generate products for top trends
      const topTrends = trends.slice(0, 5); // Process top 5 trends
      
      for (const trend of topTrends) {
        // Generate product
        const product = await this.generateProduct(trend);
        
        // List on all enabled marketplaces
        const marketplaces = ["etsy", "shopify"];
        
        for (const marketplace of marketplaces) {
          await this.listProductOnMarketplace(product.id, marketplace);
        }
        
        // Wait between products to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      logger.info("Pipeline completed successfully");
      return { success: true, productsCreated: topTrends.length };
      
    } catch (error) {
      logger.error({ err: error }, "Pipeline failed");
      throw error;
    }
  }
  
  // Private helper methods
  
  private async scanEtsyTrends(): Promise<TrendData[]> {
    // Implementation would use Etsy API
    // For now, return mock data structure
    return [];
  }
  
  private async scanGoogleTrends(): Promise<TrendData[]> {
    // Implementation would use Google Trends API
    return [];
  }
  
  private async scanAmazonTrends(): Promise<TrendData[]> {
    // Implementation would use Amazon API
    return [];
  }
  
  private async listOnEtsy(product: any) {
    // Implementation would use Etsy API
    const etsyApiKey = process.env.ETSY_API_KEY;
    if (!etsyApiKey) {
      throw new Error("Etsy API key not configured");
    }
    
    // Mock response
    return {
      listingId: `etsy_${Date.now()}`,
      url: `https://etsy.com/listing/${Date.now()}`,
    };
  }
  
  private async listOnShopify(product: any) {
    // Implementation would use Shopify API
    const shopifyToken = process.env.SHOPIFY_ACCESS_TOKEN;
    if (!shopifyToken) {
      throw new Error("Shopify access token not configured");
    }
    
    return {
      listingId: `shopify_${Date.now()}`,
      url: `https://foundersforge.myshopify.com/products/${product.id}`,
    };
  }
  
  private async listOnGumroad(product: any) {
    // Implementation would use Gumroad API
    return {
      listingId: `gumroad_${Date.now()}`,
      url: `https://gumroad.com/l/${product.id}`,
    };
  }
}

// Export singleton instance
export const productGenerator = new ProductGenerator();
