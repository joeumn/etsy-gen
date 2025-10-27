import { createWorker } from "./base";
import { buildStageProcessor } from "./stageProcessor";
import { QueuePayload } from "./enqueue";
import { runAnalyzeStage } from "../modules/analyze";

export const analyzeWorker = createWorker<QueuePayload>(
  "analyze",
  buildStageProcessor("analyze", async ({ jobId, metadata }) =>
    runAnalyzeStage({
      jobId,
      metadata,
    }),
  ),
);
