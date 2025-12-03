// Redis is only needed for the Express server, not for Next.js
// This file will only work when ioredis is installed
import { env } from "./env";
import { logger } from "./logger";

// Conditional import to avoid build errors in Next.js
let IORedis: any;
let Redis: any;

try {
  const ioredis = require("ioredis");
  IORedis = ioredis.default || ioredis;
  Redis = ioredis.Redis;
} catch (e) {
  // ioredis not available - create stub
  logger.warn("Redis not available - using stub implementation");
}

declare global {
  // eslint-disable-next-line no-var
  var __redis__: any | undefined;
}

const createRedis = () => {
  if (!env.REDIS_URL) {
    throw new Error("REDIS_URL is not configured");
  }
  if (!IORedis) {
    throw new Error("ioredis is not installed");
  }
  return new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  });
};

export const redis: any =
  global.__redis__ ??
  (() => {
    try {
      const client = createRedis();
      client.on("error", (error: any) => {
        logger.error({ err: error }, "Redis connection error");
      });
      client.on("connect", () => {
        logger.debug("Redis connected");
      });
      if (env.NODE_ENV !== "production") {
        global.__redis__ = client;
      }
      return client;
    } catch (error) {
      logger.warn({ err: error }, "Failed to create Redis client");
      // Return a stub that won't break imports
      return {
        get: async () => null,
        set: async () => "OK",
        del: async () => 0,
        exists: async () => 0,
        expire: async () => 0,
        on: () => {},
      };
    }
  })();
