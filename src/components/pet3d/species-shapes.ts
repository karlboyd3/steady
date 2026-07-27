/* ============================================================
   Per-species placeholder geometry + socket anchor tables.
   Placeholder mode: creatures are assembled from primitive geometry
   (spheres/cones/cylinders/torus) since no real .glb assets exist yet.
   SOCKET_OFFSETS is the placeholder-mode stand-in for named socket
   nodes on a real model — see GltfCreature.tsx for how a real .glb
   with head/neck/chest/face nodes overrides these automatically.
   ============================================================ */

import type { Socket, Species } from "@/lib/rewards";

export type EarStyle = "none" | "pointed" | "floppy" | "tall" | "round";
export type TailStyle = "none" | "stub" | "bushy" | "curled" | "poof";

export interface CreatureDescriptor {
  color: string;
  darkColor: string;
  headScale: number;
  bodyScale: [number, number, number];
  hasShell: boolean;
  hasSnout: boolean;
  earStyle: EarStyle;
  tailStyle: TailStyle;
}

export const CREATURES: Record<Species, CreatureDescriptor> = {
  turtle: {
    color: "#4E8A66",
    darkColor: "#3C6E51",
    headScale: 0.85,
    bodyScale: [0.62, 0.42, 0.78],
    hasShell: true,
    hasSnout: false,
    earStyle: "none",
    tailStyle: "stub",
  },
  fox: {
    color: "#E8935A",
    darkColor: "#C97540",
    headScale: 0.95,
    bodyScale: [0.55, 0.5, 0.7],
    hasShell: false,
    hasSnout: true,
    earStyle: "pointed",
    tailStyle: "bushy",
  },
  dog: {
    color: "#C99A6B",
    darkColor: "#A97D4C",
    headScale: 1,
    bodyScale: [0.58, 0.5, 0.72],
    hasShell: false,
    hasSnout: true,
    earStyle: "floppy",
    tailStyle: "stub",
  },
  cat: {
    color: "#9E9EAA",
    darkColor: "#7E7E8C",
    headScale: 0.9,
    bodyScale: [0.5, 0.46, 0.68],
    hasShell: false,
    hasSnout: false,
    earStyle: "pointed",
    tailStyle: "curled",
  },
  rabbit: {
    color: "#F0E4D6",
    darkColor: "#D9C4AC",
    headScale: 0.9,
    bodyScale: [0.52, 0.48, 0.66],
    hasShell: false,
    hasSnout: false,
    earStyle: "tall",
    tailStyle: "poof",
  },
  bear: {
    color: "#8C6A48",
    darkColor: "#6C4E30",
    headScale: 1.05,
    bodyScale: [0.68, 0.56, 0.8],
    hasShell: false,
    hasSnout: true,
    earStyle: "round",
    tailStyle: "none",
  },
};

const BASE_SOCKETS: Record<Socket, [number, number, number]> = {
  head: [0, 1.2, 0.75],
  face: [0, 1.05, 1.05],
  neck: [0, 0.85, 0.55],
  chest: [0, 0.55, 0.55],
};

/** Placeholder-mode socket anchors, nudged per species by head/body scale
 * so accessories land close to the right spot on every silhouette. */
export const SOCKET_OFFSETS: Record<Species, Record<Socket, [number, number, number]>> =
  Object.fromEntries(
    (Object.keys(CREATURES) as Species[]).map((species) => {
      const { headScale, bodyScale } = CREATURES[species];
      const scaled: Record<Socket, [number, number, number]> = {
        head: [
          BASE_SOCKETS.head[0],
          BASE_SOCKETS.head[1] * headScale,
          BASE_SOCKETS.head[2] * headScale,
        ],
        face: [
          BASE_SOCKETS.face[0],
          BASE_SOCKETS.face[1] * headScale,
          BASE_SOCKETS.face[2] * headScale,
        ],
        neck: [BASE_SOCKETS.neck[0], BASE_SOCKETS.neck[1], BASE_SOCKETS.neck[2] * bodyScale[2]],
        chest: [
          BASE_SOCKETS.chest[0],
          BASE_SOCKETS.chest[1],
          BASE_SOCKETS.chest[2] * bodyScale[2],
        ],
      };
      return [species, scaled];
    })
  ) as Record<Species, Record<Socket, [number, number, number]>>;
