import dotenv from "dotenv";
import { z } from "zod";

if (!process.env.SKIP_ENV_LOAD) {
  dotenv.config({ path: process.env.ENV_FILE });
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().optional(),
    REDIS_URL: z.string().optional(),
    APP_ENCRYPTION_KEY: z.string().optional(),
    OPENAI_API_KEY: z.string().optional(),
    ETSY_API_KEY: z.string().optional(),
    ETSY_ACCESS_TOKEN: z.string().optional(),
    ETSY_SHOP_ID: z.string().optional(),
    STABILITY_API_KEY: z.string().optional(),
    SHOPIFY_API_KEY: z.string().optional(),
    SHOPIFY_ACCESS_TOKEN: z.string().optional(),
    SHOPIFY_SHOP_DOMAIN: z.string().optional(),
    AMAZON_ASSOCIATE_TAG: z.string().optional(),
    AMAZON_ACCESS_KEY: z.string().optional(),
    AMAZON_SECRET_KEY: z.string().optional(),
    GOOGLE_TRENDS_API_KEY: z.string().optional(),
    ADMIN_API_TOKEN: z.string().optional(),
    LOGGER_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    JOB_CONCURRENCY: z.coerce.number().int().positive().optional(),
    CRON_ENABLED: z
      .string()
      .optional()
      .default("true")
      .transform((value) => value.toLowerCase() === "true"),
  });

export type Env = z.infer<typeof envSchema>;

export const env: Env = (() => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("\n");
      console.error("Environment validation failed:\n", message);
    }
    throw error;
  }
})();
