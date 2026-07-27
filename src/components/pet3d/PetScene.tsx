"use client";

/* ============================================================
   PetScene — the full 3D pet screen experience. Default export so it
   can be next/dynamic-imported (ssr:false) from PetScreen.tsx, which
   is the ONLY route that ever pulls this file (and therefore
   three.js/@react-three/*) into a webpack chunk.

   Never white-screens: while the WebGL check hasn't resolved yet, if
   WebGL isn't available, or if the canvas throws/loses its context at
   runtime, this renders the same 2D <Pet> used on the Home and Done
   screens instead.
   ============================================================ */

import { useEffect, useState } from "react";
import type { Equipped, Species } from "@/lib/rewards";
import { Pet } from "../Pet";
import { PetCanvas } from "./PetCanvas";
import { SceneBackdrop } from "./SceneBackdrop";
import { WebglErrorBoundary } from "./WebglErrorBoundary";
import { hasWebGL } from "./hasWebGL";

export default function PetScene({
  species,
  equipped,
  name,
}: {
  species: Species;
  equipped: Equipped;
  name?: string;
}) {
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [contextLost, setContextLost] = useState(false);

  useEffect(() => {
    setWebglOk(hasWebGL());
  }, []);

  const fallback = <Pet equipped={equipped} size={230} name={name} species={species} />;

  if (!webglOk || contextLost) return fallback;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 320,
        aspectRatio: "1",
        margin: "0 auto",
      }}
    >
      <SceneBackdrop bg={equipped.bg} />
      <WebglErrorBoundary fallback={fallback}>
        <PetCanvas species={species} equipped={equipped} onContextLost={() => setContextLost(true)} />
      </WebglErrorBoundary>
    </div>
  );
}
