"use client";

/* ============================================================
   BottomSheet — generic modal shell: slides up from the bottom,
   rounded top corners, ~90% viewport height, scrollable body,
   safe-area aware. Dismiss via the close button, Escape, or
   tapping the scrim (no drag-gesture physics — a static grab
   handle communicates the affordance instead).
   ============================================================ */

import { useEffect, type ReactNode } from "react";

export function BottomSheet({
  open,
  onClose,
  ariaLabel,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  ariaLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="sheet-scrim"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      onClick={onClose}
    >
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-chrome">
          <div className="sheet-handle" aria-hidden="true" />
          <button
            type="button"
            className="sheet-close"
            onClick={onClose}
            aria-label="Close sheet"
          >
            ✕
          </button>
        </div>
        <div className="sheet-body">{children}</div>
        {footer && <div className="sheet-footer">{footer}</div>}
      </div>
    </div>
  );
}
