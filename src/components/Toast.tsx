"use client";

/* ============================================================
   Toast — minimal self-dismissing pill for stub actions
   (e.g. the Replace button's "coming soon" message).
   ============================================================ */

import { useEffect } from "react";

export function Toast({
  message,
  onDismiss,
  durationMs = 2200,
}: {
  message: string | null;
  onDismiss: () => void;
  durationMs?: number;
}) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(id);
  }, [message, durationMs, onDismiss]);

  if (!message) return null;
  return (
    <div className="toast" role="status" aria-live="polite">
      {message}
    </div>
  );
}
