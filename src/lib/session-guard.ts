/* ============================================================
   Session-exit guard — pure decision logic for protecting an
   in-progress session from accidental navigation (back-swipe,
   Exit tap). The component wires history/UI to these decisions.
   ============================================================ */

export interface GuardState {
  /** Whether the "Leave your session?" prompt is showing. */
  asking: boolean;
}

export const guardInitial: GuardState = { asking: false };

export type GuardEvent =
  | { type: "EXIT_REQUEST" } // Exit button or a browser back-swipe
  | { type: "CANCEL" } // "Keep going"
  | { type: "CONFIRM" }; // "Leave"

export interface GuardResult {
  state: GuardState;
  /** Component should navigate away. */
  leave: boolean;
  /** Component should pause the running session. */
  pause: boolean;
}

/**
 * Decide what happens on a guard event.
 * - EXIT_REQUEST while running → pause + ask (don't leave)
 * - EXIT_REQUEST when not running → leave immediately
 * - CONFIRM → leave; CANCEL → stay
 */
export function guardReducer(
  state: GuardState,
  event: GuardEvent,
  running: boolean
): GuardResult {
  switch (event.type) {
    case "EXIT_REQUEST":
      if (!running) return { state: { asking: false }, leave: true, pause: false };
      return { state: { asking: true }, leave: false, pause: true };
    case "CANCEL":
      return { state: { asking: false }, leave: false, pause: false };
    case "CONFIRM":
      return { state: { asking: false }, leave: true, pause: false };
  }
}
