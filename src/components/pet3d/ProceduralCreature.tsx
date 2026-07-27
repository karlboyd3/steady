"use client";

/* ============================================================
   ProceduralCreature — assembles one species from primitive geometry
   (spheres/cones/cylinders/torus). This is what renders until a real
   /public/models/{species}.glb exists (see GltfCreature.tsx).

   Exposes the same 4 sockets (head/neck/chest/face) as named <group>
   anchors so <Accessory> can attach identically regardless of whether
   the body underneath is procedural or a loaded GLTF.
   ============================================================ */

import { forwardRef, type ReactNode } from "react";
import type { Group } from "three";
import type { Socket, Species } from "@/lib/rewards";
import { CREATURES, SOCKET_TRANSFORMS, type EarStyle, type TailStyle } from "./species-shapes";
import { SocketGroup } from "./SocketGroup";

export type AccessorySlots = Partial<Record<Socket, ReactNode>>;

function Ears({ style, color }: { style: EarStyle; color: string }) {
  switch (style) {
    case "pointed":
      return (
        <group position={[0, 1.35, 0.7]}>
          <mesh position={[-0.22, 0.15, 0]} rotation={[0, 0, -0.2]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.22, 0.15, 0]} rotation={[0, 0, 0.2]}>
            <coneGeometry args={[0.1, 0.3, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case "floppy":
      return (
        <group position={[0, 1.15, 0.75]}>
          <mesh position={[-0.32, -0.1, 0]} rotation={[0, 0, -0.35]}>
            <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.32, -0.1, 0]} rotation={[0, 0, 0.35]}>
            <capsuleGeometry args={[0.09, 0.28, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case "tall":
      return (
        <group position={[0, 1.35, 0.7]}>
          <mesh position={[-0.15, 0.32, 0]} rotation={[0, 0, -0.1]}>
            <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.15, 0.32, 0]} rotation={[0, 0, 0.1]}>
            <capsuleGeometry args={[0.07, 0.4, 4, 8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case "round":
      return (
        <group position={[0, 1.35, 0.65]}>
          <mesh position={[-0.26, 0.05, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0.26, 0.05, 0]}>
            <sphereGeometry args={[0.14, 12, 12]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
      );
    case "none":
    default:
      return null;
  }
}

function Tail({ style, color, dark }: { style: TailStyle; color: string; dark: string }) {
  switch (style) {
    case "stub":
      return (
        <mesh position={[0, 0.55, -0.75]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.1, 0.2, 8]} />
          <meshStandardMaterial color={dark} />
        </mesh>
      );
    case "bushy":
      return (
        <group position={[0, 0.6, -0.9]} rotation={[Math.PI / 2.4, 0, 0]}>
          <mesh>
            <coneGeometry args={[0.18, 0.55, 10]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <sphereGeometry args={[0.09, 10, 10]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      );
    case "curled":
      return (
        <mesh position={[0, 0.75, -0.85]} rotation={[Math.PI / 2, 0.4, 0]}>
          <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI * 1.4]} />
          <meshStandardMaterial color={dark} />
        </mesh>
      );
    case "poof":
      return (
        <mesh position={[0, 0.55, -0.8]}>
          <sphereGeometry args={[0.16, 12, 12]} />
          <meshStandardMaterial color={color} />
        </mesh>
      );
    case "none":
    default:
      return null;
  }
}

function Legs({ color }: { color: string }) {
  const positions: [number, number, number][] = [
    [-0.32, 0.17, 0.4],
    [0.32, 0.17, 0.4],
    [-0.32, 0.17, -0.35],
    [0.32, 0.17, -0.35],
  ];
  return (
    <>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.11, 0.13, 0.35, 10]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </>
  );
}

/** Returns the 4 socket groups as a lookup keyed by socket name, and the
 * rendered node tree. Kept together so callers never have to compute
 * offsets themselves. */
export const ProceduralCreature = forwardRef<
  Group,
  { species: Species; accessories?: AccessorySlots }
>(function ProceduralCreature({ species, accessories }, ref) {
  const c = CREATURES[species];
  const sockets = SOCKET_TRANSFORMS[species];

  return (
    <group ref={ref}>
      <Legs color={c.darkColor} />
      <Tail style={c.tailStyle} color={c.color} dark={c.darkColor} />

      {/* body */}
      <mesh position={[0, 0.65, 0]} scale={c.bodyScale}>
        <sphereGeometry args={[0.55, 20, 16]} />
        <meshStandardMaterial color={c.color} />
      </mesh>

      {c.hasShell && (
        <group position={[0, 0.95, -0.05]}>
          <mesh scale={[0.62, 0.36, 0.72]}>
            <sphereGeometry args={[0.55, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={c.color} />
          </mesh>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.36, 0.05, 8, 24]} />
            <meshStandardMaterial color={c.darkColor} />
          </mesh>
        </group>
      )}

      <Ears style={c.earStyle} color={c.color} />

      {c.hasSnout && (
        <mesh position={[0, 1.0, 1.05]} scale={c.headScale}>
          <boxGeometry args={[0.22, 0.16, 0.24]} />
          <meshStandardMaterial color={c.color} />
        </mesh>
      )}

      {/* head */}
      <mesh position={[0, 1.1, 0.7]} scale={c.headScale}>
        <sphereGeometry args={[0.34, 20, 16]} />
        <meshStandardMaterial color={c.color} />
      </mesh>
      {/* eyes */}
      <mesh position={[-0.14 * c.headScale, 1.16, 0.95 * c.headScale]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#22332D" />
      </mesh>
      <mesh position={[0.14 * c.headScale, 1.16, 0.95 * c.headScale]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshStandardMaterial color="#22332D" />
      </mesh>

      {/* socket anchors — accessories attach here */}
      {(["head", "face", "neck", "chest"] as Socket[]).map((socket) => (
        <SocketGroup key={socket} transform={sockets[socket]}>
          {accessories?.[socket]}
        </SocketGroup>
      ))}
    </group>
  );
});
