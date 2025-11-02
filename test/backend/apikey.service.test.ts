import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma } from "../utils/fakePrisma";

describe("ApiKeyService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("encrypts and decrypts API keys", async () => {
    const fake = createFakePrisma();
    vi.doMock("../../src/config/db", () => fake);

    const { ApiKeyService } = await import("../../src/services/apiKeyService");

    const stored = await ApiKeyService.setKey("openai", "sk-test-1234");
    expect(stored.maskedValue).toBe("****1234");

    const decrypted = await ApiKeyService.getDecryptedKey("openai");
    expect(decrypted).toBe("sk-test-1234");

    const metadata = await ApiKeyService.listMetadata();
    expect(metadata).toHaveLength(1);
    expect(metadata[0].name).toBe("openai");
  });
});
