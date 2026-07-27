"use client";

/* ============================================================
   BodyMap — one reusable inline SVG: simplified flat front/back
   figures with muscle groups as individually keyed shapes,
   highlighted via props. Original schematic artwork (paper-doll
   style, not traced from any reference app).
   ============================================================ */

import type { MuscleGroup } from "@/lib/exercises";

export const MUSCLE_LABELS: Record<MuscleGroup, string> = {
  quads: "Quads",
  hamstrings: "Hamstrings",
  glutes: "Glutes",
  calves: "Calves",
  hipAbductors: "Hip Abductors",
  hipAdductors: "Hip Adductors",
  core: "Core",
  lowerBack: "Lower Back",
};

const NEUTRAL = "var(--line)";
const OUTLINE = "var(--ink-soft)";

function fillFor(id: MuscleGroup, highlighted: Set<MuscleGroup>, color: string) {
  return highlighted.has(id) ? color : NEUTRAL;
}

function FrontFigure({
  highlighted,
  color,
}: {
  highlighted: Set<MuscleGroup>;
  color: string;
}) {
  const f = (id: MuscleGroup) => fillFor(id, highlighted, color);
  return (
    <g data-testid="bodymap-front">
      {/* head + neck (non-highlightable) */}
      <circle cx="50" cy="16" r="13" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <rect x="44" y="27" width="12" height="10" fill={NEUTRAL} />
      {/* chest (non-highlightable) */}
      <rect x="27" y="36" width="46" height="26" rx="13" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      {/* core (abdomen) */}
      <rect
        data-muscle="core"
        x="31"
        y="60"
        width="38"
        height="26"
        rx="10"
        fill={f("core")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* arms (non-highlightable) */}
      <rect x="12" y="38" width="13" height="46" rx="6.5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <rect x="75" y="38" width="13" height="46" rx="6.5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      {/* hip abductors (outer hip/thigh) */}
      <ellipse
        data-muscle="hipAbductors"
        cx="21"
        cy="102"
        rx="9"
        ry="21"
        fill={f("hipAbductors")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <ellipse
        data-muscle="hipAbductors"
        cx="79"
        cy="102"
        rx="9"
        ry="21"
        fill={f("hipAbductors")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* hip adductors (inner thigh) */}
      <rect
        data-muscle="hipAdductors"
        x="45"
        y="90"
        width="10"
        height="46"
        rx="5"
        fill={f("hipAdductors")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* quads (front thigh) */}
      <rect
        data-muscle="quads"
        x="29"
        y="88"
        width="16"
        height="58"
        rx="8"
        fill={f("quads")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <rect
        data-muscle="quads"
        x="55"
        y="88"
        width="16"
        height="58"
        rx="8"
        fill={f("quads")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* shins (non-highlightable) */}
      <rect x="30" y="148" width="14" height="42" rx="6" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <rect x="56" y="148" width="14" height="42" rx="6" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      {/* feet */}
      <ellipse cx="37" cy="195" rx="9" ry="5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <ellipse cx="63" cy="195" rx="9" ry="5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
    </g>
  );
}

function BackFigure({
  highlighted,
  color,
}: {
  highlighted: Set<MuscleGroup>;
  color: string;
}) {
  const f = (id: MuscleGroup) => fillFor(id, highlighted, color);
  return (
    <g data-testid="bodymap-back">
      {/* head + neck (non-highlightable) */}
      <circle cx="50" cy="16" r="13" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <rect x="44" y="27" width="12" height="10" fill={NEUTRAL} />
      {/* upper back (non-highlightable) */}
      <rect x="27" y="36" width="46" height="24" rx="13" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      {/* lower back */}
      <rect
        data-muscle="lowerBack"
        x="33"
        y="58"
        width="34"
        height="20"
        rx="9"
        fill={f("lowerBack")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* arms (non-highlightable) */}
      <rect x="12" y="38" width="13" height="46" rx="6.5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <rect x="75" y="38" width="13" height="46" rx="6.5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      {/* glutes */}
      <ellipse
        data-muscle="glutes"
        cx="38"
        cy="90"
        rx="15"
        ry="13"
        fill={f("glutes")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <ellipse
        data-muscle="glutes"
        cx="62"
        cy="90"
        rx="15"
        ry="13"
        fill={f("glutes")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* hamstrings (back thigh) */}
      <rect
        data-muscle="hamstrings"
        x="29"
        y="104"
        width="16"
        height="46"
        rx="8"
        fill={f("hamstrings")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <rect
        data-muscle="hamstrings"
        x="55"
        y="104"
        width="16"
        height="46"
        rx="8"
        fill={f("hamstrings")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* calves (back lower leg) */}
      <ellipse
        data-muscle="calves"
        cx="37"
        cy="168"
        rx="9"
        ry="20"
        fill={f("calves")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      <ellipse
        data-muscle="calves"
        cx="63"
        cy="168"
        rx="9"
        ry="20"
        fill={f("calves")}
        stroke={OUTLINE}
        strokeWidth="1"
      />
      {/* feet */}
      <ellipse cx="37" cy="195" rx="9" ry="5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
      <ellipse cx="63" cy="195" rx="9" ry="5" fill={NEUTRAL} stroke={OUTLINE} strokeWidth="1" />
    </g>
  );
}

export function BodyMap({
  highlighted,
  color = "var(--pine)",
  className,
}: {
  highlighted: MuscleGroup[];
  color?: string;
  className?: string;
}) {
  const set = new Set(highlighted);
  const label = highlighted.length
    ? `Muscles worked: ${highlighted.map((m) => MUSCLE_LABELS[m]).join(", ")}`
    : "No muscle groups highlighted";

  return (
    <div className={className}>
      <svg
        viewBox="0 0 220 205"
        width="100%"
        height="100%"
        role="img"
        aria-label={label}
      >
        <g transform="translate(0, 0)">
          <FrontFigure highlighted={set} color={color} />
        </g>
        <g transform="translate(120, 0)">
          <BackFigure highlighted={set} color={color} />
        </g>
      </svg>
      <div className="bodymap-labels">
        <span className="bodymap-caption">Front</span>
        <span className="bodymap-caption">Back</span>
      </div>
      {highlighted.length > 0 && (
        <div className="bodymap-chips">
          {highlighted.map((m) => (
            <span key={m} className="bodymap-chip" style={{ color, borderColor: color }}>
              {MUSCLE_LABELS[m]}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
