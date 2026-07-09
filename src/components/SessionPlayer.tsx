"use client";

/* ============================================================
   SessionPlayer — the guided workout screen. Presentation +
   mobile hardening (wake lock, audio priming, exit guard).
   All timing/transition logic lives in useSessionEngine + the
   pure lib/session-engine.
   ============================================================ */

import { useCallback, useEffect, useRef, useState } from "react";
import { Figure } from "./Figure";
import { Ring } from "./Ring";
import { useSessionEngine } from "@/hooks/useSessionEngine";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWakeLock } from "@/hooks/useWakeLock";
import { primeAudio } from "@/lib/audio";
import { PREP_SECS, REST_SECS, SWITCH_SECS, workSecs } from "@/lib/tracks";
import { sessionElapsed } from "@/lib/session-engine";
import {
  guardReducer,
  guardInitial,
  type GuardEvent,
} from "@/lib/session-guard";

export function SessionPlayer({
  day,
  track,
  soundOn,
  onToggleSound,
  onDone,
  onExit,
}: {
  day: number;
  track: number;
  soundOn: boolean;
  onToggleSound: () => void;
  onDone: () => void;
  onExit: () => void;
}) {
  const reduced = useReducedMotion();
  const { items, state, paused, togglePause, skip, back, beginWork2 } =
    useSessionEngine({ day, track, soundOn, onDone });

  const st = state;
  const running = !st.done;

  // Keep the screen awake while actively exercising (not while paused/done).
  useWakeLock(running && !paused);

  // Prime the iOS AudioContext on the first touch inside the session.
  const primedRef = useRef(false);
  const primeOnce = useCallback(() => {
    if (!primedRef.current) {
      primedRef.current = true;
      primeAudio();
    }
  }, []);

  // ---- exit guard ----
  const [guard, setGuard] = useState(guardInitial);
  const dispatch = useCallback(
    (event: GuardEvent) => {
      const r = guardReducer(guard, event, running);
      setGuard(r.state);
      if (r.pause && !paused) togglePause();
      if (r.leave) onExit();
    },
    [guard, running, paused, togglePause, onExit]
  );
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  // Intercept the browser back-swipe: keep the user here and ask instead of
  // discarding the session. A sentinel history entry catches the pop.
  useEffect(() => {
    if (st.done) return;
    window.history.pushState({ steadySession: true }, "");
    const onPop = () => {
      window.history.pushState({ steadySession: true }, "");
      dispatchRef.current({ type: "EXIT_REQUEST" });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [st.done]);

  const item = items[st.exIdx];
  const ex = item.ex;
  const oneSide =
    ex.type === "reps" ? (item.reps ?? 0) * (ex.cadence ?? 0) : item.secs ?? 0;
  const dur =
    st.stage === "prep"
      ? PREP_SECS
      : st.stage === "switch"
        ? SWITCH_SECS
        : st.stage === "rest"
          ? REST_SECS
          : oneSide;
  const working = st.stage === "work" || st.stage === "work2";

  // overall progress
  const totalSecs =
    items.reduce((s, it) => s + PREP_SECS + workSecs(it), 0) +
    REST_SECS * (items.length - 1);
  const elapsed = sessionElapsed(st, items);

  // animation phase for the figure
  let poseT = 0;
  if (working) {
    if (reduced) {
      poseT = 0.5 - 0.5 * Math.cos((st.t * Math.PI) / 2.5);
    } else if (ex.type === "reps") {
      const phase = (st.t % (ex.cadence ?? 1)) / (ex.cadence ?? 1);
      poseT = (1 - Math.cos(2 * Math.PI * phase)) / 2;
    } else {
      const ramp = Math.min(st.t / 1.5, 1);
      poseT = ramp * (0.85 + 0.15 * (0.5 + 0.5 * Math.sin(st.t * 1.4)));
    }
  }

  // ring + counters
  let frac = 0;
  let big = "";
  let sub = "";
  if (working) {
    if (ex.type === "reps") {
      const done = Math.min(Math.floor(st.t / (ex.cadence ?? 1)), item.reps ?? 0);
      frac = st.t / dur;
      big = `${done}`;
      sub = `of ${item.reps} reps`;
    } else {
      const remain = Math.ceil(dur - st.t);
      frac = st.t / dur;
      big = `${remain}`;
      sub = "seconds left";
    }
  }

  const legLabel = ex.perLeg
    ? st.stage === "work2"
      ? "Left leg"
      : st.stage === "work"
        ? "Right leg"
        : null
    : null;
  const nextItem = items[st.exIdx + 1];

  return (
    <div className="session-screen" onPointerDownCapture={primeOnce}>
      <div className="session-top">
        <button className="icon-btn" onClick={() => dispatch({ type: "EXIT_REQUEST" })}>
          ← Exit
        </button>
        <span className="where">
          Exercise {st.exIdx + 1} of {items.length}
        </span>
        <button
          className="icon-btn"
          onClick={onToggleSound}
          aria-label="Toggle sound"
          aria-pressed={soundOn}
        >
          {soundOn ? "🔔 On" : "🔕 Off"}
        </button>
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Session progress"
        aria-valuenow={Math.round((elapsed / totalSecs) * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill"
          style={{ width: `${Math.min(100, (elapsed / totalSecs) * 100)}%` }}
        />
      </div>

      {st.stage === "rest" ? (
        <div className="stage-card rest">
          <div
            className="section-label"
            style={{ color: "#3A5875", marginTop: 0 }}
          >
            Rest &amp; reset
          </div>
          <div className="rest-big" aria-live="polite" aria-atomic="true">
            {Math.ceil(dur - st.t)}
          </div>
          <div className="next-label">Up next</div>
          <div className="next-name">{nextItem.ex.name}</div>
          <div style={{ width: 170, height: 170, margin: "6px auto 0" }}>
            <Figure exercise={nextItem.ex} t={0} />
          </div>
          <div className="controls">
            <button className="ctrl" onClick={back}>
              ↺ Redo
            </button>
            <button className="ctrl" onClick={togglePause}>
              {paused ? "Resume" : "Pause"}
            </button>
            <button className="ctrl primary" onClick={skip}>
              Start now →
            </button>
          </div>
        </div>
      ) : st.stage === "switch" ? (
        <div className="stage-card prep">
          <div className="ex-name display">Switch legs</div>
          <div
            className="rest-big"
            style={{ color: "var(--pine)" }}
            aria-live="polite"
            aria-atomic="true"
          >
            {Math.ceil(dur - st.t)}
          </div>
          <p className="ex-cue">
            Same exercise — now with your <strong>left leg</strong>.
          </p>
          <div className="controls">
            <button className="ctrl" onClick={togglePause}>
              {paused ? "Resume" : "Pause"}
            </button>
            <button className="ctrl primary" onClick={beginWork2}>
              Ready →
            </button>
          </div>
        </div>
      ) : (
        <div className={`stage-card ${st.stage === "prep" ? "prep" : ""}`}>
          {legLabel && <span className="leg-badge">{legLabel}</span>}
          <div className="ex-name display">{ex.name}</div>
          <p className="ex-cue">
            {st.stage === "prep"
              ? `Get in position… starting in ${Math.ceil(dur - st.t)}`
              : ex.cue}
          </p>

          {st.stage === "prep" ? (
            <div style={{ width: 240, height: 240, margin: "0 auto" }}>
              <Figure exercise={ex} t={0} />
            </div>
          ) : (
            <Ring
              frac={frac}
              color={ex.type === "reps" ? "var(--pine)" : "var(--amber)"}
            >
              <div style={{ width: 158, height: 158 }}>
                <Figure exercise={ex} t={poseT} />
              </div>
              <div
                className="count-big"
                style={{ fontSize: 34, marginTop: -6 }}
                aria-live="polite"
                aria-atomic="true"
              >
                {big}
              </div>
              <div className="count-sub">{sub}</div>
            </Ring>
          )}

          <div className="controls">
            <button className="ctrl" onClick={back}>
              ← Back
            </button>
            <button className="ctrl" onClick={togglePause}>
              {paused ? "▶ Resume" : "⏸ Pause"}
            </button>
            <button className="ctrl" onClick={skip}>
              Skip →
            </button>
          </div>

          <ul className="steps-list">
            {ex.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {guard.asking && (
        <div
          className="modal-scrim"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leave-title"
        >
          <div className="modal">
            <h2 id="leave-title">Leave your session?</h2>
            <p>
              You&apos;re part-way through. If you leave now, this session
              won&apos;t count toward your streak.
            </p>
            <button className="big-btn" onClick={() => dispatch({ type: "CANCEL" })}>
              Keep going
            </button>
            <button
              className="big-btn ghost"
              onClick={() => dispatch({ type: "CONFIRM" })}
            >
              Leave session
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
