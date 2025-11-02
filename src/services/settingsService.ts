import { Prisma } from "@prisma/client";
import { prisma } from "../config/db";

export type Namespace = string;

export interface SettingRecord<T extends Prisma.JsonValue = Prisma.JsonValue> {
  namespace: Namespace;
  key: string;
  value: T;
}

const DEFAULT_NAMESPACE = "global";

export class SettingsService {
  static async list(namespace: Namespace = DEFAULT_NAMESPACE) {
    const settings = await prisma.setting.findMany({
      where: { namespace },
      orderBy: { key: "asc" },
    });

    return settings.map((setting) => ({
      namespace: setting.namespace,
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updatedAt,
    }));
  }

  static async get<T extends Prisma.JsonValue = Prisma.JsonValue>(
    key: string,
    namespace: Namespace = DEFAULT_NAMESPACE,
  ): Promise<T | null> {
    const setting = await prisma.setting.findUnique({
      where: {
        namespace_key: {
          namespace,
          key,
        },
      },
    });
    return (setting?.value as T) ?? null;
  }

  static async set<T extends Prisma.JsonValue = Prisma.JsonValue>(
    key: string,
    value: T,
    namespace: Namespace = DEFAULT_NAMESPACE,
  ) {
    const setting = await prisma.setting.upsert({
      where: {
        namespace_key: {
          namespace,
          key,
        },
      },
      create: {
        namespace,
        key,
        value: value as Prisma.InputJsonValue,
      },
      update: {
        value: value as Prisma.InputJsonValue,
      },
    });

    return {
      namespace: setting.namespace,
      key: setting.key,
      value: setting.value as T,
      updatedAt: setting.updatedAt,
    };
  }
}
