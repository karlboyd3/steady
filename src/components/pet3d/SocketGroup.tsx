"use client";

/* ============================================================
   SocketGroup — the single place a SocketTransform becomes an r3f
   <group>. Shared by ProceduralCreature and GltfCreature so an
   accessory sits identically whether the body under it is placeholder
   primitives or a real loaded model.

   `position` overrides the configured offset: GltfCreature passes the
   real bone's position when the loaded model actually has that bone,
   and omits it (falling back to the configured offset) when it doesn't.
   Rotation and scale always come from config, since they fine-tune how
   the accessory sits on the anchor either way.
   ============================================================ */

import type { ReactNode } from "react";
import type { SocketTransform } from "./species-shapes";

export function SocketGroup({
  transform,
  position,
  children,
}: {
  transform: SocketTransform;
  position?: [number, number, number];
  children?: ReactNode;
}) {
  return (
    <group
      position={position ?? transform.offset}
      rotation={transform.rotation}
      scale={transform.scale}
    >
      {children}
    </group>
  );
}
