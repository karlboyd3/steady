"use client";

/* ============================================================
   Probes for a real /public/models/{species}.glb the same way
   ExerciseAnimation.tsx probes for a real Lottie file: try fetching
   it, branch render on success/failure. A HEAD request (not GET) is
   enough here since, unlike the Lottie JSON, we never need the body —
   useGLTF re-fetches it for the actual load once this resolves true.
   ============================================================ */

import { useEffect, useState } from "react";
import type { Species } from "@/lib/rewards";

export function useModelAvailable(species: Species): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAvailable(false);
    fetch(`/models/${species}.glb`, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [species]);

  return available;
}
