"use client";

/* ============================================================
   GltfAccessory — loads a real /public/models/cosmetics/{itemId}.glb.
   Only mounted once useCosmeticModelAvailable() has confirmed the file
   exists (see Accessory.tsx), so useGLTF's suspense/throw behavior is
   never exercised against a missing file.

   The model is rendered as-is at the socket's origin: the socket group
   (SocketGroup) already carries the species-specific offset, rotation,
   and scale, so one cosmetic asset authored at origin works unmodified
   on every species.
   ============================================================ */

// Deep import (not the "@react-three/drei" barrel) — see GltfCreature.tsx.
import { useGLTF } from "@react-three/drei/core/Gltf";
import { cosmeticModelUrl } from "./useModelAvailable";

export function GltfAccessory({ itemId }: { itemId: string }) {
  const { scene } = useGLTF(cosmeticModelUrl(itemId));
  // Clone so the same cached asset can appear on more than one socket or
  // scene at once (useGLTF caches by URL and returns a shared object).
  return <primitive object={scene.clone()} />;
}
