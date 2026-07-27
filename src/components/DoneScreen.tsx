"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { ProgressCompanion } from "./ProgressCompanion";
import { sessionMinutes } from "@/lib/tracks";
import { coinsForCompletion, type Equipped, type Species } from "@/lib/rewards";
import { nextStreak, todayISO } from "@/lib/storage";
import { pickTier, isSubdued, type Tier } from "@/lib/celebration";
import { useTenant } from "@/lib/tenant/tenant-provider";
import { doneHeroCopy } from "@/lib/tenant/copy";

const CelebrationOverlay = dynamic(() => import("./pet3d/CelebrationOverlay"), { ssr: false });

export type FinishDest = "home" | "pet" | "level";

export function DoneScreen({
  day,
  track,
  streak,
  alreadyDone,
  lastCompletedDate,
  skippedCount,
  totalCount,
  petName,
  species,
  equipped,
  onFinish,
}: {
  day: number;
  track: number;
  streak: number;
  alreadyDone: boolean;
  lastCompletedDate: string | null;
  skippedCount: number;
  totalCount: number;
  petName: string;
  species: Species;
  equipped: Equipped;
  onFinish: (dest: FinishDest) => void;
}) {
  const [pain, setPain] = useState<"good" | "sore" | "sharp" | null>(null);
  const [overlayDismissed, setOverlayDismissed] = useState(false);
  // Freeze the earned amount at mount so crediting doesn't change the display.
  const [earned] = useState(() => coinsForCompletion(streak, alreadyDone));
  // Mirrors finishDay's own streak math (called later, on an onFinish
  // click) purely for preview here — same established pattern as `earned`
  // above. A repeat never changes the streak, matching finishDay exactly.
  const [newStreak] = useState(() =>
    alreadyDone ? streak : nextStreak(streak, lastCompletedDate, todayISO())
  );
  const [tier] = useState<Tier>(() =>
    pickTier({ day, alreadyDone, prevStreak: streak, newStreak })
  );
  const finale = day === 30;
  const tenant = useTenant();

  // Inline tiers (session/streak) are gated only on the skip-rate signal,
  // already known instantly. The track tier waits for the pain check-in
  // to be answered before it appears at all — see CelebrationOverlay's
  // doc comment for why (a full-screen takeover would hide the pain
  // buttons before they're ever answered).
  const skipSubdued = isSubdued({ skippedCount, totalCount, pain: null });
  const painSubdued = isSubdued({ skippedCount, totalCount, pain });

  // Subdued celebrations always render as this same small inline
  // acknowledgment, never full-screen — a calmer takeover is still a
  // takeover, the wrong tone right after reported pain.
  let heroCelebration: { tier: Tier; subdued: boolean } | null = null;
  if (tier !== "track") {
    heroCelebration = { tier, subdued: skipSubdued };
  } else if (pain !== null && painSubdued) {
    heroCelebration = { tier, subdued: true };
  }

  const showOverlay = tier === "track" && pain !== null && !painSubdued && !overlayDismissed;
  const highlightStreak = tier === "streak" && !skipSubdued;

  return (
    <div>
      <div className={`card done-hero ${highlightStreak ? "celebrate-streak" : ""}`}>
        {heroCelebration ? (
          <ProgressCompanion
            equipped={equipped}
            size={175}
            name={petName}
            variant="celebrate"
            celebration={heroCelebration}
          />
        ) : (
          <ProgressCompanion equipped={equipped} size={175} name={petName} />
        )}
        {tier === "streak" && <div className="streak-badge">🔥 {newStreak}-day streak!</div>}
        <h2>Day {day} complete!</h2>
        <p style={{ fontSize: 17, color: "var(--ink-soft)" }}>
          {doneHeroCopy(tenant, petName, sessionMinutes(day, track))}
        </p>
        <div className="coin-earn">
          +{earned} 🪙 {alreadyDone ? "for the repeat" : "(includes streak bonus)"}
        </div>
      </div>
      <div className="card">
        <div className="section-label" style={{ marginTop: 0 }}>
          Quick check-in — how did that feel?
        </div>
        <div className="pain-btns">
          <button className="pain-btn" onClick={() => setPain("good")}>
            😊 Felt good
          </button>
          <button className="pain-btn" onClick={() => setPain("sore")}>
            😐 A little sore or stiff
          </button>
          <button className="pain-btn" onClick={() => setPain("sharp")}>
            😣 Sharp or worsening pain
          </button>
        </div>
        {pain === "good" && (
          <div className="good">
            Great sign. Consistency beats intensity — see you tomorrow.
          </div>
        )}
        {pain === "sore" && (
          <div className="good">
            Mild soreness or stiffness is normal, especially early on. It should
            ease within a day. If it lingers, repeat today&apos;s level instead
            of progressing.
          </div>
        )}
        {pain === "sharp" && (
          <div className="alert">
            Sharp, stabbing, or worsening pain is a signal to stop. Please pause
            the program and check in with your doctor or physical therapist
            before continuing.
          </div>
        )}
        {finale && (
          <div className="good" style={{ textAlign: "center" }}>
            🏆 <strong>That&apos;s all 30 days of this level!</strong> If your
            knees feel ready, step up to the next track and keep building.
          </div>
        )}
        <button
          className="big-btn"
          style={{ marginTop: 16 }}
          onClick={() => onFinish("home")}
        >
          Collect &amp; finish
        </button>
        <button className="big-btn ghost" onClick={() => onFinish("pet")}>
          Collect &amp; visit {petName || "your buddy"} →
        </button>
        {finale && (
          <button className="big-btn ghost" onClick={() => onFinish("level")}>
            🎓 Choose my next level →
          </button>
        )}
      </div>
      {showOverlay && (
        <Suspense fallback={null}>
          <CelebrationOverlay
            day={day}
            track={track}
            species={species}
            equipped={equipped}
            name={petName}
            subdued={false}
            onDismiss={() => setOverlayDismissed(true)}
          />
        </Suspense>
      )}
    </div>
  );
}
