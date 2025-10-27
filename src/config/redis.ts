import IORedis, { Redis } from "ioredis";
import { env } from "./env";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __redis__: Redis | undefined;
}

const createRedis = () =>
  new IORedis(env.REDIS_URL, {
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
  });

export const redis: Redis =
  global.__redis__ ??
  (() => {
    const client = createRedis();
    client.on("error", (error) => {
      logger.error({ err: error }, "Redis connection error");
    });
    client.on("connect", () => {
      logger.debug("Redis connected");
    });
    if (env.NODE_ENV !== "production") {
      global.__redis__ = client;
    }
    return client;
  })();
