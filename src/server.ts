import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import { env } from "./config/env";
import { logger } from "./config/logger";
import { health } from "./routes/health";
import { registerAdminRoutes } from "./routes/admin";

export const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

app.use(health);
registerAdminRoutes(app);

app.use(
  (
    error: Error,
    _req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _next: NextFunction,
  ) => {
    logger.error({ err: error }, "Unhandled error in request pipeline");
    res.status(500).json({
      ok: false,
      error: env.NODE_ENV === "development" ? error.message : "Internal Server Error",
    });
  },
);

const port = env.PORT;

if (require.main === module) {
  app.listen(port, () => logger.info({ port }, "etsy-gen backend listening"));
}
