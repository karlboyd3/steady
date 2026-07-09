"use client";

import { useRef, useCallback } from "react";

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Returns a fire-and-forget beep(freq, dur) using the Web Audio API. */
export function useBeeper() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback((freq = 660, dur = 0.12) => {
    try {
      if (!ctxRef.current) {
        const Ctx =
          window.AudioContext || (window as WebkitWindow).webkitAudioContext;
        if (!Ctx) return;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + dur);
    } catch {
      /* audio unavailable — stay silent */
    }
  }, []);
}
