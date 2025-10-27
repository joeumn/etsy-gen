import { createWorker } from "./base";
import { buildStageProcessor } from "./stageProcessor";
import { QueuePayload } from "./enqueue";
import { runScrapeStage } from "../modules/scrape";

export const scrapeWorker = createWorker<QueuePayload>(
  "scrape",
  buildStageProcessor("scrape", async ({ jobId, metadata }) =>
    runScrapeStage({
      jobId,
      metadata,
    }),
  ),
);
