"use client";

/* ============================================================
   Figure — animated stick-figure demo with a live knee-angle readout.
   `t` is the pose phase (0 = pose A, 1 = pose B). With reduced motion
   we cross-fade between the two end poses instead of oscillating.
   ============================================================ */

import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { Exercise, Point, Pose, Prop } from "@/lib/exercises";

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpPt = (a: Point, b: Point, t: number): Point => [
  lerp(a[0], b[0], t),
  lerp(a[1], b[1], t),
];
function lerpPose(A: Pose, B: Pose, t: number): Pose {
  const out = {} as Pose;
  (Object.keys(A) as (keyof Pose)[]).forEach((k) => {
    out[k] = lerpPt(A[k], B[k], t);
  });
  return out;
}

function Props({ prop }: { prop: Prop }) {
  const s = {
    stroke: "#B9C9C1",
    strokeWidth: 5,
    strokeLinecap: "round" as const,
    fill: "none",
  };
  return (
    <g>
      {prop === "mat" && (
        <rect x="14" y="150" width="176" height="10" rx="5" fill="#DCE8E2" />
      )}
      {(prop === "chair" || prop === "support") && (
        <g {...s}>
          {prop === "chair" ? (
            <>
              <line x1="52" y1="118" x2="94" y2="118" />
              <line x1="56" y1="118" x2="56" y2="172" />
              <line x1="90" y1="118" x2="90" y2="172" />
              <line x1="56" y1="118" x2="56" y2="76" />
            </>
          ) : (
            <>
              <line x1="62" y1="96" x2="62" y2="172" />
              <line x1="50" y1="96" x2="74" y2="96" />
            </>
          )}
        </g>
      )}
      {prop === "wall" && (
        <line x1="148" y1="36" x2="148" y2="172" {...s} strokeWidth={6} />
      )}
      {prop === "wallRight" && (
        <line x1="124" y1="36" x2="124" y2="172" {...s} strokeWidth={6} />
      )}
      <line
        x1="10"
        y1="172"
        x2="190"
        y2="172"
        stroke="#C7D5CE"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </g>
  );
}

function kneeBend(hip: Point, k: Point, a: Point): number {
  const v1 = [hip[0] - k[0], hip[1] - k[1]];
  const v2 = [a[0] - k[0], a[1] - k[1]];
  const m1 = Math.hypot(v1[0], v1[1]);
  const m2 = Math.hypot(v2[0], v2[1]);
  if (m1 < 1 || m2 < 1) return 0;
  const cos = Math.max(
    -1,
    Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / (m1 * m2))
  );
  return Math.round(180 - (Math.acos(cos) * 180) / Math.PI);
}

function FigureSVG({
  exercise,
  t,
  showAngle,
}: {
  exercise: Exercise;
  t: number;
  showAngle: boolean;
}) {
  const P = lerpPose(exercise.poses.A, exercise.poses.B, t);
  const skin = "#C98A5B",
    hair = "#3A2E28",
    shirt = "#3E7D6C",
    pantsS = "#5A6B7E",
    pantsA = "#E09A32",
    shoe = "#3A3F45";
  const bend = kneeBend(P.hip, P.kA, P.aA);
  const cap = {
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none",
  };
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden="true">
      <Props prop={exercise.prop} />
      {/* support leg (dimmed) */}
      <polyline
        points={`${P.hip} ${P.kS} ${P.aS}`}
        stroke={pantsS}
        strokeWidth="11"
        {...cap}
        opacity="0.85"
      />
      <circle cx={P.aS[0]} cy={P.aS[1]} r="5.5" fill={shoe} opacity="0.85" />
      {/* torso + neck */}
      <polyline points={`${P.sho} ${P.hip}`} stroke={shirt} strokeWidth="17" {...cap} />
      <polyline points={`${P.sho} ${P.head}`} stroke={skin} strokeWidth="6" {...cap} />
      {/* head */}
      <circle cx={P.head[0]} cy={P.head[1]} r="11" fill={skin} />
      <path
        d={`M ${P.head[0] - 11} ${P.head[1] - 3} A 11 11 0 0 1 ${
          P.head[0] + 11
        } ${P.head[1] - 3}`}
        fill={hair}
      />
      {/* arm: shirt sleeve + forearm */}
      <polyline points={`${P.sho} ${P.elb}`} stroke={shirt} strokeWidth="9" {...cap} />
      <polyline points={`${P.elb} ${P.hnd}`} stroke={skin} strokeWidth="7.5" {...cap} />
      {/* active leg (highlighted) */}
      <polyline
        points={`${P.hip} ${P.kA} ${P.aA}`}
        stroke={pantsA}
        strokeWidth="11"
        {...cap}
      />
      <circle cx={P.aA[0]} cy={P.aA[1]} r="5.5" fill={shoe} />
      {/* knee joint marker + live bend angle */}
      <circle
        cx={P.kA[0]}
        cy={P.kA[1]}
        r="9"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="3"
        opacity="0.95"
      />
      <circle
        cx={P.kA[0]}
        cy={P.kA[1]}
        r="9"
        fill="none"
        stroke="#2F6D5B"
        strokeWidth="1.5"
        strokeDasharray="3 3"
      />
      {showAngle && (
        <text
          x={P.kA[0] + 13}
          y={P.kA[1] - 8}
          fontSize="12"
          fontWeight="700"
          fill="#22332D"
          stroke="#fff"
          strokeWidth="3.5"
          paintOrder="stroke"
          fontFamily="inherit"
        >
          {bend}°
        </text>
      )}
    </svg>
  );
}

export function Figure({
  exercise,
  t,
  showAngle = true,
}: {
  exercise: Exercise;
  t: number;
  showAngle?: boolean;
}) {
  const reduced = useReducedMotion();
  if (reduced) {
    // Gentle cross-fade between the two end poses (no oscillation).
    return (
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - t, transition: "opacity 0.5s ease" }}>
          <FigureSVG exercise={exercise} t={0} showAngle={showAngle && t < 0.5} />
        </div>
        <div style={{ position: "absolute", inset: 0, opacity: t, transition: "opacity 0.5s ease" }}>
          <FigureSVG exercise={exercise} t={1} showAngle={showAngle && t >= 0.5} />
        </div>
      </div>
    );
  }
  return <FigureSVG exercise={exercise} t={t} showAngle={showAngle} />;
}
