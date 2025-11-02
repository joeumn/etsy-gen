import dotenv from "dotenv";
import { z } from "zod";

if (!process.env.SKIP_ENV_LOAD) {
  dotenv.config({ path: process.env.ENV_FILE });
}

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z
      .string()
      .min(1, "DATABASE_URL is required for database connectivity"),
    REDIS_URL: z.string().url("REDIS_URL must be a valid redis connection string"),
    APP_ENCRYPTION_KEY: z
      .string()
      .min(
        32,
        "APP_ENCRYPTION_KEY must be at least 32 characters (256-bit) for encryption",
      ),
    OPENAI_API_KEY: z.string().optional(),
    ETSY_API_KEY: z.string().min(1, "ETSY_API_KEY is required for Etsy operations"),
    ETSY_SHOP_ID: z.string().min(1, "ETSY_SHOP_ID is required for Etsy operations"),
    STABILITY_API_KEY: z.string().optional(),
    SHOPIFY_API_KEY: z.string().optional(),
    AMAZON_ASSOCIATE_TAG: z.string().optional(),
    ADMIN_API_TOKEN: z.string().optional(),
    LOGGER_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    JOB_CONCURRENCY: z.coerce.number().int().positive().optional(),
    CRON_ENABLED: z
      .string()
      .optional()
      .transform((value) => {
        if (value === undefined) return undefined;
        return value.toLowerCase() === "true";
  })
      .default("true")
      .transform((value) => value === "true" || value === true),
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
