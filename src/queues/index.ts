import { Queue } from "bullmq";
import { env } from "../config/env";
import { redis } from "../config/redis";

const concurrency = env.JOB_CONCURRENCY ?? 3;

const defaultJobOptions = {
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 60_000,
  },
  removeOnComplete: {
    count: 500,
  },
  removeOnFail: {
    count: 2000,
  },
  timeout: 15 * 60 * 1000,
};

const duplicateConnection = () =>
  redis.duplicate({
    maxRetriesPerRequest: null,
  });

const createQueue = (name: string) =>
  new Queue(name, {
    connection: duplicateConnection(),
    defaultJobOptions,
  });

export const scrapeQueue = createQueue("scrape");
export const analyzeQueue = createQueue("analyze");
export const generateQueue = createQueue("generate");
export const listQueue = createQueue("list");

export const queues = [scrapeQueue, analyzeQueue, generateQueue, listQueue];

export const waitForQueueInfrastructure = async () => {
  await Promise.all(queues.map((queue) => queue.waitUntilReady()));
};

export const workerConcurrency = concurrency;
