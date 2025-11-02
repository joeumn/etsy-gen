export const JobStage = {
  SCRAPE: "SCRAPE",
  ANALYZE: "ANALYZE",
  GENERATE: "GENERATE",
  LIST: "LIST",
} as const;

export const JobStatus = {
  PENDING: "PENDING",
  RUNNING: "RUNNING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  RETRYING: "RETRYING",
} as const;

export const ListingStatus = {
  PENDING: "PENDING",
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
  FAILED: "FAILED",
} as const;

class Decimal {
  value: string | number | bigint;
  constructor(value: string | number | bigint = 0) {
    this.value = value;
  }
}

export const Prisma = {
  Decimal,
  sql: String,
  validator: <T>(fn: (arg: T) => T) => fn,
  JsonNull: null,
};

export class PrismaClient {
  async $connect() {
    return undefined;
  }

  async $disconnect() {
    return undefined;
  }
}

export default PrismaClient;
