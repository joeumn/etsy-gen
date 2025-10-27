import { createWorker } from "./base";
import { buildStageProcessor } from "./stageProcessor";
import { QueuePayload } from "./enqueue";
import { runListStage } from "../modules/list";

export const listWorker = createWorker<QueuePayload>(
  "list",
  buildStageProcessor("list", async ({ jobId, metadata }) =>
    runListStage({
      jobId,
      metadata,
    }),
  ),
);
