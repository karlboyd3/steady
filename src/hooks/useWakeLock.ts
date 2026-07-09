"use client";

/* ============================================================
   useWakeLock — keeps the screen awake during a session.
   Steady runs propped on the floor while the user does leg raises,
   so the phone must not sleep mid-exercise.

   - acquires when `active` becomes true (session running)
   - re-acquires on visibilitychange (the OS releases the lock when the
     tab is hidden, so we must re-request on return)
   - releases on pause/exit/done (active → false) and on unmount
   - degrades silently where the API is unsupported (older iOS)
   ============================================================ */

import { useCallback, useEffect, useRef } from "react";

interface WakeLockSentinelLike {
  released: boolean;
  release(): Promise<void>;
  addEventListener?(type: "release", listener: () => void): void;
}
interface WakeLockLike {
  request(type: "screen"): Promise<WakeLockSentinelLike>;
}

function getWakeLock(): WakeLockLike | null {
  if (typeof navigator === "undefined") return null;
  const wl = (navigator as Navigator & { wakeLock?: WakeLockLike }).wakeLock;
  return wl && typeof wl.request === "function" ? wl : null;
}

export function useWakeLock(active: boolean) {
  const sentinelRef = useRef<WakeLockSentinelLike | null>(null);

  const release = useCallback(async () => {
    const s = sentinelRef.current;
    sentinelRef.current = null;
    if (s && !s.released) {
      try {
        await s.release();
      } catch {
        /* already gone — ignore */
      }
    }
  }, []);

  const acquire = useCallback(async () => {
    const wl = getWakeLock();
    if (!wl) return; // unsupported → silent no-op
    if (sentinelRef.current && !sentinelRef.current.released) return; // held
    try {
      const s = await wl.request("screen");
      sentinelRef.current = s;
      // The OS may auto-release (e.g. tab hidden); forget our ref if so.
      s.addEventListener?.("release", () => {
        if (sentinelRef.current === s) sentinelRef.current = null;
      });
    } catch {
      /* denied / unsupported → silent */
    }
  }, []);

  // Hold the lock while active; release when inactive or unmounting.
  useEffect(() => {
    if (active) acquire();
    else release();
    return () => {
      release();
    };
  }, [active, acquire, release]);

  // Re-acquire when returning to a visible tab during an active session.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible" && active) acquire();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [active, acquire]);

  return { acquire, release, isSupported: getWakeLock() !== null };
}
