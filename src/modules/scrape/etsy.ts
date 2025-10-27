import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";
import { ApiKeyService } from "../../services/apiKeyService";
import type { MarketplaceProduct } from "./types";

const ETSY_API_BASE = "https://openapi.etsy.com/v3/application";

const fallbackProducts = (): MarketplaceProduct[] => [
  {
    marketplace: "etsy",
    productId: `fallback-${Date.now()}`,
    title: "Fallback Printable Planner",
    price: 14.99,
    currency: "USD",
    tags: ["planner", "printable", "organizer"],
    category: "Digital Downloads",
    sales: 120,
    rating: 4.7,
    url: "https://etsy.com/listing/fallback-planner",
    collectedAt: new Date(),
    raw: { source: "fallback" },
  },
];

const getApiKey = async () => {
  const stored = await ApiKeyService.getDecryptedKey("etsy");
  if (stored) {
    return stored;
  }
  return env.ETSY_API_KEY;
};

const getShopId = () => env.ETSY_SHOP_ID;

export const fetchEtsyListings = async (
  limit = 50,
): Promise<MarketplaceProduct[]> => {
  const apiKey = await getApiKey();
  const shopId = getShopId();

  if (!apiKey || !shopId) {
    logger.warn("Missing Etsy credentials; returning fallback data");
    return fallbackProducts();
  }

  try {
    const response = await axios.get(
      `${ETSY_API_BASE}/shops/${shopId}/listings/active`,
      {
        params: { limit },
        headers: {
          "x-api-key": apiKey,
        },
      },
    );

    const listings = response.data?.results ?? response.data ?? [];
    if (!Array.isArray(listings) || listings.length === 0) {
      logger.warn("Etsy API returned no listings; using fallback data");
      return fallbackProducts();
    }

    return listings.map((item: any) => ({
      marketplace: "etsy",
      productId: String(item.listing_id ?? item.listingId ?? item.listingID),
      title: item.title ?? "Untitled",
      price: Number(item.price?.amount ? item.price.amount / 100 : item.price) || 0,
      currency: item.price?.currency_code ?? "USD",
      tags: item.tags ?? [],
      category: item.taxonomy_path?.[0] ?? null,
      sales: item.quantity_sold ?? item.views ?? null,
      rating: item.review_info?.average_rating ?? null,
      url: item.url ?? item.listing_url,
      collectedAt: new Date(),
      raw: item,
    }));
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch Etsy listings; using fallback");
    return fallbackProducts();
  }
};
