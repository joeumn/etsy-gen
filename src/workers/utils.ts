import type { JobStatus } from "../config/db";
import { db, supabase } from "../config/db";
import { env } from "../config/env";

const calculateDuration = (startedAt?: Date | null) => {
  if (!startedAt) {
    return null;
  }
  return Math.max(0, Date.now() - startedAt.getTime());
};

export const markJobRunning = async (jobId: string) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'RUNNING',
      attempts: supabase.rpc('increment', { x: 1, field_name: 'attempts' }),
      started_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const markJobSuccess = async (jobId: string, result: any) => {
  const existing = await db.job.findUnique({ where: { id: jobId } });
  const durationMs = calculateDuration(existing?.started_at);

  return db.job.update({
    where: { id: jobId },
    data: {
      status: 'SUCCESS',
      result,
      completed_at: new Date(),
      duration_ms: durationMs ?? undefined,
    },
  });
};

export const markJobFailure = async (
  jobId: string,
  error: unknown,
  status: JobStatus = 'FAILED',
) => {
  const existing = await db.job.findUnique({ where: { id: jobId } });
  const durationMs = calculateDuration(existing?.started_at);
  const normalized = normalizeError(error);

  return db.job.update({
    where: { id: jobId },
    data: {
      status,
      error: normalized,
      completed_at: new Date(),
      duration_ms: durationMs ?? undefined,
    },
  });
};

export const normalizeError = (error: unknown): Record<string, any> => {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: env.NODE_ENV === "development" ? error.stack : undefined,
    };
  }
  return {
    message: "Unknown error",
    detail: typeof error === "object" && error !== null ? JSON.parse(JSON.stringify(error)) : String(error)
  };
};

export const markJobRetrying = async (jobId: string) =>
  db.job.update({
    where: { id: jobId },
    data: {
      status: 'RETRYING',
    },
  });
