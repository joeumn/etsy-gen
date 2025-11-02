import "../src/config/env";
import { JobStage, JobStatus, ListingStatus } from "@prisma/client";
import { prisma } from "../src/config/db";
import { logger } from "../src/config/logger";

async function seed() {
  logger.info("Seeding database with baseline data");

  await prisma.setting.upsert({
    where: {
      namespace_key: {
        namespace: "global",
        key: "platform",
      },
    },
    create: {
      namespace: "global",
      key: "platform",
      value: {
        name: "etsy-gen",
        lastSeededAt: new Date().toISOString(),
      },
    },
    update: {
      value: {
        name: "etsy-gen",
        lastSeededAt: new Date().toISOString(),
      },
    },
  });

  const scrapeJob = await prisma.job.upsert({
    where: { jobKey: "seed-scrape-job" },
    update: {},
    create: {
      jobKey: "seed-scrape-job",
      stage: JobStage.SCRAPE,
      status: JobStatus.SUCCESS,
      result: { sample: true },
      completedAt: new Date(),
      startedAt: new Date(),
      durationMs: 2000,
    },
  });

  const trendJob = await prisma.job.upsert({
    where: { jobKey: "seed-analyze-job" },
    update: {},
    create: {
      jobKey: "seed-analyze-job",
      stage: JobStage.ANALYZE,
      status: JobStatus.SUCCESS,
      parentJobId: scrapeJob.id,
      result: { sample: true },
      completedAt: new Date(),
      startedAt: new Date(),
      durationMs: 1500,
    },
  });

  const productJob = await prisma.job.upsert({
    where: { jobKey: "seed-generate-job" },
    update: {},
    create: {
      jobKey: "seed-generate-job",
      stage: JobStage.GENERATE,
      status: JobStatus.SUCCESS,
      parentJobId: trendJob.id,
      result: { sample: true },
      completedAt: new Date(),
      startedAt: new Date(),
      durationMs: 3200,
    },
  });

  const listingJob = await prisma.job.upsert({
    where: { jobKey: "seed-list-job" },
    update: {},
    create: {
      jobKey: "seed-list-job",
      stage: JobStage.LIST,
      status: JobStatus.SUCCESS,
      parentJobId: productJob.id,
      result: { sample: true },
      completedAt: new Date(),
      startedAt: new Date(),
      durationMs: 1100,
    },
  });

  const scrapeResult = await prisma.scrapeResult.upsert({
    where: {
      marketplace_productId_collectedAt: {
        marketplace: "etsy",
        productId: "seed-product-1",
        collectedAt: new Date("2025-01-01T00:00:00Z"),
      },
    },
    update: {},
    create: {
      marketplace: "etsy",
      productId: "seed-product-1",
      title: "Seed Digital Print Template",
      price: 19.99,
      tags: ["digital", "printable", "template"],
      category: "Digital Prints",
      sales: 250,
      rating: 4.8,
      collectedAt: new Date("2025-01-01T00:00:00Z"),
      metadata: {
        url: "https://etsy.com/listing/seed-product-1",
      },
      jobId: scrapeJob.id,
    },
  });

  const trend = await prisma.trend.upsert({
    where: { id: "seed-trend-1" },
    update: {},
    create: {
      id: "seed-trend-1",
      niche: "Printable Wall Art",
      score: 0.82,
      tamApprox: 125000,
      momentum: 0.67,
      competition: 0.45,
      summary: "Printable wall art with minimalist themes is surging post-holidays.",
      recommendedAssets: {
        prompts: [
          "Minimalist geometric wall art in calming earth tones",
          "Botanical line art focused on eco-friendly messaging",
        ],
      },
      jobId: trendJob.id,
    },
  });

  const product = await prisma.product.upsert({
    where: { id: "seed-product-asset" },
    update: {},
    create: {
      id: "seed-product-asset",
      title: "Minimalist Botanical Wall Art Bundle",
      description:
        "A set of 5 printable botanical posters inspired by trending eco-friendly aesthetics.",
      tags: ["botanical", "printable", "eco-friendly"],
      attributes: {
        sizeOptions: ["8x10", "11x14", "A4"],
        formats: ["PNG", "PDF"],
      },
      assetPaths: ["generated/seed-product-asset/preview.png"],
      previewUrl: "/generated/seed-product-asset/preview.png",
      metadata: {
        trendId: trend.id,
        derivedFromScrape: scrapeResult.id,
      },
      jobId: productJob.id,
    },
  });

  await prisma.listing.upsert({
    where: { id: "seed-listing-etsy" },
    update: {},
    create: {
      id: "seed-listing-etsy",
      marketplace: "etsy",
      remoteId: "draft-seed-etsy",
      status: ListingStatus.DRAFT,
      price: 24.99,
      quantity: 100,
      productId: product.id,
      metadata: {
        channel: "seed",
        notes: "Initial draft listing for testing",
      },
      jobId: listingJob.id,
    },
  });

  logger.info("Database seed complete");
}

seed()
  .catch((error) => {
    logger.error({ err: error }, "Failed to seed database");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
