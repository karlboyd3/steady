/* ============================================================
   STEADY — Workout Overview stats (kcal + volume-label formatting)
   ============================================================ */

import type { DayItem } from "./exercises";
import { PREP_SECS, REST_SECS, workSecs } from "./tracks";

/** Rough MET-based estimate for one item — label it "≈" in the UI. */
export function estimateExerciseKcal(item: DayItem): number {
  return (workSecs(item) / 60) * item.ex.estimatedKcalPerMin;
}

/** Rounded whole-kcal estimate for a full session. */
export function estimateSessionKcal(items: DayItem[]): number {
  return Math.round(
    items.reduce((sum, item) => sum + estimateExerciseKcal(item), 0)
  );
}

/**
 * Rounded whole-minute estimate for a resolved items array (reflects any
 * per-session overrides) — mirrors tracks.ts's sessionMinutes() formula,
 * which only knows day/track and can't see overrides.
 */
export function estimateSessionMinutes(items: DayItem[]): number {
  const secs =
    items.reduce((s, it) => s + PREP_SECS + workSecs(it), 0) +
    REST_SECS * Math.max(0, items.length - 1);
  return Math.max(1, Math.round(secs / 60));
}

/** "× 8" for rep-based exercises, "0:30" for timed holds. */
export function formatVolumeLabel(item: DayItem): string {
  if (item.ex.type === "reps") return `× ${item.reps ?? 0}`;
  const secs = item.secs ?? 0;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
