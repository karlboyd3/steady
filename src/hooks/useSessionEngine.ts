"use client";

/* ============================================================
   useSessionEngine — React wrapper around the pure engine.
   Owns the interval tick, pause/back/skip/switch controls, and
   stage-change audio chimes. All transition logic lives in
   lib/session-engine.ts (unit-tested there).
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildDay } from "@/lib/tracks";
import { applyOverrides, type RepOverrides } from "@/lib/exercises";
import {
  back as engBack,
  beginWork2 as engBeginWork2,
  initialState,
  skip as engSkip,
  step,
  type SessionState,
} from "@/lib/session-engine";
import { useBeeper } from "./useBeeper";

const TICK_MS = 100;
const DT = TICK_MS / 1000;

export type { RepOverrides };

/** How much of the session was cut short via the Skip control — feeds the
 * celebration system's subdued-tone decision (src/lib/celebration.ts). */
export interface SessionSummary {
  skippedCount: number;
  totalCount: number;
}

interface Args {
  day: number;
  track: number;
  soundOn: boolean;
  onDone: (summary: SessionSummary) => void;
  /** Applied on top of buildDay()'s resolved volume, for this session only. */
  overrides?: RepOverrides;
}

export function useSessionEngine({ day, track, soundOn, onDone, overrides }: Args) {
  const items = useMemo(
    () => applyOverrides(buildDay(day, track), overrides),
    [day, track, overrides]
  );
  const [state, setState] = useState<SessionState>(initialState);
  const [paused, setPaused] = useState(false);
  const beep = useBeeper();
  // A ref, not state: mutated inside a plain callback (not a setState
  // updater), so it's never at risk of StrictMode's dev-only double-invoke
  // of updater functions double-counting it.
  const skippedRef = useRef(0);

  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;

  // clock
  useEffect(() => {
    if (paused || state.done) return;
    const iv = setInterval(() => {
      setState((prev) => (prev.done ? prev : step(prev, DT, items)));
    }, TICK_MS);
    return () => clearInterval(iv);
  }, [paused, state.done, items]);

  // stage-change chimes
  const stageKey = `${state.exIdx}-${state.stage}-${state.done}`;
  const prevKey = useRef(stageKey);
  useEffect(() => {
    if (prevKey.current === stageKey) return;
    prevKey.current = stageKey;
    if (!soundRef.current) return;
    if (state.done) {
      beep(660, 0.15);
      setTimeout(() => beep(880, 0.25), 160);
    } else if (state.stage === "work" || state.stage === "work2") {
      beep(740, 0.14);
    } else if (state.stage === "rest") {
      beep(440, 0.14);
    } else {
      beep(560, 0.1);
    }
  }, [stageKey, state.stage, state.done, beep]);

  // fire onDone once
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;
  useEffect(() => {
    if (state.done) {
      onDoneRef.current({ skippedCount: skippedRef.current, totalCount: items.length });
    }
  }, [state.done, items.length]);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  // A rest→next advance is "ready early", not a content skip (the
  // exercise's work already finished) — session-engine.ts's own skip()
  // already treats it that way; only count stages where work is actually
  // being cut short.
  const skip = useCallback(() => {
    if (state.stage !== "rest") skippedRef.current += 1;
    setState((p) => engSkip(p, items));
  }, [items, state.stage]);
  const back = useCallback(() => setState(engBack), []);
  const beginWork2 = useCallback(() => setState(engBeginWork2), []);

  return { items, state, paused, togglePause, skip, back, beginWork2 };
}
