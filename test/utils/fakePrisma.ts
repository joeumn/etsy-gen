import { randomUUID } from "node:crypto";
import { vi } from "vitest";

type SettingKey = `${string}|${string}`;
type ApiKeyKey = `${string}|${string}`;
type ScrapeKey = `${string}|${string}|${string}`;

interface SettingRecord {
  id: string;
  namespace: string;
  key: string;
  value: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiKeyRecord {
  id: string;
  namespace: string;
  name: string;
  encryptedValue: string;
  iv: string;
  lastFour: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ScrapeRecord {
  id: string;
  marketplace: string;
  productId: string;
  collectedAt: Date;
  title: string;
  price: number;
  currency: string;
  tags: string[];
  category?: string | null;
  sales?: number | null;
  rating?: number | null;
  metadata?: any;
  jobId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface TrendRecord {
  id: string;
  niche: string;
  score: number;
  tamApprox: number | null;
  momentum: number | null;
  competition: number | null;
  summary?: string | null;
  recommendedAssets?: any;
  metadata?: any;
  jobId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductRecord {
  id: string;
  title: string;
  description: string;
  tags: string[];
  attributes?: any;
  assetPaths: string[];
  previewUrl?: string | null;
  metadata?: any;
  jobId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ListingRecord {
  id: string;
  marketplace: string;
  remoteId?: string | null;
  status: string;
  price?: number | null;
  quantity?: number | null;
  currency: string;
  productId: string;
  jobId?: string | null;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface JobRecord {
  id: string;
  jobKey: string;
  stage: string;
  status: string;
  attempts: number;
  result?: any;
  error?: any;
  startedAt?: Date | null;
  completedAt?: Date | null;
  durationMs?: number | null;
  metadata?: any;
  parentJobId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const createFakePrisma = () => {
  const settings = new Map<SettingKey, SettingRecord>();
  const apiKeys = new Map<ApiKeyKey, ApiKeyRecord>();
  const scrapeResults = new Map<ScrapeKey, ScrapeRecord>();
  const trends = new Map<string, TrendRecord>();
  const products = new Map<string, ProductRecord>();
  const listings: ListingRecord[] = [];
  const jobs: JobRecord[] = [];

  const makeSettingKey = (namespace: string, key: string): SettingKey =>
    `${namespace}|${key}`;
  const makeApiKey = (namespace: string, name: string): ApiKeyKey =>
    `${namespace}|${name}`;
  const makeScrapeKey = (marketplace: string, productId: string, collectedAt: Date) =>
    `${marketplace}|${productId}|${collectedAt.toISOString()}`;

  const prisma = {
    setting: {
      findMany: vi.fn(async ({ where }: any = {}) => {
        if (!where?.namespace) {
          return Array.from(settings.values());
        }
        return Array.from(settings.values()).filter(
          (record) => record.namespace === where.namespace,
        );
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.id) {
          return Array.from(settings.values()).find((record) => record.id === where.id) ?? null;
        }
        if (where.namespace_key) {
          return (
            settings.get(makeSettingKey(where.namespace_key.namespace, where.namespace_key.key)) ??
            null
          );
        }
        return null;
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const key = makeSettingKey(where.namespace_key.namespace, where.namespace_key.key);
        const existing = settings.get(key);
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          settings.set(key, updated);
          return updated;
        }
        const record: SettingRecord = {
          id: randomUUID(),
          namespace: create.namespace,
          key: create.key,
          value: create.value,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        settings.set(key, record);
        return record;
      }),
      delete: vi.fn(async ({ where }: any) => {
        const existing = Array.from(settings.values()).find((record) => record.id === where.id);
        if (!existing) {
          throw new Error("Setting not found");
        }
        settings.delete(makeSettingKey(existing.namespace, existing.key));
        return existing;
      }),
    },
    apiKey: {
      findMany: vi.fn(async ({ where }: any = {}) => {
        if (!where?.namespace) {
          return Array.from(apiKeys.values());
        }
        return Array.from(apiKeys.values()).filter(
          (record) => record.namespace === where.namespace,
        );
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (where.namespace_name) {
          return (
            apiKeys.get(makeApiKey(where.namespace_name.namespace, where.namespace_name.name)) ??
            null
          );
        }
        return null;
      }),
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const key = makeApiKey(where.namespace_name.namespace, where.namespace_name.name);
        const existing = apiKeys.get(key);
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          apiKeys.set(key, updated);
          return updated;
        }

        const record: ApiKeyRecord = {
          id: randomUUID(),
          namespace: create.namespace,
          name: create.name,
          encryptedValue: create.encryptedValue,
          iv: create.iv,
          lastFour: create.lastFour,
          metadata: create.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        apiKeys.set(key, record);
        return record;
      }),
    },
    scrapeResult: {
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const collectedAt = where.marketplace_productId_collectedAt.collectedAt;
        const key = makeScrapeKey(
          where.marketplace_productId_collectedAt.marketplace,
          where.marketplace_productId_collectedAt.productId,
          collectedAt,
        );
        const existing = scrapeResults.get(key);
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          scrapeResults.set(key, updated);
          return updated;
        }

        const record: ScrapeRecord = {
          id: randomUUID(),
          marketplace: create.marketplace,
          productId: create.productId,
          collectedAt,
          title: create.title,
          price: create.price,
          currency: create.currency,
          tags: create.tags,
          category: create.category,
          sales: create.sales,
          rating: create.rating,
          metadata: create.metadata,
          jobId: create.jobId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        scrapeResults.set(key, record);
        return record;
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        const list = Array.from(scrapeResults.values());
        if (!where?.collectedAt?.gte) {
          return list;
        }
        return list.filter(
          (record) => record.collectedAt >= where.collectedAt.gte,
        );
      }),
    },
    trend: {
      upsert: vi.fn(async ({ where, create, update }: any) => {
        const id = where.id ?? where.niche ?? create.id;
        const existing = trends.get(id);
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          trends.set(id, updated);
          return updated;
        }
        const record: TrendRecord = {
          id,
          niche: create.niche,
          score: create.score,
          tamApprox: create.tamApprox,
          momentum: create.momentum,
          competition: create.competition,
          summary: create.summary,
          recommendedAssets: create.recommendedAssets,
          metadata: create.metadata,
          jobId: create.jobId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        trends.set(record.id, record);
        return record;
      }),
      findMany: vi.fn(async ({ orderBy, take }: any = {}) => {
        const entries = Array.from(trends.values());
        if (orderBy?.score === "desc") {
          entries.sort((a, b) => b.score - a.score);
        }
        return typeof take === "number" ? entries.slice(0, take) : entries;
      }),
    },
    product: {
      create: vi.fn(async ({ data }: any) => {
        const record: ProductRecord = {
          id: data.id ?? randomUUID(),
          title: data.title,
          description: data.description,
          tags: data.tags,
          attributes: data.attributes,
          assetPaths: data.assetPaths,
          previewUrl: data.previewUrl,
          metadata: data.metadata,
          jobId: data.jobId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        products.set(record.id, record);
        return record;
      }),
      upsert: vi.fn(async ({ where, update, create }: any) => {
        const existing = products.get(where.id);
        if (existing) {
          const updated = {
            ...existing,
            ...update,
            updatedAt: new Date(),
          };
          products.set(where.id, updated);
          return updated;
        }
        const record: ProductRecord = {
          id: create.id,
          title: create.title,
          description: create.description,
          tags: create.tags,
          attributes: create.attributes,
          assetPaths: create.assetPaths,
          previewUrl: create.previewUrl,
          metadata: create.metadata,
          jobId: create.jobId,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        products.set(record.id, record);
        return record;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const existing = products.get(where.id);
        if (!existing) {
          throw new Error("Product not found");
        }
        const updated = {
          ...existing,
          ...data,
          updatedAt: new Date(),
        };
        products.set(where.id, updated);
        return updated;
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        if (!where?.id) {
          return null;
        }
        return products.get(where.id) ?? null;
      }),
      findMany: vi.fn(async ({ where }: any = {}) => {
        const entries = Array.from(products.values());
        if (!where?.listings?.none) {
          return entries;
        }
        return entries.filter(
          (product) => !listings.some((listing) => listing.productId === product.id),
        );
      }),
    },
    listing: {
      create: vi.fn(async ({ data }: any) => {
        const record: ListingRecord = {
          id: data.id ?? randomUUID(),
          marketplace: data.marketplace,
          remoteId: data.remoteId,
          status: data.status,
          price: data.price,
          quantity: data.quantity,
          currency: data.currency,
          productId: data.productId,
          jobId: data.jobId,
          metadata: data.metadata,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        listings.push(record);
        return record;
      }),
      findMany: vi.fn(async () => listings),
    },
    job: {
      create: vi.fn(async ({ data }: any) => {
        if (jobs.some((job) => job.jobKey === data.jobKey)) {
          throw new Error(`Job with key ${data.jobKey} already exists`);
        }
        const record: JobRecord = {
          id: data.id ?? randomUUID(),
          jobKey: data.jobKey,
          stage: data.stage,
          status: data.status,
          attempts: data.attempts ?? 0,
          result: data.result,
          error: data.error,
          startedAt: data.startedAt ?? null,
          completedAt: data.completedAt ?? null,
          durationMs: data.durationMs ?? null,
          metadata: data.metadata,
          parentJobId: data.parentJobId ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        jobs.push(record);
        return record;
      }),
      findMany: vi.fn(async () => jobs),
    },
  };

  return {
    prisma,
    state: { settings, apiKeys, scrapeResults, trends, products, listings, jobs },
  };
};
