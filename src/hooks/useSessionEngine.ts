"use client";

/* ============================================================
   useSessionEngine — React wrapper around the pure engine.
   Owns the interval tick, pause/back/skip/switch controls, and
   stage-change audio chimes. All transition logic lives in
   lib/session-engine.ts (unit-tested there).
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { buildDay } from "@/lib/tracks";
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

interface Args {
  day: number;
  track: number;
  soundOn: boolean;
  onDone: () => void;
}

export function useSessionEngine({ day, track, soundOn, onDone }: Args) {
  const items = useMemo(() => buildDay(day, track), [day, track]);
  const [state, setState] = useState<SessionState>(initialState);
  const [paused, setPaused] = useState(false);
  const beep = useBeeper();

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
    if (state.done) onDoneRef.current();
  }, [state.done]);

  const togglePause = useCallback(() => setPaused((p) => !p), []);
  const skip = useCallback(() => setState((p) => engSkip(p, items)), [items]);
  const back = useCallback(() => setState(engBack), []);
  const beginWork2 = useCallback(() => setState(engBeginWork2), []);

  return { items, state, paused, togglePause, skip, back, beginWork2 };
}
