/* ============================================================
   STEADY — 30-day program: 3 tracks × 3 phases, progressive volume
   ============================================================ */

import { EX, type DayItem, type ExerciseId } from "./exercises";

export interface Phase {
  name: string;
  blurb: string;
}

/** A planned exercise slot within a phase. `r` = reps, `t` = seconds. */
export interface PlanItem {
  id: ExerciseId;
  r?: number;
  t?: number;
}

export interface Track {
  name: string;
  emoji: string;
  who: string;
  focus: string;
  phases: [Phase, Phase, Phase];
  /** One plan (6 exercises) per phase. */
  plans: [PlanItem[], PlanItem[], PlanItem[]];
}

export const TRACKS: Track[] = [
  {
    name: "Early Recovery",
    emoji: "🌱",
    who: "Coming off an injury or surgery clearance. Movement feels stiff or fragile.",
    focus: "Gentle range of motion, mostly lying down or seated. Nothing jarring.",
    phases: [
      { name: "Gentle Motion", blurb: "Restore comfortable movement, one small win at a time." },
      { name: "Waking Up Strength", blurb: "Ask the muscles around your knee to work again, gently." },
      { name: "First Steps Up", blurb: "Careful standing work to prepare for daily life." },
    ],
    plans: [
      [
        { id: "quadSet", r: 6 }, { id: "heelSlide", r: 6 }, { id: "straightLegRaise", r: 5 },
        { id: "gluteBridge", r: 6 }, { id: "seatedHamstringStretch", t: 15 }, { id: "calfStretchWall", t: 15 },
      ],
      [
        { id: "quadSet", r: 10 }, { id: "straightLegRaise", r: 8 }, { id: "gluteBridge", r: 10 },
        { id: "seatedKneeExtension", r: 6 }, { id: "sideLegRaise", r: 6 }, { id: "seatedHamstringStretch", t: 20 },
      ],
      [
        { id: "sitToStand", r: 5 }, { id: "seatedKneeExtension", r: 8 }, { id: "standingHamstringCurl", r: 6 },
        { id: "calfRaise", r: 8 }, { id: "calfStretchWall", t: 20 }, { id: "quadStretchStanding", t: 15 },
      ],
    ],
  },
  {
    name: "Rebuilding Strength",
    emoji: "🔨",
    who: "Past the fragile stage. Ready for light strengthening and more activity.",
    focus: "Everyday-movement strength: standing, sitting, stepping, balance.",
    phases: [
      { name: "Gentle Foundations", blurb: "Wake the muscles up and restore comfortable motion." },
      { name: "Building Strength", blurb: "Add load through everyday movements like standing and stepping." },
      { name: "Steady Strength", blurb: "Balance, endurance, and confidence for daily life." },
    ],
    plans: [
      [
        { id: "quadSet", r: 8 }, { id: "heelSlide", r: 8 }, { id: "straightLegRaise", r: 6 },
        { id: "gluteBridge", r: 8 }, { id: "seatedHamstringStretch", t: 20 }, { id: "calfStretchWall", t: 20 },
      ],
      [
        { id: "sitToStand", r: 6 }, { id: "seatedKneeExtension", r: 8 }, { id: "standingHamstringCurl", r: 8 },
        { id: "calfRaise", r: 10 }, { id: "sideLegRaise", r: 8 }, { id: "quadStretchStanding", t: 20 },
      ],
      [
        { id: "miniSquat", r: 8 }, { id: "wallSit", t: 20 }, { id: "sitToStand", r: 8 },
        { id: "calfRaise", r: 12 }, { id: "singleLegBalance", t: 20 }, { id: "seatedHamstringStretch", t: 25 },
      ],
    ],
  },
  {
    name: "Full Strength",
    emoji: "⚡",
    who: "Fully recovered — you want stronger, more resilient knees for sport and life.",
    focus: "Single-leg strength, endurance holds, and balance under load.",
    phases: [
      { name: "Base Builder", blurb: "Groove the fundamentals with real volume." },
      { name: "Loading Up", blurb: "Single-leg work and longer holds build resilience." },
      { name: "Strong & Steady", blurb: "Peak volume — knees that are ready for anything." },
    ],
    plans: [
      [
        { id: "sitToStand", r: 10 }, { id: "miniSquat", r: 10 }, { id: "calfRaise", r: 12 },
        { id: "standingHamstringCurl", r: 10 }, { id: "sideLegRaise", r: 10 }, { id: "quadStretchStanding", t: 20 },
      ],
      [
        { id: "splitSquat", r: 8 }, { id: "wallSit", t: 25 }, { id: "sitToStand", r: 12 },
        { id: "standingHipAbduction", r: 10 }, { id: "singleLegBalance", t: 20 }, { id: "seatedHamstringStretch", t: 25 },
      ],
      [
        { id: "splitSquat", r: 10 }, { id: "wallSit", t: 35 }, { id: "miniSquat", r: 14 },
        { id: "calfRaise", r: 16 }, { id: "singleLegBalance", t: 30 }, { id: "quadStretchStanding", t: 25 },
      ],
    ],
  },
];

export const PREP_SECS = 5;
export const REST_SECS = 12;
export const SWITCH_SECS = 6;

/** Phase index (0–2) for a given day (1–30). Phases are 10 days each. */
export function phaseOf(day: number): number {
  if (day <= 10) return 0;
  if (day <= 20) return 1;
  return 2;
}

/**
 * Build the resolved exercise list for a day.
 * Progression: +2 reps or +5s every 3 days within a phase (steps 0–3).
 */
export function buildDay(day: number, trackIdx: number): DayItem[] {
  const track = TRACKS[trackIdx];
  const p = phaseOf(day);
  const d = (day - 1) % 10; // 0..9 within phase
  const step = Math.floor(d / 3); // 0..3 progression steps
  return track.plans[p].map((item) => ({
    id: item.id,
    ex: EX[item.id],
    ...(item.r != null
      ? { reps: item.r + step * 2 }
      : { secs: (item.t ?? 0) + step * 5 }),
  }));
}

/** Total active seconds for one exercise item (both legs + switch if per-leg). */
export function workSecs(item: DayItem): number {
  const one =
    item.ex.type === "reps"
      ? (item.reps ?? 0) * (item.ex.cadence ?? 0)
      : item.secs ?? 0;
  return item.ex.perLeg ? one * 2 + SWITCH_SECS : one;
}

/** Total session seconds (prep + work + rests between exercises). */
export function sessionSeconds(day: number, trackIdx: number): number {
  const items = buildDay(day, trackIdx);
  return (
    items.reduce((s, it) => s + PREP_SECS + workSecs(it), 0) +
    REST_SECS * (items.length - 1)
  );
}

/** Rounded whole-minute estimate for a session (minimum 1). */
export function sessionMinutes(day: number, trackIdx: number): number {
  return Math.max(1, Math.round(sessionSeconds(day, trackIdx) / 60));
}
