/* ============================================================
   STEADY — Session engine (pure, framework-free & unit-testable)

   Stage flow per exercise:
     prep(5s) → work → [switch(6s) → work2  if perLeg] → rest(12s) → next
   The final exercise ends in `done` instead of a rest.
   ============================================================ */

import { type DayItem } from "./exercises";
import { PREP_SECS, REST_SECS, SWITCH_SECS, workSecs } from "./tracks";

export type Stage = "prep" | "work" | "switch" | "work2" | "rest";

export interface SessionState {
  exIdx: number;
  stage: Stage;
  /** Seconds elapsed within the current stage. */
  t: number;
  done: boolean;
}

export const initialState: SessionState = {
  exIdx: 0,
  stage: "prep",
  t: 0,
  done: false,
};

/** Active seconds for one leg / one hold of an exercise. */
function oneSideSecs(item: DayItem): number {
  return item.ex.type === "reps"
    ? (item.reps ?? 0) * (item.ex.cadence ?? 0)
    : item.secs ?? 0;
}

/** Duration (seconds) of the current stage. */
export function stageDuration(state: SessionState, items: DayItem[]): number {
  const item = items[state.exIdx];
  switch (state.stage) {
    case "prep":
      return PREP_SECS;
    case "work":
    case "work2":
      return oneSideSecs(item);
    case "switch":
      return SWITCH_SECS;
    case "rest":
      return REST_SECS;
    default:
      return 0;
  }
}

/** Transition to the next stage once the current one's timer elapses. */
export function nextStage(state: SessionState, items: DayItem[]): SessionState {
  const item = items[state.exIdx];
  const last = state.exIdx === items.length - 1;
  if (state.stage === "prep") return { ...state, stage: "work", t: 0 };
  if (state.stage === "work") {
    if (item.ex.perLeg) return { ...state, stage: "switch", t: 0 };
    return last ? { ...state, done: true } : { ...state, stage: "rest", t: 0 };
  }
  if (state.stage === "switch") return { ...state, stage: "work2", t: 0 };
  if (state.stage === "work2")
    return last ? { ...state, done: true } : { ...state, stage: "rest", t: 0 };
  if (state.stage === "rest")
    return { ...state, exIdx: state.exIdx + 1, stage: "prep", t: 0 };
  return state;
}

/**
 * Advance the clock by `dt` seconds. When the current stage's timer runs out,
 * jump to the next stage (resetting its `t`), matching the prototype tick.
 */
export function step(
  state: SessionState,
  dt: number,
  items: DayItem[]
): SessionState {
  if (state.done) return state;
  const nt = state.t + dt;
  if (nt >= stageDuration(state, items)) return nextStage(state, items);
  return { ...state, t: nt };
}

/** Skip forward: rest → next exercise; work/switch → rest (or done on last). */
export function skip(state: SessionState, items: DayItem[]): SessionState {
  const last = state.exIdx === items.length - 1;
  if (state.stage === "rest")
    return { ...state, exIdx: state.exIdx + 1, stage: "prep", t: 0 };
  return last ? { ...state, done: true } : { ...state, stage: "rest", t: 0 };
}

/**
 * Back semantics:
 *  - mid-exercise (not at the very start of prep) → restart this exercise
 *  - at the very start → go to the previous exercise (if any)
 */
export function back(state: SessionState): SessionState {
  if (state.stage !== "prep" || state.t > 1.5)
    return { ...state, stage: "prep", t: 0, done: false };
  if (state.exIdx > 0)
    return { exIdx: state.exIdx - 1, stage: "prep", t: 0, done: false };
  return state;
}

/** Manually confirm the leg-switch and begin the second side. */
export function beginWork2(state: SessionState): SessionState {
  return { ...state, stage: "work2", t: 0 };
}

/** Seconds elapsed across the whole session — drives the top progress bar. */
export function sessionElapsed(state: SessionState, items: DayItem[]): number {
  const item = items[state.exIdx];
  let elapsed = 0;
  for (let i = 0; i < state.exIdx; i++)
    elapsed += PREP_SECS + workSecs(items[i]) + REST_SECS;
  if (state.stage !== "prep") elapsed += PREP_SECS;
  if (state.stage === "switch" || state.stage === "work2")
    elapsed += oneSideSecs(item);
  if (state.stage === "work2") elapsed += SWITCH_SECS;
  if (state.stage === "rest") elapsed += workSecs(item);
  elapsed += state.t;
  return elapsed;
}
