"use client";

/* ============================================================
   usePetPreload — warms the pet3d chunk and (if present) the species
   GLTF model while the workout is still in progress, so the done
   screen's celebration never shows a visible loading gap. Mirrors
   useModelAvailable's existing fetch-probe pattern. Purely additive:
   failure is silent, since Change 2's procedural/2D fallbacks already
   handle a missing or unavailable model.

   IMPORTANT: @react-three/drei is imported dynamically here, not at
   module scope. SessionPlayer.tsx (used on every /session render, not
   just the done screen) imports this hook statically — a top-level
   `import { useGLTF } from "@react-three/drei"` would drag three.js
   into /session's initial bundle, exactly what Change 2/3 keep lazy.
   ============================================================ */

import { useEffect } from "react";
import type { Species } from "@/lib/rewards";

export function usePetPreload(species: Species): void {
  useEffect(() => {
    let cancelled = false;

    // Warm the webpack chunk for the celebration scene.
    import("./CelebrationScene").catch(() => {});

    // Warm the GLTF cache only if a real model actually exists.
    const url = `/models/${species}.glb`;
    fetch(url, { method: "HEAD" })
      .then((res) => {
        if (cancelled || !res.ok) return;
        return import("@react-three/drei/core/Gltf").then(({ useGLTF }) => {
          if (!cancelled) useGLTF.preload(url);
        });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [species]);
}
