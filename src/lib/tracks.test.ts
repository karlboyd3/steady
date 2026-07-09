import { describe, it, expect } from "vitest";
import {
  TRACKS,
  buildDay,
  phaseOf,
  workSecs,
  sessionSeconds,
  sessionMinutes,
  PREP_SECS,
  REST_SECS,
  SWITCH_SECS,
} from "./tracks";

describe("phaseOf", () => {
  it("splits the 30 days into three 10-day phases", () => {
    expect(phaseOf(1)).toBe(0);
    expect(phaseOf(10)).toBe(0);
    expect(phaseOf(11)).toBe(1);
    expect(phaseOf(20)).toBe(1);
    expect(phaseOf(21)).toBe(2);
    expect(phaseOf(30)).toBe(2);
  });
});

/** step index used by the progression formula: +2 reps / +5s every 3 days. */
function stepFor(day: number): number {
  return Math.floor(((day - 1) % 10) / 3);
}

describe("buildDay progression (all tracks, days 1/4/10/11/30)", () => {
  const days = [1, 4, 10, 11, 30];
  TRACKS.forEach((track, ti) => {
    days.forEach((day) => {
      it(`${track.name} day ${day}: ids + volume match the plan & formula`, () => {
        const items = buildDay(day, ti);
        const plan = track.plans[phaseOf(day)];
        const step = stepFor(day);

        expect(items.map((i) => i.id)).toEqual(plan.map((p) => p.id));

        items.forEach((item, idx) => {
          const p = plan[idx];
          if (p.r != null) {
            expect(item.ex.type).toBe("reps");
            expect(item.reps).toBe(p.r + step * 2);
            expect(item.secs).toBeUndefined();
          } else {
            expect(item.ex.type).toBe("time");
            expect(item.secs).toBe((p.t ?? 0) + step * 5);
            expect(item.reps).toBeUndefined();
          }
        });
      });
    });
  });
});

describe("buildDay concrete anchors (Early Recovery)", () => {
  it("day 1 uses base volumes (step 0)", () => {
    const items = buildDay(1, 0);
    expect(items.map((i) => i.id)).toEqual([
      "quadSet",
      "heelSlide",
      "straightLegRaise",
      "gluteBridge",
      "seatedHamstringStretch",
      "calfStretchWall",
    ]);
    expect(items[0].reps).toBe(6);
    expect(items[2].reps).toBe(5);
    expect(items[4].secs).toBe(15);
  });

  it("day 4 adds one progression step (+2 reps / +5s)", () => {
    const items = buildDay(4, 0);
    expect(items[0].reps).toBe(8);
    expect(items[2].reps).toBe(7);
    expect(items[4].secs).toBe(20);
  });

  it("day 10 is the final phase-1 step (step 3: +6 / +15)", () => {
    const items = buildDay(10, 0);
    expect(items[0].reps).toBe(12);
    expect(items[2].reps).toBe(11);
    expect(items[5].secs).toBe(30);
  });

  it("day 11 resets to phase-2 base volumes", () => {
    const items = buildDay(11, 0);
    expect(items.map((i) => i.id)).toEqual([
      "quadSet",
      "straightLegRaise",
      "gluteBridge",
      "seatedKneeExtension",
      "sideLegRaise",
      "seatedHamstringStretch",
    ]);
    expect(items[0].reps).toBe(10);
    expect(items[3].reps).toBe(6);
    expect(items[5].secs).toBe(20);
  });

  it("day 30 is peak phase-3 volume", () => {
    const items = buildDay(30, 0);
    expect(items.map((i) => i.id)).toEqual([
      "sitToStand",
      "seatedKneeExtension",
      "standingHamstringCurl",
      "calfRaise",
      "calfStretchWall",
      "quadStretchStanding",
    ]);
    expect(items[0].reps).toBe(11);
    expect(items[3].reps).toBe(14);
    expect(items[4].secs).toBe(35);
  });
});

describe("workSecs & session totals", () => {
  it("doubles work + adds a switch for per-leg exercises", () => {
    const items = buildDay(1, 0);
    const heelSlide = items.find((i) => i.id === "heelSlide")!;
    const oneLeg = (heelSlide.reps ?? 0) * (heelSlide.ex.cadence ?? 0);
    expect(heelSlide.ex.perLeg).toBe(true);
    expect(workSecs(heelSlide)).toBe(oneLeg * 2 + SWITCH_SECS);
  });

  it("uses single work time for non-per-leg exercises", () => {
    const items = buildDay(1, 0);
    const quad = items.find((i) => i.id === "quadSet")!;
    expect(quad.ex.perLeg).toBe(false);
    expect(workSecs(quad)).toBe((quad.reps ?? 0) * (quad.ex.cadence ?? 0));
  });

  it("sessionSeconds = prep + work per exercise + rests between", () => {
    const items = buildDay(1, 0);
    const expected =
      items.reduce((s, it) => s + PREP_SECS + workSecs(it), 0) +
      REST_SECS * (items.length - 1);
    expect(sessionSeconds(1, 0)).toBe(expected);
  });

  it("sessionMinutes rounds and never returns less than 1", () => {
    expect(sessionMinutes(1, 0)).toBeGreaterThanOrEqual(1);
    expect(sessionMinutes(30, 2)).toBeGreaterThanOrEqual(1);
  });
});
