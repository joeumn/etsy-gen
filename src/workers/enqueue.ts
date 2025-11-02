import { Queue } from "bullmq";
import { JobStage } from "@prisma/client";
import { analyzeQueue, generateQueue, listQueue, scrapeQueue } from "../queues";
import { PipelineStage } from "../services/orchestrator";

const queueForStage: Record<PipelineStage, Queue> = {
  scrape: scrapeQueue,
  analyze: analyzeQueue,
  generate: generateQueue,
  list: listQueue,
};

export interface QueuePayload {
  jobId: string;
  stage: PipelineStage;
  startedAt?: string;
  metadata?: Record<string, unknown> & {
    chainNext?: boolean;
  };
}

const stageToEnum: Record<PipelineStage, JobStage> = {
  scrape: JobStage.SCRAPE,
  analyze: JobStage.ANALYZE,
  generate: JobStage.GENERATE,
  list: JobStage.LIST,
};

export const enqueueStageJob = async (
  stage: PipelineStage,
  jobId: string,
  jobKey: string,
  metadata?: Record<string, unknown>,
) => {
  const queue = queueForStage[stage];

  await queue.add(
    stage,
    {
      jobId,
      stage,
      stageEnum: stageToEnum[stage],
      metadata,
    },
    {
      jobId: jobKey,
      delay: 0,
    },
  );
};
