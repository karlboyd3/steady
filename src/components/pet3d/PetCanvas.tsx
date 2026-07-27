"use client";

/* ============================================================
   PetCanvas — the actual <Canvas>: lighting, camera, rotate-only
   OrbitControls, and the idle bob/spin (skipped under
   prefers-reduced-motion, which renders one static pose instead).

   When `celebration` is set, CelebrationRig replaces the idle bob with
   a rigid-body transform (spin/hop/scale) driven by celebrationClips.ts,
   applied to the group wrapping whichever creature is rendered —
   Procedural or Gltf, the transform math doesn't care which. It's the
   only motion possible for the placeholder creature (its legs have no
   independent joints), and it's what real GLTF clips play on top of.
   prefers-reduced-motion collapses this to a single static pose too.
   ============================================================ */

import { Suspense, useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
// Deep import (not the "@react-three/drei" barrel) — see GltfCreature.tsx.
import { OrbitControls } from "@react-three/drei/core/OrbitControls";
import type { Group } from "three";
import type { Equipped, Species } from "@/lib/rewards";
import type { Tier } from "@/lib/celebration";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { ProceduralCreature } from "./ProceduralCreature";
import { GltfCreature } from "./GltfCreature";
import { useModelAvailable } from "./useModelAvailable";
import { buildAccessorySlots } from "./Accessory";
import { celebrationTransform } from "./celebrationClips";

export interface ActiveCelebration {
  tier: Tier;
  subdued: boolean;
  variantIndex: number;
}

function CelebrationRig({
  reducedMotion,
  celebration,
  children,
}: {
  reducedMotion: boolean;
  celebration: ActiveCelebration | null;
  children: ReactNode;
}) {
  const ref = useRef<Group>(null);
  const startRef = useRef<number | null>(null);
  const keyRef = useRef<string | null>(null);
  const celebrationKey = celebration
    ? `${celebration.tier}-${celebration.variantIndex}-${celebration.subdued}`
    : null;

  useFrame((state) => {
    const g = ref.current;
    if (!g) return;

    if (reducedMotion) {
      g.rotation.y = 0;
      g.position.y = 0;
      g.scale.y = 1;
      return;
    }

    if (!celebration) {
      startRef.current = null;
      keyRef.current = null;
      g.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.35;
      g.position.y = Math.sin(state.clock.elapsedTime * 1.2) * 0.03;
      g.scale.y = 1;
      return;
    }

    if (keyRef.current !== celebrationKey) {
      keyRef.current = celebrationKey;
      startRef.current = state.clock.elapsedTime;
    }
    const elapsed = state.clock.elapsedTime - (startRef.current ?? state.clock.elapsedTime);
    const t = celebrationTransform(
      celebration.tier,
      celebration.variantIndex,
      celebration.subdued,
      elapsed
    );
    g.rotation.y = t.rotY;
    g.position.y = t.posY;
    g.scale.y = t.scaleY;
  });

  return <group ref={ref}>{children}</group>;
}

function CreatureSwitch({
  species,
  equipped,
  celebration,
}: {
  species: Species;
  equipped: Equipped;
  celebration: ActiveCelebration | null;
}) {
  const modelAvailable = useModelAvailable(species);
  const accessories = buildAccessorySlots(equipped);
  return modelAvailable ? (
    <GltfCreature species={species} accessories={accessories} celebration={celebration} />
  ) : (
    <ProceduralCreature species={species} accessories={accessories} />
  );
}

export function PetCanvas({
  species,
  equipped,
  celebration = null,
  interactive = true,
  onContextLost,
}: {
  species: Species;
  equipped: Equipped;
  celebration?: ActiveCelebration | null;
  /** Disable manual camera drag — celebrations play as a directed
   * moment, not something to be fiddled with mid-animation. */
  interactive?: boolean;
  onContextLost?: () => void;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      camera={{ position: [0, 1.3, 3.2], fov: 40 }}
      dpr={[1, 2]}
      gl={{ alpha: true }}
      onCreated={({ gl }) => {
        if (!onContextLost) return;
        gl.domElement.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          onContextLost();
        });
      }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[2, 3, 2]} intensity={1.1} />
      <Suspense fallback={null}>
        <CelebrationRig reducedMotion={reducedMotion} celebration={celebration}>
          <CreatureSwitch species={species} equipped={equipped} celebration={celebration} />
        </CelebrationRig>
      </Suspense>
      {interactive && (
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3}
          maxPolarAngle={Math.PI / 1.8}
        />
      )}
    </Canvas>
  );
}
