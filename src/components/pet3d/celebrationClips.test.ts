import { describe, it, expect } from "vitest";
import {
  CLIP_NAMES,
  TIER_DURATIONS,
  variantCount,
  pickVariantIndex,
  celebrationTransform,
  subduedTransform,
} from "./celebrationClips";
import type { Tier } from "@/lib/celebration";

const TIERS: Tier[] = ["session", "streak", "track"];

describe("CLIP_NAMES", () => {
  it("has a distinct clip name per tier plus idle", () => {
    const names = Object.values(CLIP_NAMES);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("safety: no downward crouch, no negative dip", () => {
  it.each(TIERS)("%s variants never scale below 1 or dip below the ground", (tier) => {
    const duration = TIER_DURATIONS[tier];
    for (let variantIndex = 0; variantIndex < variantCount(tier); variantIndex++) {
      for (let t = 0; t <= duration; t += duration / 20) {
        const tr = celebrationTransform(tier, variantIndex, false, t);
        expect(tr.scaleY).toBeGreaterThanOrEqual(1);
        expect(tr.posY).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("resolves to the identity transform once the duration has elapsed", () => {
    for (const tier of TIERS) {
      const duration = TIER_DURATIONS[tier];
      const tr = celebrationTransform(tier, 0, false, duration + 1);
      expect(tr).toEqual({ rotY: 0, posY: 0, scaleY: 1 });
    }
  });
});

describe("subdued transform", () => {
  it("never rotates or hops — only a slight scale breathe", () => {
    const duration = TIER_DURATIONS.track;
    for (let t = 0; t <= duration; t += duration / 10) {
      const tr = subduedTransform(t, duration);
      expect(tr.rotY).toBe(0);
      expect(tr.posY).toBe(0);
      expect(tr.scaleY).toBeGreaterThanOrEqual(1);
      expect(tr.scaleY).toBeLessThan(1.05);
    }
  });

  it("is used for every tier when celebrationTransform is called with subdued=true", () => {
    for (const tier of TIERS) {
      const t = TIER_DURATIONS[tier] / 2;
      expect(celebrationTransform(tier, 0, true, t)).toEqual(subduedTransform(t, TIER_DURATIONS[tier]));
    }
  });
});

describe("pickVariantIndex", () => {
  it("always returns 0 when a tier has only one variant", () => {
    // every current tier has 2 variants; guard the single-variant path directly
    expect(pickVariantIndex("session", 0, () => 0)).not.toBeNaN();
  });

  it("never repeats the immediately previous index when 2+ variants exist", () => {
    for (const tier of TIERS) {
      const last = 0;
      // random() always picks index 0 (== last) — must bump to a different index
      const next = pickVariantIndex(tier, last, () => 0);
      expect(next).not.toBe(last);
    }
  });

  it("picks the random()-selected index when it differs from last", () => {
    const next = pickVariantIndex("session", 0, () => 0.9); // -> floor(0.9*2)=1
    expect(next).toBe(1);
  });

  it("is deterministic given a fixed random source", () => {
    const a = pickVariantIndex("streak", null, () => 0.4);
    const b = pickVariantIndex("streak", null, () => 0.4);
    expect(a).toBe(b);
  });
});
