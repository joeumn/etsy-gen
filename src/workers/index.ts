import { logger } from "../config/logger";
import { waitForQueueInfrastructure } from "../queues";
import { analyzeWorker } from "./analyze";
import { generateWorker } from "./generate";
import { listWorker } from "./list";
import { scrapeWorker } from "./scrape";

const workers = [scrapeWorker, analyzeWorker, generateWorker, listWorker];

const bootstrap = async () => {
  await waitForQueueInfrastructure();
  logger.info("Queue infrastructure ready, workers listening");
};

bootstrap().catch((error) => {
  logger.error({ err: error }, "Failed to bootstrap workers");
  process.exit(1);
});

const shutdown = async () => {
  logger.info("Shutting down workers");
  await Promise.all(workers.map((worker) => worker.close()));
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
