import { JobStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/db";
import { env } from "../config/env";

const calculateDuration = (startedAt?: Date | null) => {
  if (!startedAt) {
    return null;
  }
  return Math.max(0, Date.now() - startedAt.getTime());
};

export const markJobRunning = async (jobId: string) =>
  prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.RUNNING,
      attempts: { increment: 1 },
      startedAt: new Date(),
    },
  });

export const markJobSuccess = async (jobId: string, result: Prisma.InputJsonValue) => {
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  const durationMs = calculateDuration(existing?.startedAt);

  return prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.SUCCESS,
      result,
      completedAt: new Date(),
      durationMs: durationMs ?? undefined,
    },
  });
};

export const markJobFailure = async (
  jobId: string,
  error: unknown,
  status: JobStatus = JobStatus.FAILED,
) => {
  const existing = await prisma.job.findUnique({ where: { id: jobId } });
  const durationMs = calculateDuration(existing?.startedAt);
  const normalized = normalizeError(error);

  return prisma.job.update({
    where: { id: jobId },
    data: {
      status,
      error: normalized,
      completedAt: new Date(),
      durationMs: durationMs ?? undefined,
    },
  });
};

export const normalizeError = (error: unknown) => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  return { message: "Unknown error", detail: error };
};

export const markJobRetrying = async (jobId: string) =>
  prisma.job.update({
    where: { id: jobId },
    data: {
      status: JobStatus.RETRYING,
    },
  });
