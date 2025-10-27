import cron from "node-cron";
import "../config/env";
import { env } from "../config/env";
import { logger } from "../config/logger";
import {
  chainPipelineFrom,
  runStageWithDependencies,
} from "../services/orchestrator";

const schedules = [
  {
    name: "scrape",
    // At minute 0 every 6th hour
    spec: "0 */6 * * *",
    handler: () =>
      chainPipelineFrom("scrape").then((job) =>
        logger.info({ jobId: job.id }, "Scheduled scrape stage"),
      ),
  },
  {
    name: "analyze",
    // Offset by 5 minutes
    spec: "5 */6 * * *",
    handler: () =>
      runStageWithDependencies("analyze", {
        chainNext: true,
        context: { trigger: "cron" },
      }).then((job) =>
        logger.info({ jobId: job.id }, "Scheduled analyze stage"),
      ),
  },
  {
    name: "generate",
    spec: "10 */6 * * *",
    handler: () =>
      runStageWithDependencies("generate", {
        chainNext: true,
        context: { trigger: "cron" },
      }).then((job) =>
        logger.info({ jobId: job.id }, "Scheduled generate stage"),
      ),
  },
  {
    name: "list",
    spec: "15 */6 * * *",
    handler: () =>
      runStageWithDependencies("list", {
        chainNext: false,
        context: { trigger: "cron" },
      }).then((job) =>
        logger.info({ jobId: job.id }, "Scheduled list stage"),
      ),
  },
];

const bootstrap = () => {
  if (!env.CRON_ENABLED) {
    logger.warn("Cron disabled by environment flag");
    return;
  }

  schedules.forEach(({ spec, handler, name }) => {
    if (!cron.validate(spec)) {
      logger.error({ spec, name }, "Invalid cron expression");
      return;
    }

    cron.schedule(spec, () => {
      handler().catch((error) => {
        logger.error({ err: error, name }, "Cron job failed");
      });
    });

    logger.info({ spec, name }, "Registered cron schedule");
  });
};

bootstrap();
