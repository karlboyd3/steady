"use client";

import { TRACKS } from "@/lib/tracks";

export function LevelPicker({
  isChange,
  onPick,
  onBack,
}: {
  isChange: boolean;
  onPick: (i: number) => void;
  onBack?: () => void;
}) {
  return (
    <div>
      {onBack && (
        <div className="session-top">
          <button className="icon-btn" onClick={onBack}>
            ← Back
          </button>
        </div>
      )}
      <div className="brand">
        <h1>Steady</h1>
        <span className="tag">30-day knee strength plan</span>
      </div>
      <p className="sub">
        {isChange
          ? "Pick a new level — your completed days carry over."
          : "First, where are your knees right now? Pick the description that fits best. You can change this anytime."}
      </p>
      {TRACKS.map((t, i) => (
        <button key={i} className="level-card" onClick={() => onPick(i)}>
          <div className="level-head">
            <span className="level-emoji">{t.emoji}</span>
            <span className="level-name display">{t.name}</span>
          </div>
          <div className="level-who">{t.who}</div>
          <div className="level-focus">{t.focus}</div>
        </button>
      ))}
      <p className="footer-note">
        Not sure? Start gentler — you can move up any time. If you&apos;re under a
        doctor&apos;s or physical therapist&apos;s care, ask them which level fits
        your stage.
      </p>
    </div>
  );
}
