"use client";

/* ============================================================
   Accessory — primitive-built cosmetic meshes, one per catalog item
   (src/lib/rewards.ts ITEMS). Rendered as a child of whichever socket
   group the item's slot resolves to (see buildAccessorySlots below),
   so the same mesh works unmodified on every species' silhouette.
   ============================================================ */

import type { ReactNode } from "react";
import type { AccessorySlots } from "./ProceduralCreature";
import type { Equipped } from "@/lib/rewards";
import { SOCKET_FOR_SLOT, type Slot } from "@/lib/rewards";

export function Accessory({ itemId }: { itemId: string }) {
  switch (itemId) {
    case "sweatband":
      return (
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.32, 0.055, 8, 16, Math.PI]} />
          <meshStandardMaterial color="#E05A4E" />
        </mesh>
      );
    case "party":
      return (
        <mesh position={[0, 0.18, 0]}>
          <coneGeometry args={[0.18, 0.36, 12]} />
          <meshStandardMaterial color="#E09A32" />
        </mesh>
      );
    case "crown":
      return (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.24, 0.28, 0.16, 8]} />
          <meshStandardMaterial color="#F2C94C" />
        </mesh>
      );
    case "glasses":
      return (
        <group>
          <mesh position={[-0.14, 0, 0.03]}>
            <torusGeometry args={[0.08, 0.016, 8, 16]} />
            <meshStandardMaterial color="#22332D" />
          </mesh>
          <mesh position={[0.14, 0, 0.03]}>
            <torusGeometry args={[0.08, 0.016, 8, 16]} />
            <meshStandardMaterial color="#22332D" />
          </mesh>
        </group>
      );
    case "bandana":
      return (
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.24, 0.2, 4]} />
          <meshStandardMaterial color="#EB5757" />
        </mesh>
      );
    case "medal":
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#F2C94C" />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.16, 6]} />
            <meshStandardMaterial color="#3E5C9A" />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

/** Maps the currently-equipped items to their 3D socket, skipping `bg`
 * (a scene backdrop, not a body attachment — see SceneBackdrop.tsx). */
export function buildAccessorySlots(equipped: Equipped): AccessorySlots {
  const slots: Record<string, ReactNode> = {};
  (Object.keys(SOCKET_FOR_SLOT) as Slot[]).forEach((slot) => {
    const itemId = equipped[slot];
    const socket = SOCKET_FOR_SLOT[slot];
    if (itemId && socket) slots[socket] = <Accessory itemId={itemId} />;
  });
  return slots;
}
