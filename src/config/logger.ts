import pino from "pino";
import { env } from "./env";

export const logger = pino({
  level: env.LOGGER_LEVEL,
  timestamp: pino.stdTimeFunctions.isoTime,
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        }
      : undefined,
});
