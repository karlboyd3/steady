"use client";

/* ============================================================
   ExerciseAnimation — the "big looping demo" used on the Overview
   list thumbnails, the Detail Sheet's Animation tab, and the
   Player's idle previews.

   Tries /animations/{exerciseId}.json (Lottie) first; if it's
   missing or fails to load, falls back to Figure (Steady's
   existing pose-interpolated stick figure, which already covers
   all 17 exercises correctly). Drop a real .json file into
   public/animations/ and it lights up automatically — no code
   changes needed.

   lottie-react is loaded via next/dynamic (ssr:false), not a static
   import — LottieLoop only mounts once a real Lottie JSON has been
   confirmed to exist for this exercise, so /session's initial bundle
   never pays for lottie-react on the (currently 100%-of-the-time)
   path where every exercise falls back to Figure. Same isolation
   pattern used to keep three.js off /session (see src/components/pet3d).

   Pauses (Lottie) or freezes (Figure loop) when off-screen or
   when the tab is hidden, and honors prefers-reduced-motion.
   ============================================================ */

import { Suspense, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { EX, type Exercise, type ExerciseId } from "@/lib/exercises";
import { Figure } from "./Figure";
import { usePoseLoop } from "@/hooks/usePoseLoop";

const LottieLoop = dynamic(() => import("./LottieLoop"), { ssr: false });

function FigureLoop({
  exercise,
  active,
}: {
  exercise: Exercise;
  active: boolean;
}) {
  const poseT = usePoseLoop(exercise, active);
  return <Figure exercise={exercise} t={poseT} />;
}

export function ExerciseAnimation({
  exerciseId,
  className,
}: {
  exerciseId: ExerciseId;
  className?: string;
}) {
  const exercise = EX[exerciseId];
  const containerRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(true);
  const [hidden, setHidden] = useState(
    typeof document !== "undefined" ? document.hidden : false
  );
  const [lottieData, setLottieData] = useState<object | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const onVis = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch(`/animations/${exerciseId}.json`)
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        if (!cancelled && data && typeof data === "object") setLottieData(data);
      })
      .catch(() => {
        if (!cancelled) setLottieData(null);
      });
    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  const active = inView && !hidden;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: "100%", height: "100%" }}
    >
      {lottieData ? (
        <Suspense fallback={<FigureLoop exercise={exercise} active={active} />}>
          <LottieLoop data={lottieData} active={active} />
        </Suspense>
      ) : (
        <FigureLoop exercise={exercise} active={active} />
      )}
    </div>
  );
}
