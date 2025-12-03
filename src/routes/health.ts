import { Router } from "express";
import { checkDatabaseConnection } from "../config/db";
import { redis } from "../config/redis";
import { metricsRegister } from "../config/metrics";

export const health = Router();

health.get("/healthz", async (_req, res) => {
  try {
    const connected = await checkDatabaseConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
});

health.get("/readyz", async (_req, res) => {
  try {
    const connected = await checkDatabaseConnection();
    if (!connected) {
      throw new Error("Database connection failed");
    }
    await redis.ping();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : "unknown error",
    });
  }
});

health.get("/metrics", async (_req, res) => {
  res.setHeader("Content-Type", metricsRegister.contentType);
  res.send(await metricsRegister.metrics());
});
