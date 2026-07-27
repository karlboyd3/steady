/* ============================================================
   Celebration clip names + procedural fallback animation math.
   Pure, framework-free (no three.js/r3f import here) so it's testable
   without a WebGL context, mirroring species-shapes.ts's split between
   pure geometry description and the r3f components that consume it.

   Clip naming convention for real GLTF assets (see GltfCreature.tsx):
   drop clips named "idle" / "celebrate_small" / "celebrate_streak" /
   "celebrate_big" into a species' .glb and they activate automatically,
   same zero-code-change pattern as Change 2's socket resolution.

   SAFETY: this is a knee rehab app. celebrate_* clips — procedural or
   real — must read as clearly fantasy (spin, hop, sparkle), never as
   knee-bend/squat/lunge articulation a patient could mistake for
   exercise instruction. The procedural transforms below only ever
   rotate/translate/stretch the whole rigid body upward (scaleY >= 1,
   posY >= 0) — never a downward crouch — and ProceduralCreature's legs
   have no independent joints at all, so a squat motion isn't even
   representable by the placeholder rig. Real asset authors should keep
   the same constraint.
   ============================================================ */

import type { Tier } from "@/lib/celebration";

export const CLIP_NAMES = {
  idle: "idle",
  session: "celebrate_small",
  streak: "celebrate_streak",
  track: "celebrate_big",
} as const;

export const TIER_DURATIONS: Record<Tier, number> = {
  session: 1.5,
  streak: 2.2,
  track: 3,
};

export interface CelebrationTransform {
  rotY: number;
  posY: number;
  scaleY: number;
}

const REST: CelebrationTransform = { rotY: 0, posY: 0, scaleY: 1 };

type VariantFn = (elapsedSeconds: number, duration: number) => CelebrationTransform;

function sessionBounce(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const bounce = Math.sin((t / duration) * Math.PI);
  return { rotY: 0, posY: bounce * 0.18, scaleY: 1 + bounce * 0.08 };
}

function sessionWiggle(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const p = t / duration;
  const decay = 1 - p;
  return {
    rotY: Math.sin(p * Math.PI * 6) * 0.25 * decay,
    posY: Math.sin(p * Math.PI) * 0.08,
    scaleY: 1,
  };
}

function streakHopSpin(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const p = t / duration;
  const bounce = Math.abs(Math.sin(p * Math.PI * 2));
  return { rotY: p * Math.PI * 2, posY: bounce * 0.3, scaleY: 1 + bounce * 0.1 };
}

function streakDoubleBounce(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const p = t / duration;
  const bounce = Math.abs(Math.sin(p * Math.PI * 3));
  return { rotY: 0, posY: bounce * 0.28, scaleY: 1 + bounce * 0.12 };
}

function trackSpinBounce(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const p = t / duration;
  const bounce = Math.abs(Math.sin(p * Math.PI * 2.5));
  return { rotY: p * Math.PI * 4, posY: bounce * 0.4, scaleY: 1 + bounce * 0.15 };
}

function trackBigBounce(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const p = t / duration;
  const bounce = Math.abs(Math.sin(p * Math.PI * 3.5));
  return {
    rotY: Math.sin(p * Math.PI * 2) * 0.4,
    posY: bounce * 0.45,
    scaleY: 1 + bounce * 0.18,
  };
}

/** Gentle acknowledgment used for every tier when subdued — a slow single
 * breathe, no hop/spin, no exuberance. */
export function subduedTransform(t: number, duration: number): CelebrationTransform {
  if (t >= duration) return REST;
  const breathe = Math.sin((t / duration) * Math.PI);
  return { rotY: 0, posY: 0, scaleY: 1 + breathe * 0.02 };
}

const VARIANTS: Record<Tier, VariantFn[]> = {
  session: [sessionBounce, sessionWiggle],
  streak: [streakHopSpin, streakDoubleBounce],
  track: [trackSpinBounce, trackBigBounce],
};

export function variantCount(tier: Tier): number {
  return VARIANTS[tier].length;
}

/** Picks a variant index for `tier`, avoiding an immediate repeat of
 * `lastIndex` when 2+ variants exist. Pure — callers own the "last
 * played" memory (e.g. a ref), so this stays free of module-level state. */
export function pickVariantIndex(
  tier: Tier,
  lastIndex: number | null,
  random: () => number = Math.random
): number {
  const count = variantCount(tier);
  if (count <= 1) return 0;
  const next = Math.floor(random() * count);
  return next === lastIndex ? (next + 1) % count : next;
}

/** Resolves the transform for a tier/variant at a point in time,
 * substituting the shared subdued treatment when `subdued` is true. */
export function celebrationTransform(
  tier: Tier,
  variantIndex: number,
  subdued: boolean,
  elapsedSeconds: number
): CelebrationTransform {
  const duration = TIER_DURATIONS[tier];
  if (subdued) return subduedTransform(elapsedSeconds, duration);
  const variants = VARIANTS[tier];
  const fn = variants[variantIndex % variants.length];
  return fn(elapsedSeconds, duration);
}
