"use client";

/* ============================================================
   LottieLoop — thin wrapper around lottie-react's useLottie. Split
   into its own module so ExerciseAnimation.tsx can next/dynamic-import
   it (ssr:false), matching the pattern already used to isolate
   three.js to the /buddy and done-screen chunks: lottie-react is only
   ever fetched once a real /animations/{exerciseId}.json is confirmed
   to exist, not on every /session page load.

   Default export: required by next/dynamic().
   ============================================================ */

import { useEffect } from "react";
import { useLottie } from "lottie-react";

export default function LottieLoop({ data, active }: { data: object; active: boolean }) {
  const { View, play, pause } = useLottie(
    { animationData: data, loop: true, autoplay: false },
    { width: "100%", height: "100%" }
  );
  useEffect(() => {
    if (active) play();
    else pause();
  }, [active, play, pause]);
  return <>{View}</>;
}
