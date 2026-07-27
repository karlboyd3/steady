"use client";

/* ============================================================
   ProgressCompanion — the single branch point between the pet
   mascot and a clinical progress summary. Callers (HomeScreen's
   pet card, PetScreen, DoneScreen's cheer) pass the same props they
   used to pass <Pet>; which view renders depends on the tenant's
   mascotEnabled flag, not on the caller.

   variant="hero" is PetScreen's dedicated full-size showcase; variant=
   "celebrate" is DoneScreen's inline session/streak-tier celebration.
   Both pull in the 3D scene via a Suspense-wrapped next/dynamic import,
   so three.js only ever loads when one of them actually renders (the
   /buddy route, or the done screen once a session finishes). Every
   other caller stays on the plain 2D <Pet>, at zero three.js cost.
   ============================================================ */

import { Suspense } from "react";
import dynamic from "next/dynamic";
import { Pet } from "./Pet";
import { useTenant } from "@/lib/tenant/tenant-provider";
import { useProgressContext } from "./ProgressProvider";
import type { Equipped } from "@/lib/rewards";
import type { Tier } from "@/lib/celebration";

const PetScene = dynamic(() => import("./pet3d/PetScene"), { ssr: false });
const CelebrationScene = dynamic(() => import("./pet3d/CelebrationScene"), { ssr: false });

export function ProgressCompanion({
  equipped,
  size = 200,
  cheer = false,
  name,
  variant = "preview",
  celebration,
}: {
  equipped: Equipped;
  size?: number;
  cheer?: boolean;
  name?: string;
  variant?: "preview" | "hero" | "celebrate";
  /** Required when variant="celebrate". */
  celebration?: { tier: Tier; subdued: boolean };
}) {
  const tenant = useTenant();
  const { completedCount, streak, completed, currentDay, species } = useProgressContext();

  if (tenant.mascotEnabled && variant === "hero") {
    return (
      <Suspense fallback={<Pet equipped={equipped} size={size} name={name} species={species} />}>
        <PetScene equipped={equipped} name={name} species={species} />
      </Suspense>
    );
  }

  if (tenant.mascotEnabled && variant === "celebrate" && celebration) {
    return (
      <Suspense
        fallback={
          <Pet
            equipped={equipped}
            size={size}
            name={name}
            species={species}
            cheer={!celebration.subdued}
          />
        }
      >
        <CelebrationScene
          equipped={equipped}
          name={name}
          species={species}
          size={size}
          tier={celebration.tier}
          subdued={celebration.subdued}
        />
      </Suspense>
    );
  }

  if (tenant.mascotEnabled) {
    return <Pet equipped={equipped} size={size} cheer={cheer} name={name} species={species} />;
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
