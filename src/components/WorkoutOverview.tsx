"use client";

/* ============================================================
   WorkoutOverview — Screen 1. The pre-workout landing state for
   /session: hero, stats row, tappable exercise list, sticky Start.
   ============================================================ */

import type { DayItem } from "@/lib/exercises";
import { TRACKS, phaseOf } from "@/lib/tracks";
import {
  estimateSessionKcal,
  estimateSessionMinutes,
  formatVolumeLabel,
} from "@/lib/workout-stats";
import { Figure } from "./Figure";

export function WorkoutOverview({
  day,
  trackIdx,
  items,
  alreadyDone,
  onSelectExercise,
  onStart,
  onExit,
}: {
  day: number;
  trackIdx: number;
  items: DayItem[];
  alreadyDone: boolean;
  onSelectExercise: (index: number) => void;
  onStart: () => void;
  onExit: () => void;
}) {
  const track = TRACKS[trackIdx];
  const phase = phaseOf(day);
  const minutes = estimateSessionMinutes(items);
  const kcal = estimateSessionKcal(items);

  return (
    <div className="overview-screen">
      <div className="overview-hero">
        <button
          type="button"
          className="icon-btn overview-back"
          onClick={onExit}
        >
          ← Back
        </button>
        <div className="overview-phase-label">
          {track.emoji} {track.name} · Day {day}
        </div>
        <h1 className="display overview-title">{track.phases[phase].name}</h1>
        <div className="overview-row">
          <div className="overview-stat">
            <div className="n">{items.length}</div>
            <div className="l">exercises</div>
          </div>
          <div className="overview-stat">
            <div className="n">~{minutes}</div>
            <div className="l">minutes</div>
          </div>
          <div className="overview-stat">
            <div className="n">≈{kcal}</div>
            <div className="l">kcal</div>
          </div>
        </div>
      </div>

      <div className="overview-list">
        {items.map((item, i) => (
          <button
            type="button"
            key={i}
            className="overview-row-btn"
            onClick={() => onSelectExercise(i)}
          >
            <span className="ov-thumb">
              <Figure exercise={item.ex} t={0} showAngle={false} />
            </span>
            <span className="ov-name">
              {item.ex.name.toUpperCase()}
              {item.ex.perLeg ? " · EACH SIDE" : ""}
            </span>
            <span className="ov-volume">{formatVolumeLabel(item)}</span>
          </button>
        ))}
      </div>

      <div className="overview-start-bar">
        <button type="button" className="big-btn" onClick={onStart}>
          {alreadyDone ? "Do it again" : "Start Workout"}
        </button>
      </div>
    </div>
  );
}
