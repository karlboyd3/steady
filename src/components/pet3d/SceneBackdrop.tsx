/* Same bg-scene artwork as Pet.tsx's meadow/beach/night groups, as a
 * standalone absolutely-positioned layer behind the transparent-canvas
 * 3D scene — `bg` items are backdrops, not body attachments, so they
 * never need a 3D socket. */

export function SceneBackdrop({ bg }: { bg: string | null }) {
  if (!bg) return null;
  return (
    <svg
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
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
    </svg>
  );
}
