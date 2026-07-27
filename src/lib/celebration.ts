/* ============================================================
   STEADY — Milestone celebration tier selection & tone.
   Pure, framework-free logic (mirrors storage.ts / rewards.ts):
   the pet component layer only asks "what tier, subdued or not"
   and never re-derives these thresholds itself.
   ============================================================ */

export type Tier = "session" | "streak" | "track";
export type Pain = "good" | "sore" | "sharp" | null;

/** Streak lengths that trigger the medium tier. 30 is deliberately
 * omitted — it would always collide with the day-30 track tier, which
 * wins any same-day tie (see pickTier). */
export const STREAK_THRESHOLDS = [3, 7, 14, 21] as const;

/** Skipped-exercise fraction at or above which a celebration goes subdued. */
export const SKIP_SUBDUED_THRESHOLD = 0.5;

/**
 * Highest-priority tier for this completion: track (day 10/20/30) >
 * streak (newStreak just crossed a threshold) > session (the floor —
 * always applies, including repeats). Repeats and re-visits of an
 * already-completed day never re-fire track/streak, since neither the
 * day-10/20/30 phase boundary nor the streak actually changed.
 */
export function pickTier(args: {
  day: number;
  alreadyDone: boolean;
  prevStreak: number;
  newStreak: number;
}): Tier {
  const { day, alreadyDone, prevStreak, newStreak } = args;
  if (!alreadyDone && day % 10 === 0) return "track";
  if (
    !alreadyDone &&
    newStreak !== prevStreak &&
    (STREAK_THRESHOLDS as readonly number[]).includes(newStreak)
  ) {
    return "streak";
  }
  return "session";
}

/**
 * Whether the celebration should go subdued (gentle acknowledgment, no
 * exuberant action). `pain` is `null` when not yet known — inline tiers
 * call this before the pain check-in is answered, so only the skip-rate
 * signal applies there; the track tier calls it again once `pain` is
 * answered.
 */
export function isSubdued(args: {
  skippedCount: number;
  totalCount: number;
  pain: Pain;
}): boolean {
  const { skippedCount, totalCount, pain } = args;
  const skippedFraction = totalCount > 0 ? skippedCount / totalCount : 0;
  return pain === "sharp" || skippedFraction >= SKIP_SUBDUED_THRESHOLD;
}
