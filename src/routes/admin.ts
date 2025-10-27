import type { Application, NextFunction, Request, Response } from "express";
import { Router } from "express";
import { z } from "zod";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { ApiKeyService } from "../services/apiKeyService";
import { SettingsService } from "../services/settingsService";
import {
  PipelineStage,
  pipelineStages,
  runStageWithDependencies,
} from "../services/orchestrator";

const settingSchema = z.object({
  namespace: z.string().min(1).default("global"),
  key: z.string().min(1),
  value: z.any(),
});

const settingsBodySchema = z.union([
  settingSchema,
  z.object({
    settings: z.array(settingSchema),
  }),
]);

const apiKeyBodySchema = z.object({
  namespace: z.string().min(1).default("global"),
  name: z.string().min(1),
  value: z.string().min(1),
});

const requireAdminToken = (req: Request, res: Response, next: NextFunction) => {
  if (!env.ADMIN_API_TOKEN) {
    return next();
  }

  const headerToken =
    (req.headers["x-admin-token"] as string | undefined) ??
    (req.headers.authorization?.replace(/^bearer\s+/i, "") ?? undefined);

  if (headerToken !== env.ADMIN_API_TOKEN) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }

  return next();
};

const asyncHandler =
  (handler: (req: Request, res: Response) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction) =>
    handler(req, res).catch(next);

const parseStage = (stage: string): PipelineStage | null => {
  if (pipelineStages.includes(stage as PipelineStage)) {
    return stage as PipelineStage;
  }
  return null;
};

export const registerAdminRoutes = (app: Application) => {
  const router = Router();

  router.use(requireAdminToken);

  router.get(
    "/settings",
    asyncHandler(async (req, res) => {
      const namespace = (req.query.namespace as string | undefined) ?? "global";
      const settings = await SettingsService.list(namespace);
      res.json({ ok: true, data: settings });
    }),
  );

  router.post(
    "/settings",
    asyncHandler(async (req, res) => {
      const parsed = settingsBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          error: parsed.error.errors.map((issue) => issue.message).join(", "),
        });
      }

      const payload = Array.isArray((parsed.data as { settings?: unknown }).settings)
        ? (parsed.data as { settings: z.infer<typeof settingSchema>[] }).settings
        : [parsed.data as z.infer<typeof settingSchema>];

      const saved = await Promise.all(
        payload.map((item) =>
          SettingsService.set(item.key, item.value, item.namespace),
        ),
      );

      res.status(201).json({ ok: true, data: saved });
    }),
  );

  router.get(
    "/keys/meta",
    asyncHandler(async (req, res) => {
      const namespace = (req.query.namespace as string | undefined) ?? "global";
      const keys = await ApiKeyService.listMetadata(namespace);
      res.json({ ok: true, data: keys });
    }),
  );

  router.post(
    "/keys",
    asyncHandler(async (req, res) => {
      const parsed = apiKeyBodySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          error: parsed.error.errors.map((issue) => issue.message).join(", "),
        });
      }

      const { namespace, name, value } = parsed.data;
      const stored = await ApiKeyService.setKey(name, value, namespace);
      res.status(201).json({ ok: true, data: stored });
    }),
  );

  router.post(
    "/run/:stage",
    asyncHandler(async (req, res) => {
      const stage = parseStage(req.params.stage);
      if (!stage) {
        return res
          .status(400)
          .json({ ok: false, error: `Unknown stage "${req.params.stage}"` });
      }

      const job = await runStageWithDependencies(stage, {
        manual: true,
      });

      logger.info({ stage, jobId: job.id }, "Triggered manual pipeline stage");
      res.status(202).json({ ok: true, data: job });
    }),
  );

  app.use("/api/admin", router);
};
