import { describe, it, expect } from "vitest";
import { EX, type DayItem } from "./exercises";
import { buildDay, sessionMinutes } from "./tracks";
import {
  estimateExerciseKcal,
  estimateSessionKcal,
  estimateSessionMinutes,
  formatVolumeLabel,
} from "./workout-stats";

const reps = (reps = 8): DayItem => ({ id: "quadSet", ex: EX.quadSet, reps }); // cadence 6, perLeg false, 1.5 kcal/min
const timed = (secs = 30): DayItem => ({
  id: "calfStretchWall",
  ex: EX.calfStretchWall,
  secs,
}); // perLeg true, 1.5 kcal/min

describe("estimateExerciseKcal", () => {
  it("computes kcal from work seconds and the exercise's rate", () => {
    const item = reps(8); // workSecs = 8*6 = 48s = 0.8min
    expect(estimateExerciseKcal(item)).toBeCloseTo(0.8 * 1.5, 5);
  });
  it("accounts for perLeg doubling + switch time", () => {
    const item = timed(20); // workSecs = 20*2 + SWITCH_SECS(6) = 46s
    expect(estimateExerciseKcal(item)).toBeCloseTo((46 / 60) * 1.5, 5);
  });
});

describe("estimateSessionKcal", () => {
  it("sums and rounds across items", () => {
    const items = [reps(8), timed(20)];
    const expected = Math.round(
      estimateExerciseKcal(items[0]) + estimateExerciseKcal(items[1])
    );
    expect(estimateSessionKcal(items)).toBe(expected);
  });
  it("is 0 for an empty session", () => {
    expect(estimateSessionKcal([])).toBe(0);
  });
});

describe("estimateSessionMinutes", () => {
  it("matches tracks.ts's sessionMinutes() when no overrides are applied", () => {
    const items = buildDay(1, 0);
    expect(estimateSessionMinutes(items)).toBe(sessionMinutes(1, 0));
  });
  it("goes up when an item's volume is overridden higher", () => {
    const items = buildDay(1, 0);
    const bumped = items.map((it, i) =>
      i === 0 && it.ex.type === "reps" ? { ...it, reps: (it.reps ?? 0) + 50 } : it
    );
    expect(estimateSessionMinutes(bumped)).toBeGreaterThan(
      estimateSessionMinutes(items)
    );
  });
  it("is at least 1 minute for an empty session", () => {
    expect(estimateSessionMinutes([])).toBe(1);
  });
});

describe("formatVolumeLabel", () => {
  it("formats reps as × N", () => {
    expect(formatVolumeLabel(reps(8))).toBe("× 8");
  });
  it("formats seconds as m:ss", () => {
    expect(formatVolumeLabel(timed(30))).toBe("0:30");
  });
  it("pads single-digit seconds", () => {
    expect(formatVolumeLabel(timed(65))).toBe("1:05");
  });
});
