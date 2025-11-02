import OpenAI from "openai";
import { ApiKeyService } from "../services/apiKeyService";
import { env } from "../config/env";
import { logger } from "../config/logger";

let cachedClient: OpenAI | null = null;
let resolvedKey: string | null = null;

/**
 * Invalidates the cached API key and client.
 * Should be called when the API key is updated via ApiKeyService.
 */
export const invalidateCache = (): void => {
  resolvedKey = null;
  cachedClient = null;
};

const getApiKey = async (): Promise<string | null> => {
  if (resolvedKey) {
    return resolvedKey;
  }

  const stored = await ApiKeyService.getDecryptedKey("openai");
  if (stored) {
    resolvedKey = stored;
    return resolvedKey;
  }

  if (env.OPENAI_API_KEY) {
    resolvedKey = env.OPENAI_API_KEY;
    return resolvedKey;
  }

  return null;
};

const getClient = async (): Promise<OpenAI | null> => {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = await getApiKey();
  if (!apiKey) {
    logger.warn("OpenAI API key not configured; using fallback responses");
    return null;
  }

  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
};

export interface CompletionOptions {
  systemPrompt?: string;
  temperature?: number;
}

export const generateText = async (
  prompt: string,
  options: CompletionOptions = {},
) => {
  const client = await getClient();
  if (!client) {
    return {
      text: `Fallback summary:\n${prompt.slice(0, 280)}`,
    };
  }

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          options.systemPrompt ??
          "You are an ecommerce strategist who writes concise insights.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: options.temperature ?? 0.4,
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  return { text };
};
