import { describe, it, expect } from "vitest";
import { EX, type DayItem } from "./exercises";
import {
  initialState,
  stageDuration,
  nextStage,
  step,
  skip,
  back,
  beginWork2,
  sessionElapsed,
  type SessionState,
} from "./session-engine";
import { PREP_SECS, REST_SECS, SWITCH_SECS } from "./tracks";

const nonPerLeg = (reps = 2): DayItem => ({
  id: "quadSet",
  ex: EX.quadSet, // perLeg false, cadence 6
  reps,
});
const perLeg = (reps = 2): DayItem => ({
  id: "heelSlide",
  ex: EX.heelSlide, // perLeg true, cadence 5
  reps,
});

describe("stageDuration", () => {
  it("returns the right durations per stage", () => {
    const items = [nonPerLeg(2)]; // work = 2*6 = 12
    expect(stageDuration({ ...initialState, stage: "prep" }, items)).toBe(PREP_SECS);
    expect(stageDuration({ ...initialState, stage: "work" }, items)).toBe(12);
    expect(stageDuration({ ...initialState, stage: "rest" }, items)).toBe(REST_SECS);
    const per = [perLeg(2)];
    expect(stageDuration({ ...initialState, stage: "switch" }, per)).toBe(SWITCH_SECS);
    expect(stageDuration({ ...initialState, stage: "work2" }, per)).toBe(10);
  });
});

describe("full stage-walk — non-per-leg, last exercise", () => {
  it("prep → work → done", () => {
    const items = [nonPerLeg(2)];
    let s: SessionState = initialState;
    expect(s.stage).toBe("prep");
    s = nextStage(s, items);
    expect(s.stage).toBe("work");
    s = nextStage(s, items);
    expect(s.done).toBe(true);
  });
});

describe("full stage-walk — per-leg, last exercise", () => {
  it("prep → work → switch → work2 → done", () => {
    const items = [perLeg(2)];
    let s: SessionState = initialState;
    s = nextStage(s, items); // work
    expect(s.stage).toBe("work");
    s = nextStage(s, items); // switch
    expect(s.stage).toBe("switch");
    s = nextStage(s, items); // work2
    expect(s.stage).toBe("work2");
    s = nextStage(s, items); // done
    expect(s.done).toBe(true);
  });
});

describe("stage-walk across two exercises", () => {
  it("first work → rest → second prep (exIdx advances)", () => {
    const items = [nonPerLeg(2), nonPerLeg(2)];
    let s: SessionState = initialState;
    s = nextStage(s, items); // work (ex0)
    s = nextStage(s, items); // rest (not last)
    expect(s.stage).toBe("rest");
    expect(s.exIdx).toBe(0);
    s = nextStage(s, items); // prep (ex1)
    expect(s.stage).toBe("prep");
    expect(s.exIdx).toBe(1);
  });
});

describe("step (clock tick)", () => {
  const items = [nonPerLeg(2)];
  it("accumulates time within a stage", () => {
    const s = step({ ...initialState, t: 1 }, 0.1, items);
    expect(s.stage).toBe("prep");
    expect(s.t).toBeCloseTo(1.1, 5);
  });
  it("transitions when the stage timer elapses (resetting t)", () => {
    const s = step({ ...initialState, stage: "prep", t: 4.95 }, 0.1, items);
    expect(s.stage).toBe("work");
    expect(s.t).toBe(0);
  });
  it("is a no-op once done", () => {
    const done = { ...initialState, done: true };
    expect(step(done, 1, items)).toBe(done);
  });
});

describe("skip semantics", () => {
  const items = [nonPerLeg(2), nonPerLeg(2)];
  it("work (not last) → rest", () => {
    const s = skip({ ...initialState, exIdx: 0, stage: "work" }, items);
    expect(s.stage).toBe("rest");
  });
  it("rest → next exercise prep", () => {
    const s = skip({ ...initialState, exIdx: 0, stage: "rest" }, items);
    expect(s.stage).toBe("prep");
    expect(s.exIdx).toBe(1);
  });
  it("work on the last exercise → done", () => {
    const s = skip({ ...initialState, exIdx: 1, stage: "work" }, items);
    expect(s.done).toBe(true);
  });
});

describe("back semantics", () => {
  it("mid-exercise restarts the current exercise (prep, t 0)", () => {
    const s = back({ exIdx: 2, stage: "work", t: 8, done: false });
    expect(s).toEqual({ exIdx: 2, stage: "prep", t: 0, done: false });
  });
  it("just-started prep (t within 1.5s) goes to the previous exercise", () => {
    const s = back({ exIdx: 2, stage: "prep", t: 0.5, done: false });
    expect(s.exIdx).toBe(1);
    expect(s.stage).toBe("prep");
  });
  it("prep past 1.5s restarts this exercise instead of stepping back", () => {
    const s = back({ exIdx: 2, stage: "prep", t: 2, done: false });
    expect(s.exIdx).toBe(2);
    expect(s.stage).toBe("prep");
    expect(s.t).toBe(0);
  });
  it("at the very first exercise start, stays put", () => {
    const state = { exIdx: 0, stage: "prep" as const, t: 0, done: false };
    expect(back(state)).toEqual(state);
  });
});

describe("beginWork2", () => {
  it("jumps to the second leg", () => {
    const s = beginWork2({ exIdx: 0, stage: "switch", t: 4, done: false });
    expect(s.stage).toBe("work2");
    expect(s.t).toBe(0);
  });
});

describe("sessionElapsed", () => {
  const items = [nonPerLeg(2), nonPerLeg(2)]; // each: prep 5 + work 12
  it("is 0 at the very start", () => {
    expect(sessionElapsed(initialState, items)).toBe(0);
  });
  it("counts prep + partial work on the first exercise", () => {
    const s: SessionState = { exIdx: 0, stage: "work", t: 3, done: false };
    expect(sessionElapsed(s, items)).toBe(PREP_SECS + 3);
  });
  it("includes the finished first exercise + its rest when on exercise 2", () => {
    const s: SessionState = { exIdx: 1, stage: "prep", t: 0, done: false };
    expect(sessionElapsed(s, items)).toBe(PREP_SECS + 12 + REST_SECS);
  });
});
