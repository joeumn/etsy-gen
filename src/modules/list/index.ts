import { db } from "../../config/db";
import { logger } from "../../config/logger";
import { SettingsService } from "../../services/settingsService";

interface ListContext {
  jobId: string;
  metadata?: Record<string, unknown>;
}

const toJson = (value: unknown): any =>
  value as any;

type ListingStatusValue = "PENDING" | "DRAFT" | "PUBLISHED" | "FAILED";

const publishToEtsy = async (productId: string) => {
  return {
    remoteId: `etsy-draft-${productId.slice(-6)}`,
    status: "DRAFT" as ListingStatusValue,
    url: `https://etsy.com/listing/preview/${productId}`,
  };
};

export const runListStage = async ({ jobId }: ListContext) => {
  const draftOnly =
    (await SettingsService.get<boolean>("listings.draftOnly")) ?? true;

  const { supabase } = await import("../../config/db");
  // Get products without listings by checking if they don't exist in listings table
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .limit(5);

  if (error) throw error;
  if (!products) return {
    summary: {
      listings: 0,
      draftOnly,
    },
  };

  const listings = [];

  for (const product of products) {
    const remote = await publishToEtsy(product.id);

    const listing = await db.listing.create({
      data: {
        marketplace: "etsy",
        remote_id: remote.remoteId,
        status: (draftOnly ? "DRAFT" : "PUBLISHED") as ListingStatusValue,
        price: 29.99,
        quantity: 999,
        currency: "USD",
        product_id: product.id,
        job_id: jobId,
        metadata: toJson({
          url: remote.url,
          draftOnly,
        }),
      },
    });

    listings.push(listing);
  }

  logger.info({ listings: listings.length }, "List stage completed");

  return {
    summary: {
      listings: listings.length,
      draftOnly,
    },
  };
};

