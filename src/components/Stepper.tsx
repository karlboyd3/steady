"use client";

/* ============================================================
   Stepper — generic -/+ numeric control (used for the REPEATS
   per-session override on the Exercise Detail sheet).
   ============================================================ */

export function Stepper({
  value,
  min = 1,
  max,
  step = 1,
  label,
  onChange,
}: {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  onChange: (value: number) => void;
}) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () =>
    onChange(max != null ? Math.min(max, value + step) : value + step);
  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper-btn"
        onClick={dec}
        disabled={value <= min}
        aria-label={`Decrease${label ? " " + label : ""}`}
      >
        −
      </button>
      <span className="stepper-value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="stepper-btn"
        onClick={inc}
        disabled={max != null && value >= max}
        aria-label={`Increase${label ? " " + label : ""}`}
      >
        +
      </button>
    </div>
  );
}
