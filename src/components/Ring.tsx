/* Progress ring — SVG circle whose stroke fills with `frac` (0–1). */

export function Ring({
  frac,
  color,
  children,
}: {
  frac: number;
  color: string;
  children: React.ReactNode;
}) {
  const R = 118;
  const C = 2 * Math.PI * R;
  return (
    <div className="ring-wrap">
      <svg viewBox="0 0 250 250" width="250" height="250">
        <circle cx="125" cy="125" r={R} fill="#fff" stroke="#E4ECE8" strokeWidth="10" />
        <circle
          cx="125"
          cy="125"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - Math.min(1, Math.max(0, frac)))}
          transform="rotate(-90 125 125)"
        />
      </svg>
      <div className="ring-center">{children}</div>
    </div>
  );
}
