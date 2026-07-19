"use client";

/* ============================================================
   ProgressCompanion — the single branch point between the Shelby
   mascot and a clinical progress summary. Callers (HomeScreen's
   pet card, PetScreen, DoneScreen's cheer) pass the same props they
   used to pass <Pet>; which view renders depends on the tenant's
   mascotEnabled flag, not on the caller.
   ============================================================ */

import { Pet } from "./Pet";
import { useTenant } from "@/lib/tenant/tenant-provider";
import { useProgressContext } from "./ProgressProvider";
import type { Equipped } from "@/lib/rewards";

export function ProgressCompanion({
  equipped,
  size = 200,
  cheer = false,
  name,
}: {
  equipped: Equipped;
  size?: number;
  cheer?: boolean;
  name?: string;
}) {
  const tenant = useTenant();
  const { completedCount, streak, completed, currentDay } = useProgressContext();

  if (tenant.mascotEnabled) {
    return <Pet equipped={equipped} size={size} cheer={cheer} name={name} />;
  }

  return (
    <ClinicalProgress
      size={size}
      streak={streak}
      completedCount={completedCount}
      completed={completed}
      currentDay={currentDay}
    />
  );
}

function ClinicalProgress({
  size,
  streak,
  completedCount,
  completed,
  currentDay,
}: {
  size: number;
  streak: number;
  completedCount: number;
  completed: number[];
  currentDay: number;
}) {
  const completedSet = new Set(completed);
  const windowStart = Math.max(1, currentDay - 6);
  const weekLength = currentDay - windowStart + 1;
  let weekDone = 0;
  for (let d = windowStart; d <= currentDay; d++) {
    if (completedSet.has(d)) weekDone++;
  }
  const adherencePct = Math.round((completedCount / 30) * 100);

  return (
    <div className="stat-row" style={{ width: size }}>
      <div className="stat">
        <div className="n">{streak}</div>
        <div className="l">day streak</div>
      </div>
      <div className="stat">
        <div className="n">
          {weekDone}/{weekLength}
        </div>
        <div className="l">this week</div>
      </div>
      <div className="stat">
        <div className="n">{adherencePct}%</div>
        <div className="l">adherence</div>
      </div>
    </div>
  );
}
