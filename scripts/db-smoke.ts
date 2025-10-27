import "../src/config/env";
import { prisma } from "../src/config/db";
import { logger } from "../src/config/logger";

const namespace = "healthcheck";

async function main() {
  const key = `smoke-${Date.now()}`;
  logger.info("Running DB smoke test");

  const created = await prisma.setting.upsert({
    where: {
      namespace_key: {
        namespace,
        key,
      },
    },
    create: {
      namespace,
      key,
      value: { ok: true, at: new Date().toISOString() },
    },
    update: {
      value: { ok: true, refreshedAt: new Date().toISOString() },
    },
  });

  const readBack = await prisma.setting.findUnique({
    where: { id: created.id },
  });

  if (!readBack) {
    throw new Error("Smoke test failed to read back created setting");
  }

  await prisma.setting.delete({ where: { id: created.id } });
  logger.info("DB smoke test completed");
}

main()
  .catch((error) => {
    logger.error({ err: error }, "DB smoke test failed");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
