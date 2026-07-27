"use client";

/* ============================================================
   usePoseLoop — drives a continuous idle preview loop (0..1) for
   Figure, independent of an active session's clock. Uses the same
   cosine easing SessionPlayer applies to its live "work" stage.
   Freezes at 0 (static pose) when `active` is false or the user
   prefers reduced motion.
   ============================================================ */

import { useEffect, useRef, useState } from "react";
import type { Exercise } from "@/lib/exercises";
import { useReducedMotion } from "./useReducedMotion";

export function usePoseLoop(exercise: Exercise, active: boolean): number {
  const reduced = useReducedMotion();
  const [t, setT] = useState(0);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active || reduced) {
      setT(0);
      return;
    }
    const period = exercise.type === "reps" ? Math.max(exercise.cadence ?? 2, 1) : 3;
    const loop = (now: number) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      const phase = (elapsed % period) / period;
      setT((1 - Math.cos(2 * Math.PI * phase)) / 2);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
    };
  }, [active, reduced, exercise.type, exercise.cadence]);

  return t;
}
