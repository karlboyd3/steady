"use client";

/* ============================================================
   CelebrationOverlay — the full-screen track-tier (day 10/20/30)
   takeover. Dismissible by tap-anywhere or the Continue button, and
   auto-dismisses on a timer. Only ever mounted once the pain check-in
   has been answered (see DoneScreen.tsx) — never appears if the user
   clicks a finish button first.

   Default export: dynamically imported directly by DoneScreen.tsx
   (not through ProgressCompanion, since this is a full-screen modal,
   not a "pet display" — it composes CelebrationScene internally for
   the actual 3D pet).
   ============================================================ */

import { useEffect, useRef } from "react";
import type { Equipped, Species } from "@/lib/rewards";
import { TRACKS, phaseOf } from "@/lib/tracks";
import { TIER_DURATIONS } from "./celebrationClips";
import CelebrationScene from "./CelebrationScene";

export default function CelebrationOverlay({
  day,
  track,
  species,
  equipped,
  name,
  subdued,
  onDismiss,
}: {
  day: number;
  track: number;
  species: Species;
  equipped: Equipped;
  name?: string;
  subdued: boolean;
  onDismiss: () => void;
}) {
  // Read via a ref so the auto-dismiss timer is set up exactly once per
  // mount, regardless of onDismiss's identity across re-renders.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    // A bit of slack past the clip's own duration so the final pose holds
    // briefly before the takeover clears.
    const timer = setTimeout(() => onDismissRef.current(), TIER_DURATIONS.track * 1000 + 800);
    return () => clearTimeout(timer);
  }, []);

  const phase = TRACKS[track].phases[phaseOf(day)];
  const title = day === 30 ? "🏆 Track complete!" : `${phase.name} complete!`;
  const sub =
    day === 30
      ? "All 30 days done. Ready for the next level?"
      : `Day ${day} of 30 — tap anywhere to continue.`;

  return (
    <div
      className="modal-scrim celebration-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onDismiss}
    >
      <div className="celebration-card" onClick={(e) => e.stopPropagation()}>
        <CelebrationScene
          species={species}
          equipped={equipped}
          name={name}
          tier="track"
          subdued={subdued}
          size={230}
        />
        <h2 className="celebration-title">{title}</h2>
        <p className="celebration-sub">{sub}</p>
        <button className="big-btn" onClick={onDismiss}>
          Continue
        </button>
      </div>
    </div>
  );
}
