import { JobStatus, Prisma } from "@prisma/client";
import type { Job, Processor } from "bullmq";
import { logger } from "../config/logger";
import { jobDurationHistogram, jobFailureCounter } from "../config/metrics";
import {
  getNextStage,
  PipelineStage,
  runStageWithDependencies,
} from "../services/orchestrator";
import { QueuePayload } from "./enqueue";
import { markJobFailure, markJobRunning, markJobSuccess } from "./utils";

interface StageContext {
  job: Job<QueuePayload>;
  jobId: string;
  metadata?: Record<string, unknown>;
}

export type StageRunner = (
  ctx: StageContext,
) => Promise<Prisma.InputJsonValue | null | undefined>;

export const buildStageProcessor = (
  stage: PipelineStage,
  runner: StageRunner,
): Processor<QueuePayload> => {
  return async (job) => {
    const startedAt = Date.now();
    await markJobRunning(job.data.jobId);

    try {
      const result = await runner({
        job,
        jobId: job.data.jobId,
        metadata: job.data.metadata,
      });

      const persisted = await markJobSuccess(job.data.jobId, result ?? {});
      const duration = Date.now() - startedAt;
      jobDurationHistogram.observe(
        { stage, status: "success" },
        Math.max(duration, 0),
      );

      if (job.data.metadata?.chainNext) {
        const nextStage = getNextStage(stage);
        if (nextStage) {
          await runStageWithDependencies(nextStage, {
            parentJobId: persisted.id,
            chainNext: getNextStage(nextStage) !== null,
          });
        }
      }
    } catch (error) {
      logger.error({ err: error, stage, jobId: job.data.jobId }, "Stage failed");
      const attempts = job.opts.attempts ?? 1;
      const remaining = attempts - (job.attemptsMade + 1);
      await markJobFailure(
        job.data.jobId,
        error,
        remaining > 0 ? JobStatus.RETRYING : JobStatus.FAILED,
      );
      const duration = Date.now() - startedAt;
      jobFailureCounter.inc({ stage });
      jobDurationHistogram.observe(
        { stage, status: "failure" },
        Math.max(duration, 0),
      );
      throw error;
    }
  };
};
