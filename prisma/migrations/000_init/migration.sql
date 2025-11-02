-- CreateEnum
CREATE TYPE "JobStage" AS ENUM ('SCRAPE', 'ANALYZE', 'GENERATE', 'LIST');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED', 'RETRYING');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('PENDING', 'DRAFT', 'PUBLISHED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Setting" (
    "id" TEXT PRIMARY KEY,
    "namespace" TEXT NOT NULL DEFAULT 'global',
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT PRIMARY KEY,
    "namespace" TEXT NOT NULL DEFAULT 'global',
    "name" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "lastFour" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,
    "metadata" JSONB
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT PRIMARY KEY,
    "jobKey" TEXT NOT NULL,
    "stage" "JobStage" NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "error" JSONB,
    "startedAt" TIMESTAMPTZ,
    "completedAt" TIMESTAMPTZ,
    "durationMs" INTEGER,
    "metadata" JSONB,
    "parentJobId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ScrapeResult" (
    "id" TEXT PRIMARY KEY,
    "marketplace" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "price" NUMERIC(18, 2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "category" TEXT,
    "sales" INTEGER,
    "rating" DOUBLE PRECISION,
    "collectedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "jobId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Trend" (
    "id" TEXT PRIMARY KEY,
    "niche" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "tamApprox" DOUBLE PRECISION,
    "momentum" DOUBLE PRECISION,
    "competition" DOUBLE PRECISION,
    "summary" TEXT,
    "recommendedAssets" JSONB,
    "metadata" JSONB,
    "jobId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "attributes" JSONB,
    "assetPaths" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "previewUrl" TEXT,
    "metadata" JSONB,
    "jobId" TEXT,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT PRIMARY KEY,
    "marketplace" TEXT NOT NULL,
    "remoteId" TEXT,
    "status" "ListingStatus" NOT NULL DEFAULT 'PENDING',
    "price" NUMERIC(18, 2),
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quantity" INTEGER,
    "productId" TEXT NOT NULL,
    "jobId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Setting_namespace_key_idx" ON "Setting"("namespace", "key");

-- CreateIndex
CREATE UNIQUE INDEX "Setting_namespace_key_key" ON "Setting"("namespace", "key");

-- CreateIndex
CREATE INDEX "ApiKey_namespace_name_idx" ON "ApiKey"("namespace", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_namespace_name_key" ON "ApiKey"("namespace", "name");

-- CreateIndex
CREATE INDEX "Job_stage_status_createdAt_idx" ON "Job"("stage", "status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Job_jobKey_key" ON "Job"("jobKey");

-- CreateIndex
CREATE UNIQUE INDEX "ScrapeResult_marketplace_productId_collectedAt_key" ON "ScrapeResult"("marketplace", "productId", "collectedAt");

-- CreateIndex
CREATE INDEX "ScrapeResult_marketplace_collectedAt_idx" ON "ScrapeResult"("marketplace", "collectedAt");

-- CreateIndex
CREATE INDEX "Trend_niche_createdAt_idx" ON "Trend"("niche", "createdAt");

-- CreateIndex
CREATE INDEX "Product_title_idx" ON "Product"("title");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_marketplace_remote_unique" ON "Listing"("marketplace", "remoteId");

-- CreateIndex
CREATE INDEX "Listing_marketplace_status_createdAt_idx" ON "Listing"("marketplace", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_parentJobId_fkey" FOREIGN KEY ("parentJobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScrapeResult" ADD CONSTRAINT "ScrapeResult_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Trend" ADD CONSTRAINT "Trend_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE SET NULL ON UPDATE CASCADE;
