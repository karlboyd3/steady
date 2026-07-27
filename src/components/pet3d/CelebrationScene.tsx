"use client";

/* ============================================================
   CelebrationScene — the inline (session/streak tier) celebration.
   Same footprint as the hero pet slot it replaces (ProgressCompanion's
   "celebrate" variant on DoneScreen). Plays once on mount, settles back
   to idle after the tier's duration, and can be tapped to skip ahead to
   idle early. WebGL-unavailable / not-yet-loaded fallback is the
   existing 2D <Pet> with its established `cheer` sparkle — reusing
   Change 2's proven "never white-screen" fallback rather than a new one.

   Default export: dynamically imported (ssr:false) so three.js only
   ever loads once a celebration actually needs to render.
   ============================================================ */

import { useEffect, useMemo, useState } from "react";
import type { Equipped, Species } from "@/lib/rewards";
import type { Tier } from "@/lib/celebration";
import { Pet } from "../Pet";
import { PetCanvas, type ActiveCelebration } from "./PetCanvas";
import { hasWebGL } from "./hasWebGL";
import { WebglErrorBoundary } from "./WebglErrorBoundary";
import { pickVariantIndex, TIER_DURATIONS } from "./celebrationClips";

/** In-memory only (per plan: variant rotation doesn't need to survive a
 * reload) — remembers the last-played variant per tier across separate
 * DoneScreen mounts within the same client session. */
const lastVariantByTier: Partial<Record<Tier, number>> = {};

function nextVariantIndex(tier: Tier): number {
  const idx = pickVariantIndex(tier, lastVariantByTier[tier] ?? null);
  lastVariantByTier[tier] = idx;
  return idx;
}

export default function CelebrationScene({
  species,
  equipped,
  name,
  tier,
  subdued,
  size = 175,
}: {
  species: Species;
  equipped: Equipped;
  name?: string;
  tier: Tier;
  subdued: boolean;
  size?: number;
}) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  useEffect(() => setWebglOk(hasWebGL()), []);

  const variantIndex = useMemo(() => nextVariantIndex(tier), [tier]);
  const [active, setActive] = useState<ActiveCelebration | null>({
    tier,
    subdued,
    variantIndex,
  });

  useEffect(() => {
    setActive({ tier, subdued, variantIndex });
    const timer = setTimeout(() => setActive(null), TIER_DURATIONS[tier] * 1000);
    return () => clearTimeout(timer);
  }, [tier, subdued, variantIndex]);

  const fallback = (
    <Pet equipped={equipped} size={size} name={name} species={species} cheer={!subdued} />
  );

  if (!webglOk) return fallback;

  return (
    <div
      style={{ width: size, height: size * 0.8, cursor: "pointer" }}
      onClick={() => setActive(null)}
      role="button"
      aria-label="Dismiss celebration"
    >
      <WebglErrorBoundary fallback={fallback}>
        <PetCanvas
          species={species}
          equipped={equipped}
          celebration={active}
          interactive={false}
        />
      </WebglErrorBoundary>
    </div>
  );
}
