/* ============================================================
   Pet — the 2D companion mascot, with wearables (hat/face/neck/chest)
   and background scenes, plus an optional cheering state.

   Species-aware: the head (position, face, wearable anchor points) is
   identical across all 6 species so the existing wearable overlay math
   never has to change — only the body/ears/tail/snout silhouette varies.
   This is also the WebGL-unavailable fallback and the small preview used
   on the Home and Done screens, so it never pulls in three.js.
   ============================================================ */

import type { Equipped, Species } from "@/lib/rewards";

type EarStyle = "none" | "pointed" | "floppy" | "tall" | "round";
type TailStyle = "none" | "stub" | "bushy" | "curled" | "poof";

interface SpeciesShape {
  body: string;
  bodyDark: string;
  head: string;
  headStroke: string;
  ear: EarStyle;
  tail: TailStyle;
  shell: boolean;
  snout: boolean;
}

const SHAPES: Record<Species, SpeciesShape> = {
  turtle: {
    body: "#4E8A66",
    bodyDark: "#3C6E51",
    head: "#8CBE8F",
    headStroke: "#6FA37A",
    ear: "none",
    tail: "stub",
    shell: true,
    snout: false,
  },
  fox: {
    body: "#E8935A",
    bodyDark: "#C97540",
    head: "#F0A874",
    headStroke: "#D9895A",
    ear: "pointed",
    tail: "bushy",
    shell: false,
    snout: true,
  },
  dog: {
    body: "#C99A6B",
    bodyDark: "#A97D4C",
    head: "#D9AE82",
    headStroke: "#BC9264",
    ear: "floppy",
    tail: "stub",
    shell: false,
    snout: true,
  },
  cat: {
    body: "#9E9EAA",
    bodyDark: "#7E7E8C",
    head: "#ACACB8",
    headStroke: "#8C8C9A",
    ear: "pointed",
    tail: "curled",
    shell: false,
    snout: false,
  },
  rabbit: {
    body: "#F0E4D6",
    bodyDark: "#D9C4AC",
    head: "#F7EEE3",
    headStroke: "#E3D2BC",
    ear: "tall",
    tail: "poof",
    shell: false,
    snout: false,
  },
  bear: {
    body: "#8C6A48",
    bodyDark: "#6C4E30",
    head: "#9C7A58",
    headStroke: "#7C5A3A",
    ear: "round",
    tail: "none",
    shell: false,
    snout: true,
  },
};

function Ears({ style, color, dark }: { style: EarStyle; color: string; dark: string }) {
  switch (style) {
    case "pointed":
      return (
        <g fill={color} stroke={dark} strokeWidth="2">
          <polygon points="144,66 152,40 160,64" />
          <polygon points="162,62 172,38 180,62" />
        </g>
      );
    case "floppy":
      return (
        <g fill={color} stroke={dark} strokeWidth="2">
          <ellipse cx="145" cy="84" rx="8" ry="17" transform="rotate(-12 145 84)" />
          <ellipse cx="178" cy="82" rx="8" ry="17" transform="rotate(12 178 82)" />
        </g>
      );
    case "tall":
      return (
        <g fill={color} stroke={dark} strokeWidth="2">
          <ellipse cx="150" cy="46" rx="7" ry="24" transform="rotate(-8 150 46)" />
          <ellipse cx="171" cy="42" rx="7" ry="24" transform="rotate(6 171 42)" />
        </g>
      );
    case "round":
      return (
        <g fill={color} stroke={dark} strokeWidth="2">
          <circle cx="147" cy="60" r="10" />
          <circle cx="175" cy="58" r="10" />
        </g>
      );
    case "none":
    default:
      return null;
  }
}

function Tail({ style, color, dark }: { style: TailStyle; color: string; dark: string }) {
  switch (style) {
    case "stub":
      return <polygon points="42,104 28,110 44,114" fill={dark} />;
    case "bushy":
      return (
        <g>
          <ellipse cx="26" cy="102" rx="22" ry="13" transform="rotate(-18 26 102)" fill={color} />
          <ellipse cx="12" cy="97" rx="7" ry="5" fill="#fff" />
        </g>
      );
    case "curled":
      return (
        <path
          d="M 34 128 Q 8 118 16 88"
          stroke={dark}
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
        />
      );
    case "poof":
      return <circle cx="30" cy="120" r="11" fill={color} stroke={dark} strokeWidth="2" />;
    case "none":
    default:
      return null;
  }
}

