import { decryptSecret, encryptSecret, maskSecret } from "../lib/crypto";
import { db } from "../config/db";
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
    metadata?: any,
  ): Promise<ApiKeyMeta> {
    const trimmed = value.trim();
    const encrypted = encryptSecret(trimmed);

    const record = await db.apiKey.upsert({
      where: {
        namespace_name: {
          namespace,
          name,
        },
      },
      create: {
        namespace,
        name,
        encrypted_value: encrypted.value,
        iv: encrypted.iv,
        last_four: encrypted.lastFour,
        metadata,
      },
      update: {
        encrypted_value: encrypted.value,
        iv: encrypted.iv,
        last_four: encrypted.lastFour,
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
        logger.warn({ error }, "Failed to invalidate AI cache");
      }
    }

    return {
      name: record.name,
      namespace: record.namespace,
      lastFour: record.last_four,
      maskedValue: maskSecret(record.last_four),
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  static async getDecryptedKey(name: string, namespace = DEFAULT_NAMESPACE) {
    const record = await db.apiKey.findUnique({
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

    return decryptSecret(record.encrypted_value, record.iv);
  }

  static async listMetadata(namespace = DEFAULT_NAMESPACE): Promise<ApiKeyMeta[]> {
    // Note: db.apiKey doesn't have findMany, need to use supabase directly
    const { supabase } = await import("../config/db");
    const { data: keys, error } = await supabase
      .from('api_keys')
      .select('*')
      .eq('namespace', namespace)
      .order('name', { ascending: true });

    if (error) throw error;
    if (!keys) return [];

    return keys.map((key: any) => ({
      name: key.name,
      namespace: key.namespace,
      lastFour: key.last_four,
      maskedValue: maskSecret(key.last_four),
      createdAt: key.created_at,
      updatedAt: key.updated_at,
    }));
  }
}
