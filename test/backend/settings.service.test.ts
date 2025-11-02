import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFakePrisma } from "../utils/fakePrisma";

describe("SettingsService", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("persists and retrieves settings by namespace", async () => {
    const fake = createFakePrisma();
    vi.doMock("../../src/config/db", () => fake);

    const { SettingsService } = await import("../../src/services/settingsService");

    await SettingsService.set("feature.toggle", { enabled: true });
    await SettingsService.set("feature.toggle", { enabled: false }, "beta");

    const globalValue = await SettingsService.get("feature.toggle");
    const betaValue = await SettingsService.get("feature.toggle", "beta");
    const listed = await SettingsService.list();

    expect(globalValue).toEqual({ enabled: true });
    expect(betaValue).toEqual({ enabled: false });
    expect(listed).toHaveLength(1);
    expect(listed[0]).toMatchObject({
      key: "feature.toggle",
      namespace: "global",
    });
  });
});
