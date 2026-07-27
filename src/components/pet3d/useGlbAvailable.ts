"use client";

/* ============================================================
   useGlbAvailable — shared drop-in probe for an optional .glb asset.
   Mirrors ExerciseAnimation.tsx's Lottie probe: try fetching it, branch
   render on success/failure, so dropping a real file into /public
   activates it with zero code changes. A HEAD request is enough since
   we never need the body — useGLTF re-fetches it for the actual load
   once this resolves true.

   Used for both pet species models (/models/{species}.glb) and cosmetic
   models (/models/cosmetics/{itemId}.glb).
   ============================================================ */

import { useEffect, useState } from "react";

export function useGlbAvailable(url: string): boolean {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setAvailable(false);
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (!cancelled) setAvailable(res.ok);
      })
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return available;
}
