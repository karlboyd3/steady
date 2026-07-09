/* ============================================================
   Steady — audio chimes (iOS-safe).
   iOS Safari blocks AudioContexts created/resumed outside a user
   gesture. We keep a single module-level context and must call
   primeAudio() inside the "Start session" tap so later chimes sound.
   ============================================================ */

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const Ctx = window.AudioContext || (window as WebkitWindow).webkitAudioContext;
  if (!Ctx) return null;
  try {
    ctx = new Ctx();
  } catch {
    return null;
  }
  return ctx;
}

/**
 * Create and resume the AudioContext. MUST be called synchronously inside a
 * user-gesture handler (e.g. the Start-session tap) for iOS to allow sound.
 */
export function primeAudio(): void {
  const c = getCtx();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

/** Play a short sine beep. Resumes the context if a prior gesture allows it. */
export function beep(freq = 660, dur = 0.12): void {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  try {
    const o = c.createOscillator();
    const g = c.createGain();
    o.frequency.value = freq;
    o.type = "sine";
    g.gain.setValueAtTime(0.12, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + dur);
  } catch {
    /* audio unavailable — stay silent */
  }
}
