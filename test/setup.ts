import { mkdirSync } from "fs";
import path from "path";

// Mock environment variables for tests
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = process.env.DATABASE_URL ?? "postgresql://user:pass@localhost:5432/test";
process.env.REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";
process.env.APP_ENCRYPTION_KEY =
  process.env.APP_ENCRYPTION_KEY ?? "0123456789abcdef0123456789abcdef";
process.env.ETSY_API_KEY = process.env.ETSY_API_KEY ?? "test-etsy-key";
process.env.ETSY_SHOP_ID = process.env.ETSY_SHOP_ID ?? "123456";
process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY ?? "";
process.env.ADMIN_API_TOKEN = process.env.ADMIN_API_TOKEN ?? "test-admin-token";
process.env.VITEST = process.env.VITEST ?? "true";

const dataRoot = path.resolve(process.cwd(), ".tmp-test-data");
const generatedRoot = path.resolve(process.cwd(), ".tmp-test-generated");

mkdirSync(dataRoot, { recursive: true });
mkdirSync(generatedRoot, { recursive: true });

process.env.DATA_ROOT = dataRoot;
process.env.GENERATED_ROOT = generatedRoot;
