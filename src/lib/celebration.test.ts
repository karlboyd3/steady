import { describe, it, expect } from "vitest";
import { pickTier, isSubdued, STREAK_THRESHOLDS, SKIP_SUBDUED_THRESHOLD } from "./celebration";

describe("pickTier — track (day 10/20/30)", () => {
  it.each([10, 20, 30])("fires track on day %i when newly completed", (day) => {
    expect(pickTier({ day, alreadyDone: false, prevStreak: 5, newStreak: 6 })).toBe("track");
  });

  it.each([9, 11, 19, 21, 29])("does not fire track on day %i", (day) => {
    expect(pickTier({ day, alreadyDone: false, prevStreak: 5, newStreak: 6 })).not.toBe("track");
  });

  it("does not re-fire track on a repeat of day 10/20/30", () => {
    expect(pickTier({ day: 10, alreadyDone: true, prevStreak: 5, newStreak: 5 })).toBe("session");
  });

  it("track outranks streak on the same day", () => {
    expect(pickTier({ day: 10, alreadyDone: false, prevStreak: 6, newStreak: 7 })).toBe("track");
  });
});

describe("pickTier — streak thresholds", () => {
  it.each(STREAK_THRESHOLDS)("fires streak when newStreak just becomes %i", (n) => {
    expect(pickTier({ day: 5, alreadyDone: false, prevStreak: n - 1, newStreak: n })).toBe(
      "streak"
    );
  });

  it("does not fire streak for a non-threshold streak value", () => {
    expect(pickTier({ day: 5, alreadyDone: false, prevStreak: 4, newStreak: 5 })).toBe("session");
  });

  it("does not fire streak when the streak didn't change (repeat)", () => {
    expect(pickTier({ day: 5, alreadyDone: true, prevStreak: 7, newStreak: 7 })).toBe("session");
  });

  it("does not fire streak merely for already being at a threshold without crossing it", () => {
    // e.g. prevStreak already 7 and newStreak also 7 (shouldn't happen via nextStreak, but defend anyway)
    expect(pickTier({ day: 5, alreadyDone: false, prevStreak: 7, newStreak: 7 })).toBe("session");
  });
});

describe("pickTier — session floor", () => {
  it("falls back to session for an ordinary day with no streak crossing", () => {
    expect(pickTier({ day: 4, alreadyDone: false, prevStreak: 1, newStreak: 2 })).toBe("session");
  });

  it("fires session on a repeat of a non-milestone day", () => {
    expect(pickTier({ day: 4, alreadyDone: true, prevStreak: 3, newStreak: 3 })).toBe("session");
  });
});

describe("isSubdued", () => {
  it("is not subdued for a clean, fully-completed session", () => {
    expect(isSubdued({ skippedCount: 0, totalCount: 6, pain: null })).toBe(false);
    expect(isSubdued({ skippedCount: 0, totalCount: 6, pain: "good" })).toBe(false);
    expect(isSubdued({ skippedCount: 0, totalCount: 6, pain: "sore" })).toBe(false);
  });

  it("is subdued for sharp pain regardless of skip rate", () => {
    expect(isSubdued({ skippedCount: 0, totalCount: 6, pain: "sharp" })).toBe(true);
  });

  it("is not subdued for sore/good even with some skips under the threshold", () => {
    expect(isSubdued({ skippedCount: 2, totalCount: 6, pain: "sore" })).toBe(false); // 33%
  });

  it("respects the skip-fraction boundary", () => {
    expect(isSubdued({ skippedCount: 2, totalCount: 6, pain: null })).toBe(false); // 33% < 50%
    expect(isSubdued({ skippedCount: 3, totalCount: 6, pain: null })).toBe(true); // exactly 50%
    expect(isSubdued({ skippedCount: 4, totalCount: 6, pain: null })).toBe(true); // 67%
  });

  it("treats a zero-exercise session as 0% skipped, not subdued by skip rate", () => {
    expect(isSubdued({ skippedCount: 0, totalCount: 0, pain: null })).toBe(false);
  });

  it("SKIP_SUBDUED_THRESHOLD is exactly 0.5", () => {
    expect(SKIP_SUBDUED_THRESHOLD).toBe(0.5);
  });
});
