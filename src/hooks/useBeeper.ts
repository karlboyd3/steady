"use client";

import { useCallback } from "react";
import { beep as playBeep } from "@/lib/audio";

/**
 * Returns a fire-and-forget beep(freq, dur). Backed by the shared, iOS-safe
 * AudioContext in lib/audio — prime it in the Start-session gesture.
 */
export function useBeeper() {
  return useCallback((freq = 660, dur = 0.12) => playBeep(freq, dur), []);
}