export function Pet({
  equipped,
  size = 200,
  cheer = false,
  name,
  species = "turtle",
}: {
  equipped: Equipped;
  size?: number;
  cheer?: boolean;
  name?: string;
  species?: Species;
}) {
  const bg = equipped.bg;
  const s = SHAPES[species];
  return (
    <svg
      viewBox="0 0 200 160"
      width={size}
      height={size * 0.8}
      role="img"
      aria-label={`${name || "Your buddy"} the ${species}`}
    >
      {bg === "meadow" && (
        <g>
          <rect x="0" y="0" width="200" height="160" rx="16" fill="#D8ECDF" />
          <circle cx="168" cy="26" r="14" fill="#F2C94C" />
          <ellipse cx="40" cy="162" rx="90" ry="34" fill="#A8D3B0" />
          <ellipse cx="170" cy="166" rx="80" ry="30" fill="#93C79E" />
          <circle cx="30" cy="122" r="4" fill="#F2994A" />
          <circle cx="52" cy="130" r="4" fill="#EB5757" />
        </g>
      )}
      {bg === "beach" && (
        <g>
          <rect x="0" y="0" width="200" height="160" rx="16" fill="#CFE7F2" />
          <rect x="0" y="86" width="200" height="30" fill="#7FB6D9" />
          <rect x="0" y="112" width="200" height="48" fill="#F0DCB4" />
          <circle cx="30" cy="26" r="13" fill="#F2C94C" />
        </g>
      )}
      {bg === "night" && (
        <g>
          <rect x="0" y="0" width="200" height="160" rx="16" fill="#2C3554" />
          <circle cx="164" cy="28" r="12" fill="#EDE8CF" />
          <circle cx="40" cy="30" r="2" fill="#fff" />
          <circle cx="80" cy="18" r="2" fill="#fff" />
          <circle cx="120" cy="40" r="2" fill="#fff" />
          <circle cx="24" cy="70" r="2" fill="#fff" />
        </g>
      )}
      {cheer && (
        <g fill="#E09A32">
          <circle cx="36" cy="46" r="4" />
          <circle cx="176" cy="50" r="4" />
          <circle cx="60" cy="24" r="3" />
          <circle cx="150" cy="24" r="3" fill="#EB5757" />
          <circle cx="24" cy="86" r="3" fill="#4E8A66" />
        </g>
      )}
      {/* legs + tail */}
      <ellipse cx="66" cy="128" rx="12" ry="9" fill={s.bodyDark} />
      <ellipse cx="128" cy="128" rx="12" ry="9" fill={s.bodyDark} />
      <Tail style={s.tail} color={s.body} dark={s.bodyDark} />
      {/* body / shell */}
      {s.shell ? (
        <g>
          <ellipse
            cx="98"
            cy="92"
            rx="54"
            ry="40"
            fill={s.body}
            stroke={s.bodyDark}
            strokeWidth="4"
          />
          <circle cx="80" cy="84" r="10" fill="#6FA983" />
          <circle cx="108" cy="74" r="10" fill="#6FA983" />
          <circle cx="112" cy="100" r="9" fill="#6FA983" />
        </g>
      ) : (
        <ellipse cx="98" cy="96" rx="50" ry="34" fill={s.body} stroke={s.bodyDark} strokeWidth="3" />
      )}
      {/* ears (behind head) */}
      <Ears style={s.ear} color={s.body} dark={s.bodyDark} />
      {/* snout (behind head, pokes out to the right) */}
      {s.snout && <ellipse cx="180" cy="86" rx="9" ry="7" fill={s.body} stroke={s.bodyDark} strokeWidth="2" />}
      {/* head + face */}
      <circle cx="160" cy="80" r="18" fill={s.head} stroke={s.headStroke} strokeWidth="3" />
      <circle cx="166" cy="76" r="3.2" fill="#22332D" />
      <path
        d="M 160 88 Q 166 92 172 87"
        stroke="#22332D"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* wearables */}
      {equipped.face === "glasses" && (
        <g stroke="#22332D" strokeWidth="2.5">
          <circle cx="166" cy="76" r="6" fill="rgba(34,51,45,0.85)" />
          <circle cx="151" cy="74" r="6" fill="rgba(34,51,45,0.85)" />
          <line x1="157" y1="75" x2="160" y2="75" />
        </g>
      )}
      {equipped.hat === "sweatband" && (
        <rect
          x="146"
          y="61"
          width="30"
          height="7"
          rx="3.5"
          fill="#E05A4E"
          transform="rotate(-8 160 66)"
        />
      )}
      {equipped.hat === "party" && (
        <g>
          <polygon points="150,66 172,64 160,38" fill="#E09A32" />
          <circle cx="160" cy="38" r="4" fill="#EB5757" />
        </g>
      )}
      {equipped.hat === "crown" && (
        <polygon
          points="146,66 148,50 156,58 162,46 168,58 176,48 176,64"
          fill="#F2C94C"
          stroke="#D9A62E"
          strokeWidth="2"
        />
      )}
      {equipped.neck === "bandana" && (
        <g>
          <polygon points="142,92 162,94 152,110" fill="#EB5757" />
          <circle cx="144" cy="93" r="4" fill="#C0392B" />
        </g>
      )}
      {equipped.chest === "medal" && (
        <g>
          <polyline
            points="140,72 146,96 152,74"
            stroke="#3E5C9A"
            strokeWidth="4"
            fill="none"
          />
          <circle cx="146" cy="100" r="8" fill="#F2C94C" stroke="#D9A62E" strokeWidth="2" />
        </g>
      )}
    </svg>
  );
}
