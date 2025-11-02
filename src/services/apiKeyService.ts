import { Prisma } from "@prisma/client";
import { decryptSecret, encryptSecret, maskSecret } from "../lib/crypto";
import { prisma } from "../config/db";
import { logger } from "../config/logger";

export interface ApiKeyMeta {
  name: string;
  namespace: string;
  lastFour: string;
  maskedValue: string;
  updatedAt: Date;
  createdAt: Date;
}

const DEFAULT_NAMESPACE = "global";

export class ApiKeyService {
  static async setKey(
    name: string,
    value: string,
    namespace = DEFAULT_NAMESPACE,
    metadata?: Prisma.InputJsonValue,
  ): Promise<ApiKeyMeta> {
    const trimmed = value.trim();
    const encrypted = encryptSecret(trimmed);

    const record = await prisma.apiKey.upsert({
      where: {
        namespace_name: {
          namespace,
          name,
        },
      },
      create: {
        namespace,
        name,
        encryptedValue: encrypted.value,
        iv: encrypted.iv,
        lastFour: encrypted.lastFour,
        metadata,
      },
      update: {
        encryptedValue: encrypted.value,
        iv: encrypted.iv,
        lastFour: encrypted.lastFour,
        metadata,
      },
    });

    logger.info(
      { namespace, name },
      "Stored API key (value kept encrypted and masked in logs)",
    );

    // Invalidate AI cache when OpenAI key is updated
    if (name === "openai") {
      try {
        const { invalidateCache } = await import("../lib/ai");
        invalidateCache();
        logger.debug("Invalidated AI cache after OpenAI key update");
      } catch (error) {
        logger.warn("Failed to invalidate AI cache", { error });
      }
    }

    return {
      name: record.name,
      namespace: record.namespace,
      lastFour: record.lastFour,
      maskedValue: maskSecret(record.lastFour),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  static async getDecryptedKey(name: string, namespace = DEFAULT_NAMESPACE) {
    const record = await prisma.apiKey.findUnique({
      where: {
        namespace_name: {
          namespace,
          name,
        },
      },
    });

    if (!record) {
      return null;
    }

    return decryptSecret(record.encryptedValue, record.iv);
  }

  static async listMetadata(namespace = DEFAULT_NAMESPACE): Promise<ApiKeyMeta[]> {
    const keys = await prisma.apiKey.findMany({
      where: { namespace },
      orderBy: { name: "asc" },
    });

    return keys.map((key) => ({
      name: key.name,
      namespace: key.namespace,
      lastFour: key.lastFour,
      maskedValue: maskSecret(key.lastFour),
      createdAt: key.createdAt,
      updatedAt: key.updatedAt,
    }));
  }
}
