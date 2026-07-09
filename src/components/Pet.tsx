/* ============================================================
   Pet — the turtle buddy, with wearables (hat/face/neck/chest)
   and background scenes, plus an optional cheering state.
   ============================================================ */

import type { Equipped } from "@/lib/rewards";

export function Pet({
  equipped,
  size = 200,
  cheer = false,
  name,
}: {
  equipped: Equipped;
  size?: number;
  cheer?: boolean;
  name?: string;
}) {
  const bg = equipped.bg;
  return (
    <svg
      viewBox="0 0 200 160"
      width={size}
      height={size * 0.8}
      role="img"
      aria-label={`${name || "Your buddy"} the turtle`}
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
      <ellipse cx="66" cy="128" rx="12" ry="9" fill="#7FB58A" />
      <ellipse cx="128" cy="128" rx="12" ry="9" fill="#7FB58A" />
      <polygon points="42,104 28,110 44,114" fill="#7FB58A" />
      {/* shell */}
      <ellipse cx="98" cy="92" rx="54" ry="40" fill="#4E8A66" stroke="#3C6E51" strokeWidth="4" />
      <circle cx="80" cy="84" r="10" fill="#6FA983" />
      <circle cx="108" cy="74" r="10" fill="#6FA983" />
      <circle cx="112" cy="100" r="9" fill="#6FA983" />
      {/* head + face */}
      <circle cx="160" cy="80" r="18" fill="#8CBE8F" stroke="#6FA37A" strokeWidth="3" />
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
