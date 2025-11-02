import { createWorker } from "./base";
import { buildStageProcessor } from "./stageProcessor";
import { QueuePayload } from "./enqueue";
import { runGenerateStage } from "../modules/generate";

export const generateWorker = createWorker<QueuePayload>(
  "generate",
  buildStageProcessor("generate", async ({ jobId, metadata }) =>
    runGenerateStage({
      jobId,
      metadata,
    }),
  ),
);
