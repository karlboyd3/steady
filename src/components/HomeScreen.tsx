"use client";

import { ProgressCompanion } from "./ProgressCompanion";
import { buildDay, phaseOf, sessionMinutes, TRACKS } from "@/lib/tracks";
import type { Equipped } from "@/lib/rewards";

export function HomeScreen({
  currentDay,
  completedSet,
  completedCount,
  streak,
  selectedDay,
  track,
  coins,
  petName,
  equipped,
  level,
  onStart,
  onPick,
  onChangeLevel,
  onVisitPet,
}: {
  currentDay: number;
  completedSet: Set<number>;
  completedCount: number;
  streak: number;
  selectedDay: number;
  track: number;
  coins: number;
  petName: string;
  equipped: Equipped;
  level: number;
  onStart: () => void;
  onPick: (day: number) => void;
  onChangeLevel: () => void;
  onVisitPet: () => void;
}) {
  const day = selectedDay;
  const T = TRACKS[track];
  const p = phaseOf(day);
  const items = buildDay(day, track);
  return (
    <div>
      <div className="brand">
        <h1>Steady</h1>
        <span className="tag">30-day knee strength plan</span>
      </div>
      <p className="sub">
        About 10–15 minutes a day. No equipment beyond a chair and a wall.
      </p>

      <div className="card today-card">
        <div className="phase-label">
          {T.emoji} {T.name} · Day {day} · {T.phases[p].name}
        </div>
        <h2>{T.phases[p].blurb}</h2>
        <div className="meta">
          {items.length} exercises · ~{sessionMinutes(day, track)} min · rests
          built in
        </div>
        <button className="big-btn" onClick={onStart}>
          {completedSet.has(day)
            ? "Do it again"
            : day === currentDay
              ? "Start today's session"
              : `Start Day ${day}`}
        </button>
      </div>

      <div className="card">
        <div className="stat-row">
          <div className="stat">
            <div className="n">{completedCount}</div>
            <div className="l">days done</div>
          </div>
          <div className="stat">
            <div className="n">{streak}</div>
            <div className="l">day streak</div>
          </div>
          <div className="stat">
            <div className="n">{30 - completedCount}</div>
            <div className="l">to go</div>
          </div>
        </div>
        <button className="change-level" onClick={onChangeLevel}>
          Feeling stronger (or need gentler)? Change your level →
        </button>
      </div>

      <button className="card pet-card" onClick={onVisitPet}>
        <ProgressCompanion equipped={equipped} size={92} name={petName} />
        <div className="pet-info">
          <div className="pet-name-row">
            {petName || "Your buddy"}{" "}
            <span className="level-pill">Lv {level}</span>
          </div>
          <div className="pet-sub">
            🪙 {coins} coins · finish a session to earn more
          </div>
          <div className="pet-link">Visit &amp; customize →</div>
        </div>
      </button>

      <div className="section-label">Your 30 days — tap any day to preview</div>
      <div className="phase-row">
        <div className="phase-chip">1–10 {T.phases[0].name}</div>
        <div className="phase-chip p2">11–20 {T.phases[1].name}</div>
        <div className="phase-chip p3">21–30 {T.phases[2].name}</div>
      </div>
      <div className="card">
        <div className="day-grid">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <button
              key={d}
              className={`day-dot ${completedSet.has(d) ? "done" : ""} ${
                d === selectedDay ? "current" : ""
              }`}
              onClick={() => onPick(d)}
              aria-label={`Day ${d}${completedSet.has(d) ? ", completed" : ""}`}
              aria-current={d === selectedDay ? "true" : undefined}
            >
              {completedSet.has(d) ? "✓" : d}
            </button>
          ))}
        </div>
      </div>

      <p className="footer-note">
        This program offers general strengthening exercises and is not medical
        advice. If you&apos;re recovering from surgery or injury, follow your
        doctor&apos;s or physical therapist&apos;s plan first — and stop any
        exercise that causes sharp pain.
      </p>
    </div>
  );
}
