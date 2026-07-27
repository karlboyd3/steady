"use client";

/* ============================================================
   GltfCreature — loads a real /public/models/{species}.glb. Only
   mounted once useModelAvailable() has confirmed the file exists
   (see PetCanvas.tsx), so useGLTF's suspense/throw behavior is never
   exercised against a missing file.

   Socket convention: if the model has named nodes "head" / "face" /
   "neck" / "chest" (empties or bones), accessories attach there
   automatically — drop in a real model built to that convention and
   it lights up with zero code changes. Otherwise falls back to the
   same placeholder SOCKET_OFFSETS ProceduralCreature uses.

   Celebration clips: if the model has a named AnimationClip matching
   celebrationClips.ts's CLIP_NAMES, it plays automatically when a
   celebration is requested; otherwise this renders statically and the
   caller's outer rigid-body transform (PetCanvas's CelebrationRig) is
   the only motion — same "real asset auto-activates, else fall back"
   pattern used everywhere else in pet3d/.
   ============================================================ */

import { useEffect, useRef } from "react";
// Deep imports (not the "@react-three/drei" barrel) so webpack doesn't
// pull in unrelated drei features (troika text, camera-controls, etc.)
// that the barrel's index re-exports alongside these.
import { useGLTF } from "@react-three/drei/core/Gltf";
import { useAnimations } from "@react-three/drei/core/useAnimations";
import type { Group, Object3D } from "three";
import type { Socket, Species } from "@/lib/rewards";
import type { Tier } from "@/lib/celebration";
import { SOCKET_OFFSETS } from "./species-shapes";
import { CLIP_NAMES } from "./celebrationClips";
import type { AccessorySlots } from "./ProceduralCreature";

export function GltfCreature({
  species,
  accessories,
  celebration,
}: {
  species: Species;
  accessories?: AccessorySlots;
  celebration?: { tier: Tier; subdued: boolean } | null;
}) {
  const { scene, animations, nodes } = useGLTF(`/models/${species}.glb`);
  const groupRef = useRef<Group>(null);
  const { actions } = useAnimations(animations, groupRef);
  const fallbackSockets = SOCKET_OFFSETS[species];

  const tier = celebration?.tier;
  const subdued = celebration?.subdued ?? false;
  useEffect(() => {
    const clipName = !tier || subdued ? CLIP_NAMES.idle : CLIP_NAMES[tier];
    const action = actions[clipName] ?? actions[CLIP_NAMES.idle];
    if (!action) return;
    action.reset().fadeIn(0.2).play();
    return () => {
      action.fadeOut(0.2);
    };
  }, [tier, subdued, actions]);

  const socketPosition = (socket: Socket): [number, number, number] => {
    const node = (nodes as Record<string, Object3D>)[socket];
    return node
      ? [node.position.x, node.position.y, node.position.z]
      : fallbackSockets[socket];
  };

  return (
    <group ref={groupRef}>
      <primitive object={scene} />
      <group position={socketPosition("head")}>{accessories?.head}</group>
      <group position={socketPosition("face")}>{accessories?.face}</group>
      <group position={socketPosition("neck")}>{accessories?.neck}</group>
      <group position={socketPosition("chest")}>{accessories?.chest}</group>
    </group>
  );
}
