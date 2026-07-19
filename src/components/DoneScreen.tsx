"use client";

import { useState } from "react";
import { ProgressCompanion } from "./ProgressCompanion";
import { sessionMinutes } from "@/lib/tracks";
import { coinsForCompletion, type Equipped } from "@/lib/rewards";
import { useTenant } from "@/lib/tenant/tenant-provider";
import { doneHeroCopy } from "@/lib/tenant/copy";

export type FinishDest = "home" | "pet" | "level";

export function DoneScreen({
  day,
  track,
  streak,
  alreadyDone,
  petName,
  equipped,
  onFinish,
}: {
  day: number;
  track: number;
  streak: number;
  alreadyDone: boolean;
  petName: string;
  equipped: Equipped;
  onFinish: (dest: FinishDest) => void;
}) {
  const [pain, setPain] = useState<"good" | "sore" | "sharp" | null>(null);
  // Freeze the earned amount at mount so crediting doesn't change the display.
  const [earned] = useState(() => coinsForCompletion(streak, alreadyDone));
  const finale = day === 30;
  const tenant = useTenant();

  return (
    <div>
      <div className="card done-hero">
        <ProgressCompanion equipped={equipped} size={175} cheer name={petName} />
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
    </div>
  );
}
