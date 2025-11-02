import { Prisma } from "@prisma/client";
import { prisma } from "../../config/db";
import { logger } from "../../config/logger";
import { SettingsService } from "../../services/settingsService";

interface ListContext {
  jobId: string;
  metadata?: Record<string, unknown>;
}

const toJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;

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

  const products = await prisma.product.findMany({
    where: {
      listings: {
        none: {},
      },
    },
    take: 5,
  });

  const listings = [];

  for (const product of products) {
    const remote = await publishToEtsy(product.id);

    const listing = await prisma.listing.create({
      data: {
        marketplace: "etsy",
        remoteId: remote.remoteId,
        status: (draftOnly ? "DRAFT" : "PUBLISHED") as ListingStatusValue,
        price: 29.99,
        quantity: 999,
        currency: "USD",
        productId: product.id,
        jobId,
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

