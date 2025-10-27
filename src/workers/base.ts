import { Worker, type Processor, type WorkerOptions } from "bullmq";
import { logger } from "../config/logger";
import { workerConcurrency } from "../queues";
import { redis } from "../config/redis";

const baseOptions: Omit<WorkerOptions, "connection"> = {
  concurrency: workerConcurrency,
};

export const createWorker = <T = unknown>(
  name: string,
  processor: Processor<T>,
  options?: Partial<WorkerOptions>,
) => {
  const worker = new Worker<T>(name, processor, {
    ...baseOptions,
    ...options,
    concurrency: options?.concurrency ?? baseOptions.concurrency,
    connection: redis.duplicate(),
  });

  worker.on("failed", (job, error) => {
    logger.error(
      { queue: name, jobId: job?.id, err: error },
      "Queue job failed",
    );
  });

  worker.on("completed", (job) => {
    logger.debug({ queue: name, jobId: job?.id }, "Queue job completed");
  });

  return worker;
};
