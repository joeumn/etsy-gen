import { Queue, QueueScheduler } from "bullmq";
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

const createScheduler = (name: string) =>
  new QueueScheduler(name, {
    connection: duplicateConnection(),
  });

export const scrapeQueue = createQueue("scrape");
export const analyzeQueue = createQueue("analyze");
export const generateQueue = createQueue("generate");
export const listQueue = createQueue("list");

export const schedulers = [
  createScheduler("scrape"),
  createScheduler("analyze"),
  createScheduler("generate"),
  createScheduler("list"),
];

export const waitForQueueInfrastructure = async () => {
  await Promise.all(schedulers.map((scheduler) => scheduler.waitUntilReady()));
};

export const workerConcurrency = concurrency;
