import { db, supabase } from "../config/db";

export type Namespace = string;

export interface SettingRecord<T = any> {
  namespace: Namespace;
  key: string;
  value: T;
}

const DEFAULT_NAMESPACE = "global";

export class SettingsService {
  static async list(namespace: Namespace = DEFAULT_NAMESPACE) {
    const { data: settings, error } = await supabase
      .from('settings')
      .select('*')
      .eq('namespace', namespace)
      .order('key', { ascending: true });

    if (error) throw error;
    if (!settings) return [];

    return settings.map((setting: any) => ({
      namespace: setting.namespace,
      key: setting.key,
      value: setting.value,
      updatedAt: setting.updated_at,
    }));
  }

  static async get<T = any>(
    key: string,
    namespace: Namespace = DEFAULT_NAMESPACE,
  ): Promise<T | null> {
    const setting = await db.setting.findUnique({
      where: {
        namespace_key: {
          namespace,
          key,
        },
      },
    });
    return (setting?.value as T) ?? null;
  }

  static async set<T = any>(
    key: string,
    value: T,
    namespace: Namespace = DEFAULT_NAMESPACE,
  ) {
    const setting = await db.setting.upsert({
      where: {
        namespace_key: {
          namespace,
          key,
        },
      },
      create: {
        namespace,
        key,
        value: value as any,
      },
      update: {
        value: value as any,
      },
    });

    return {
      namespace: setting.namespace,
      key: setting.key,
      value: setting.value as T,
      updatedAt: setting.updated_at,
    };
  }
}
