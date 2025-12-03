import axios from "axios";
import { prisma, type JobStage, type JobStatus, type ListingStatus } from "@/config/db";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { AIProviderFactory } from "@/lib/ai/aiFactory";
import type { GenerateProductRequest } from "@/lib/ai/IAIProvider";

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

  private parseTraffic(value: unknown): number {
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === "string") {
      const sanitized = value.replace(/[+,]/g, "").trim();
      const numeric = Number(sanitized);
      return Number.isFinite(numeric) ? numeric : 0;
    }
    return 0;
  }

  private competitionFromMagnitude(value: number): string {
    if (value >= 750) return "high";
    if (value >= 300) return "medium";
    return "low";
  }

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

  private toTrendMetadata(trend: TrendData): Record<string, any> {
    return {
      source: "marketplace_scan",
      keyword: trend.keyword,
      searchVolume: trend.searchVolume,
      competitionLabel: trend.competition,
      averagePrice: trend.avgPrice,
      scannedAt: new Date().toISOString(),
    };
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
            tam_approx:
              typeof trend.avgPrice === "number"
                ? trend.avgPrice * Math.max(1, trend.searchVolume)
                : undefined,
            momentum: Number((score * 0.85).toFixed(3)),
            competition: competitionValue ?? undefined,
            metadata: this.toTrendMetadata(trend),
            updated_at: new Date(),
          },
          create: {
            id: trendId,
            niche: trend.keyword,
            score,
            tam_approx:
              typeof trend.avgPrice === "number"
                ? trend.avgPrice * Math.max(1, trend.searchVolume)
                : undefined,
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
      const aiProvider = await AIProviderFactory.getProvider("gemini");
      
      const request: GenerateProductRequest = {
        trendData: {
          keywords: [trend.keyword],
          salesVelocity: trend.searchVolume,
          priceRange: { min: trend.avgPrice * 0.8, max: trend.avgPrice * 1.2 },
          competitionLevel: trend.competition as 'low' | 'medium' | 'high',
          seasonality: [],
          targetAudience: [],
        },
        productType: "digital_download",
        targetMarketplace: "etsy",
      };
      
      const product = await aiProvider.generateProduct(request);

      const tags = Array.isArray(product.tags) ? product.tags : [];

      const productMetadata: Record<string, any> = {
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
          },
          asset_paths: [],
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
          metadata: nextMetadata,
        },
      });

      const baseMetadata = (product.metadata ?? {}) as Record<string, unknown>;
      const pricingInfo = baseMetadata.pricing as { suggested?: number } | undefined;
      const suggestedPrice =
        typeof pricingInfo?.suggested === "number" ? pricingInfo.suggested : undefined;

      await prisma.listing.create({
        data: {
          marketplace,
          remote_id: listingResult.listingId,
          status:
            marketplace === "etsy" ? "DRAFT" : "PUBLISHED",
          price: suggestedPrice,
          currency: "USD",
          product_id: productId,
          metadata: {
            url: listingResult.url,
            marketplace,
          },
        },
      });

      // Create job record
      await prisma.job.create({
        data: {
          job_key: `product_listing:${marketplace}:${productId}:${Date.now()}`,
          stage: "LIST",
          status: "SUCCESS",
          started_at: new Date(),
          completed_at: new Date(),
          duration_ms: 0,
          result: {
            listingId: listingResult.listingId,
            marketplace,
          },
          metadata: {
            productId,
            marketplace,
            listingId: listingResult.listingId,
          },
        },
      });
      
      logger.info(`Product listed successfully: ${listingResult.listingId}`);
      return listingResult;
      
    } catch (error) {
      logger.error({ err: error }, "Error listing product");
      
      // Log failed job
      await prisma.job.create({
        data: {
          job_key: `product_listing:${marketplace}:${productId}:${Date.now()}:error`,
          stage: "LIST",
          status: "FAILED",
          started_at: new Date(),
          completed_at: new Date(),
          duration_ms: 0,
          error:
            error instanceof Error
              ? { message: error.message }
              : { message: "Unknown error" },
          metadata: {
            productId,
            marketplace,
          },
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
    if (!env.ETSY_API_KEY || !env.ETSY_ACCESS_TOKEN) {
      logger.warn("Skipping Etsy trend scan - Etsy credentials missing");
      return [];
    }

    const startedAt = Date.now();

    const response = await axios.get("https://openapi.etsy.com/v3/application/listings/active", {
      params: {
        limit: 20,
        sort_on: "score",
        sort_order: "desc",
        category: "digital_downloads",
        include_private: false,
      },
      headers: {
        "x-api-key": env.ETSY_API_KEY,
        Authorization: `Bearer ${env.ETSY_ACCESS_TOKEN}`,
      },
      timeout: 15000,
    });

    const listings = Array.isArray(response.data?.results) ? response.data.results : [];
    const collectedAt = new Date();

    const trends: TrendData[] = [];

    for (const listing of listings) {
      const listingId = String(listing.listing_id ?? listing.listingId ?? "");
      if (!listingId) continue;

      const rawPrice = listing.price;
      const priceAmount = (() => {
        if (!rawPrice) return undefined;
        if (typeof rawPrice === "number") return rawPrice;
        if (typeof rawPrice === "string") return Number(rawPrice);
        if (typeof rawPrice === "object") {
          const amount = Number(rawPrice.amount ?? rawPrice.amount_minor ?? rawPrice.value);
          const divisor = Number(rawPrice.divisor ?? rawPrice.divisor_minor ?? 100);
          if (Number.isFinite(amount) && Number.isFinite(divisor) && divisor !== 0) {
            return amount / divisor;
          }
        }
        return undefined;
      })();

      const totalViews = this.parseTraffic(
        listing.total_view_count ?? listing.views ?? listing.listing_views ?? listing.watch_count,
      );
      const favorers = this.parseTraffic(listing.num_favorers ?? listing.favorite_count);
      const keyword = String(listing.title ?? listing.description ?? listingId);

      const competition = this.competitionFromMagnitude(favorers);

      const trend: TrendData = {
        keyword,
        searchVolume: totalViews,
        competition,
        avgPrice: priceAmount ?? 0,
      };

      trends.push(trend);

      const tags: string[] = Array.isArray(listing.tags)
        ? listing.tags.filter((tag: unknown): tag is string => typeof tag === "string")
        : [];

      const category = Array.isArray(listing.category_path) && listing.category_path.length > 0
        ? String(listing.category_path[listing.category_path.length - 1])
        : listing.category ?? null;

      try {
        await prisma.scrapeResult.upsert({
          where: {
            marketplace_productId_collectedAt: {
              marketplace: "etsy",
              productId: listingId,
              collectedAt,
            },
          },
          update: {
            title: keyword,
            price: priceAmount !== undefined ? priceAmount : undefined,
            currency: listing.price?.currency_code ?? "USD",
            tags,
            category: category ?? undefined,
            sales: listing.quantity_sold ?? listing.quantity ?? undefined,
            rating: listing.rating ?? listing.review_average ?? undefined,
            metadata: {
              url: listing.url,
              raw: listing,
            },
          },
          create: {
            marketplace: "etsy",
            product_id: listingId,
            collected_at: collectedAt,
            title: keyword,
            price: priceAmount !== undefined ? priceAmount : undefined,
            currency: listing.price?.currency_code ?? "USD",
            tags,
            category: category ?? undefined,
            sales: listing.quantity_sold ?? listing.quantity ?? undefined,
            rating: listing.rating ?? listing.review_average ?? undefined,
            metadata: {
              url: listing.url,
              raw: listing,
            },
          },
        });
      } catch (error) {
        logger.error({ err: error, listingId }, "Failed to persist Etsy scrape result");
      }
    }

    const completedAt = Date.now();
    logger.info(
      {
        source: "etsy",
        count: trends.length,
        durationMs: completedAt - startedAt,
      },
      "Etsy trend scan complete",
    );

    return trends;
  }

  private async scanGoogleTrends(): Promise<TrendData[]> {
    if (!env.GOOGLE_TRENDS_API_KEY) {
      logger.warn("Skipping Google trend scan - Google Trends API key missing");
      return [];
    }

    const startedAt = Date.now();

    const response = await axios.get("https://trends.googleapis.com/trends/api/realtimetrends", {
      params: {
        hl: "en-US",
        tz: 0,
        cat: "all",
        geo: "US",
        key: env.GOOGLE_TRENDS_API_KEY,
      },
      timeout: 15000,
      responseType: "text",
    });

    const payload = (() => {
      const raw = typeof response.data === "string" ? response.data : String(response.data ?? "");
      const sanitized = raw.replace(/^[^\{]+/, "");
      try {
        return JSON.parse(sanitized);
      } catch (error) {
        logger.error({ err: error }, "Failed to parse Google Trends payload");
        return { storySummaries: { trendingStories: [] } };
      }
    })();

    const stories =
      payload?.storySummaries?.trendingStories ??
      payload?.featuredStorySummaries?.trendingStories ??
      [];

    const collectedAt = new Date();
    const trends: TrendData[] = [];

    for (const story of stories) {
      const storyId = String(story.id ?? story.storyId ?? "");
      if (!storyId) continue;

      const searchVolume = this.parseTraffic(
        story.searchInterest?.article_search_interest?.[0]?.value ??
          story.searchInterest?.news_search_interest?.[0]?.value ??
          story.formattedTraffic,
      );

      const keyword = String(story.title ?? story.entityNames?.[0] ?? story.shareUrl ?? storyId);
      const competition = this.competitionFromMagnitude(searchVolume);

      const trend: TrendData = {
        keyword,
        searchVolume,
        competition,
        avgPrice: 0,
      };

      trends.push(trend);

      const tags: string[] = Array.isArray(story.entityNames)
        ? story.entityNames.filter((tag: unknown): tag is string => typeof tag === "string")
        : [];

      try {
        await prisma.scrapeResult.upsert({
          where: {
            marketplace_productId_collectedAt: {
              marketplace: "google_trends",
              productId: storyId,
              collectedAt,
            },
          },
          update: {
            title: keyword,
            price: undefined,
            currency: "USD",
            tags,
            category: story.mainTopic ?? undefined,
            sales: undefined,
            rating: undefined,
            metadata: {
              shareUrl: story.shareUrl,
              articles: story.articles,
              raw: story,
            },
          },
          create: {
            marketplace: "google_trends",
            product_id: storyId,
            collected_at: collectedAt,
            title: keyword,
            price: undefined,
            currency: "USD",
            tags,
            category: story.mainTopic ?? undefined,
            sales: undefined,
            rating: undefined,
            metadata: {
              shareUrl: story.shareUrl,
              articles: story.articles,
              raw: story,
            },
          },
        });
      } catch (error) {
        logger.error({ err: error, storyId }, "Failed to persist Google trend");
      }
    }

    logger.info(
      {
        source: "google_trends",
        count: trends.length,
        durationMs: Date.now() - startedAt,
      },
      "Google trend scan complete",
    );

    return trends;
  }

  private async scanAmazonTrends(): Promise<TrendData[]> {
    if (!env.AMAZON_ACCESS_KEY) {
      logger.warn("Skipping Amazon trend scan - Amazon API key missing");
      return [];
    }

    const startedAt = Date.now();

    const response = await axios.get("https://api.rainforestapi.com/request", {
      params: {
        api_key: env.AMAZON_ACCESS_KEY,
        type: "bestsellers",
        amazon_domain: "amazon.com",
        category_id: "16310091", // Arts, Crafts & Sewing
        associate_id: env.AMAZON_ASSOCIATE_TAG,
      },
      timeout: 15000,
    });

    const bestsellers = Array.isArray(response.data?.bestsellers)
      ? response.data.bestsellers
      : [];

    const collectedAt = new Date();
    const trends: TrendData[] = [];

    for (const item of bestsellers) {
      const asin = String(item.asin ?? item.id ?? "");
      if (!asin) continue;

      const price = Number(item.price?.value ?? item.price);
      const reviews = this.parseTraffic(item.reviews?.total_reviews ?? item.reviews_total);
      const searchVolume = Math.max(0, 1000 - this.parseTraffic(item.rank ?? item.best_sellers_rank) * 10);
      const keyword = String(item.title ?? asin);

      const competition = this.competitionFromMagnitude(reviews);

      const trend: TrendData = {
        keyword,
        searchVolume,
        competition,
        avgPrice: Number.isFinite(price) ? price : 0,
      };

      trends.push(trend);

      const tags: string[] = Array.isArray(item.categories)
        ? item.categories
            .map((category: any) => category.name)
            .filter((name: unknown): name is string => typeof name === "string")
        : [];

      try {
        await prisma.scrapeResult.upsert({
          where: {
            marketplace_productId_collectedAt: {
              marketplace: "amazon",
              productId: asin,
              collectedAt,
            },
          },
          update: {
            title: keyword,
            price: Number.isFinite(price) ? price : undefined,
            currency: item.price?.currency ?? "USD",
            tags,
            category: item.category ?? item.subcategory ?? undefined,
            sales: item.rank ?? undefined,
            rating: item.reviews?.rating ?? undefined,
            metadata: {
              url: item.link,
              raw: item,
            },
          },
          create: {
            marketplace: "amazon",
            product_id: asin,
            collected_at: collectedAt,
            title: keyword,
            price: Number.isFinite(price) ? price : undefined,
            currency: item.price?.currency ?? "USD",
            tags,
            category: item.category ?? item.subcategory ?? undefined,
            sales: item.rank ?? undefined,
            rating: item.reviews?.rating ?? undefined,
            metadata: {
              url: item.link,
              raw: item,
            },
          },
        });
      } catch (error) {
        logger.error({ err: error, asin }, "Failed to persist Amazon bestseller");
      }
    }

    logger.info(
      {
        source: "amazon",
        count: trends.length,
        durationMs: Date.now() - startedAt,
      },
      "Amazon trend scan complete",
    );

    return trends;
  }

  private async listOnEtsy(product: any) {
    if (!env.ETSY_API_KEY || !env.ETSY_ACCESS_TOKEN || !env.ETSY_SHOP_ID) {
      throw new Error("Etsy API credentials are not fully configured");
    }

    const metadata = (product.metadata ?? {}) as Record<string, any>;
    const pricing = metadata.pricing ?? {};
    const suggestedPrice = typeof pricing.suggested === "number" ? pricing.suggested : 12.0;
    const amountInCents = Math.max(1, Math.round(suggestedPrice * 100));

    const payload = {
      title: product.title,
      description: product.description,
      who_made: "i_did",
      when_made: "made_to_order",
      type: "download",
      is_supply: false,
      taxonomy_id: 2741, // Digital prints & planners
      quantity: 999,
      should_auto_renew: true,
      tags: Array.isArray(product.tags) ? product.tags.slice(0, 13) : [],
      price: {
        amount: amountInCents,
        divisor: 100,
        currency_code: "USD",
      },
    };

    const response = await axios.post(
      `https://openapi.etsy.com/v3/application/shops/${env.ETSY_SHOP_ID}/listings`,
      payload,
      {
        headers: {
          "x-api-key": env.ETSY_API_KEY,
          Authorization: `Bearer ${env.ETSY_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    const listingId = String(response.data?.listing_id ?? response.data?.data?.listing_id ?? "");
    if (!listingId) {
      throw new Error("Etsy did not return a listing identifier");
    }

    const url =
      response.data?.url ??
      response.data?.listing_url ??
      `https://www.etsy.com/listing/${listingId}`;

    return {
      listingId,
      url,
    };
  }

  private async listOnShopify(product: any) {
    if (!env.SHOPIFY_ACCESS_TOKEN || !env.SHOPIFY_SHOP_DOMAIN) {
      throw new Error("Shopify credentials are not configured");
    }

    const metadata = (product.metadata ?? {}) as Record<string, any>;
    const pricing = metadata.pricing ?? {};
    const suggestedPrice = typeof pricing.suggested === "number" ? pricing.suggested : 19.0;

    const payload = {
      product: {
        title: product.title,
        body_html: product.description,
        vendor: "AI Product Generator",
        product_type: (product.attributes as any)?.category ?? "Digital",
        tags: Array.isArray(product.tags) ? product.tags.join(", ") : "",
        status: "draft",
        variants: [
          {
            price: suggestedPrice.toFixed(2),
            sku: `AI-${product.id}`,
            requires_shipping: false,
            inventory_policy: "deny",
            inventory_management: null,
          },
        ],
        options: [
          {
            name: "Title",
            values: ["Default"],
          },
        ],
      },
    };

    const response = await axios.post(
      `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/api/2024-01/products.json`,
      payload,
      {
        headers: {
          "X-Shopify-Access-Token": env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        timeout: 20000,
      },
    );

    const productData = response.data?.product;
    const listingId = String(productData?.id ?? "");
    if (!listingId) {
      throw new Error("Shopify did not return a product identifier");
    }

    const handle = productData?.handle;
    const url = handle
      ? `https://${env.SHOPIFY_SHOP_DOMAIN}/products/${handle}`
      : `https://${env.SHOPIFY_SHOP_DOMAIN}/admin/products/${listingId}`;

    return {
      listingId,
      url,
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
