import { PrismaClient } from "@prisma/client";
import { env } from "./env";
import { logger } from "./logger";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

const createClient = () =>
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });

export const prisma: PrismaClient =
  global.__prisma__ ??
  (() => {
    const client = createClient();
    client.$connect().catch((error) => {
      logger.error({ err: error }, "Failed to connect to database");
    });
    if (env.NODE_ENV !== "production") {
      global.__prisma__ = client;
    }
    return client;
  })();
