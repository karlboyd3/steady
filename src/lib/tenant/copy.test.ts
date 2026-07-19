import { describe, it, expect } from "vitest";
import { doneHeroCopy } from "./copy";
import { DEFAULT_TENANT } from "./types";

describe("doneHeroCopy", () => {
  it("uses the mascot line when mascotEnabled", () => {
    const tenant = { ...DEFAULT_TENANT, mascotEnabled: true };
    expect(doneHeroCopy(tenant, "Shelby", 12)).toBe(
      "12 minutes of steady work — Shelby is doing a happy dance."
    );
  });

  it("falls back to 'your buddy' when petName is empty", () => {
    const tenant = { ...DEFAULT_TENANT, mascotEnabled: true };
    expect(doneHeroCopy(tenant, "", 12)).toBe(
      "12 minutes of steady work — your buddy is doing a happy dance."
    );
  });

  it("uses clinical copy when mascotEnabled is false", () => {
    const tenant = { ...DEFAULT_TENANT, mascotEnabled: false };
    expect(doneHeroCopy(tenant, "Shelby", 12)).toBe(
      "12 minutes of steady work. Session complete."
    );
  });
});
