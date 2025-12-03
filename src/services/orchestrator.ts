import {
  type JobStage,
  type JobStatus,
  type Job,
} from "../config/db";
import { db } from "../config/db";
import { logger } from "../config/logger";
import { enqueueStageJob } from "../workers/enqueue";

export const pipelineStages = ["scrape", "analyze", "generate", "list"] as const;

export type PipelineStage = (typeof pipelineStages)[number];

export interface RunOptions {
  manual?: boolean;
  parentJobId?: string;
  context?: any;
  chainNext?: boolean;
}

const stageToEnum: Record<PipelineStage, JobStage> = {
  scrape: 'SCRAPE',
  analyze: 'ANALYZE',
  generate: 'GENERATE',
  list: 'LIST',
};

const nextStage: Record<PipelineStage, PipelineStage | null> = {
  scrape: "analyze",
  analyze: "generate",
  generate: "list",
  list: null,
};

export const getNextStage = (stage: PipelineStage) => nextStage[stage] ?? null;

const windowMs = 6 * 60 * 60 * 1000;

const normalizeJobKey = (stage: PipelineStage, manual: boolean) =>
  manual
    ? `${stage}:manual:${Date.now()}`
    : `${stage}:auto:${Math.floor(Date.now() / windowMs)}`;

export const runStageWithDependencies = async (
  stage: PipelineStage,
  options: RunOptions = {},
) => {
  const jobKey = normalizeJobKey(
    stage,
    options.manual ?? false,
  );

  try {
    const job = await db.job.create({
      data: {
        job_key: jobKey,
        stage: stageToEnum[stage],
        status: 'PENDING',
        metadata: {
          ...(options.context as Record<string, unknown> | undefined),
          chainNext: options.chainNext ?? false,
          manual: options.manual ?? false,
        },
        parent_job_id: options.parentJobId,
      },
    });

    await enqueueStageJob(stage, job.id, jobKey, {
      chainNext: options.chainNext,
    });

    return job;
  } catch (error: any) {
    // Check for unique constraint violation (duplicate job_key)
    if (error?.code === '23505' || error?.message?.includes('duplicate key')) {
      const existing = await db.job.findUnique({
        where: { job_key: jobKey },
      });
      if (existing) {
        return existing;
      }
    }
    throw error;
  }
};

export const chainPipelineFrom = async (
  startStage: PipelineStage,
  initialParent?: Job,
) => {
  const job = await runStageWithDependencies(startStage, {
    parentJobId: initialParent?.id,
    chainNext: getNextStage(startStage) !== null,
  });

  logger.info({ stage: startStage, jobId: job.id }, "Queued pipeline from orchestrator");
  return job;
};
