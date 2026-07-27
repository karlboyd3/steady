"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionPlayer } from "@/components/SessionPlayer";
import type { SessionSummary } from "@/hooks/useSessionEngine";
import { DoneScreen, type FinishDest } from "@/components/DoneScreen";
import { WorkoutOverview } from "@/components/WorkoutOverview";
import { ExerciseDetailSheet } from "@/components/ExerciseDetailSheet";
import { useProgressContext } from "@/components/ProgressProvider";
import { buildDay } from "@/lib/tracks";
import {
  applyOverrides,
  type ExerciseId,
  type RepOverrides,
} from "@/lib/exercises";

export default function SessionPage() {
  const router = useRouter();
  const p = useProgressContext();
  const [phase, setPhase] = useState<"overview" | "play" | "done">(
    "overview"
  );
  const [overrides, setOverrides] = useState<RepOverrides>({});
  const [selectedExerciseIdx, setSelectedExerciseIdx] = useState<
    number | null
  >(null);
  const [summary, setSummary] = useState<SessionSummary>({
    skippedCount: 0,
    totalCount: 0,
  });

  useEffect(() => {
    if (p.hydrated && !p.onboarded) router.replace("/level");
  }, [p.hydrated, p.onboarded, router]);

  const day = p.selectedDay;

  // A fresh day is a fresh session — reset overrides and start at the overview.
  useEffect(() => {
    setPhase("overview");
    setOverrides({});
    setSelectedExerciseIdx(null);
    setSummary({ skippedCount: 0, totalCount: 0 });
  }, [day]);

  const baseItems = useMemo(() => buildDay(day, p.track), [day, p.track]);
  const items = useMemo(
    () => applyOverrides(baseItems, overrides),
    [baseItems, overrides]
  );

  const setOverride = useCallback(
    (id: ExerciseId, patch: { reps?: number; secs?: number }) => {
      setOverrides((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
    },
    []
  );

  if (!p.hydrated || !p.onboarded) return null;

  if (phase === "done") {
    const finish = (dest: FinishDest) => {
      p.finishDay(day);
      if (dest === "pet") router.push("/buddy");
      else if (dest === "level") router.push("/level");
      else router.push("/");
    };
    return (
      <DoneScreen
        day={day}
        track={p.track}
        streak={p.streak}
        alreadyDone={p.completedSet.has(day)}
        lastCompletedDate={p.lastCompletedDate}
        skippedCount={summary.skippedCount}
        totalCount={summary.totalCount}
        petName={p.petName}
        species={p.species}
        equipped={p.equipped}
        onFinish={finish}
      />
    );
  }

  const detailSheet = selectedExerciseIdx != null && (
    <ExerciseDetailSheet
      open
      onClose={() => setSelectedExerciseIdx(null)}
      items={items}
      index={selectedExerciseIdx}
      onNavigate={(i) =>
        setSelectedExerciseIdx(Math.max(0, Math.min(items.length - 1, i)))
      }
      overrides={overrides}
      onOverrideChange={setOverride}
    />
  );

  if (phase === "overview") {
    return (
      <>
        <WorkoutOverview
          day={day}
          trackIdx={p.track}
          items={items}
          alreadyDone={p.completedSet.has(day)}
          onSelectExercise={setSelectedExerciseIdx}
          onStart={() => setPhase("play")}
          onExit={() => router.push("/")}
        />
        {detailSheet}
      </>
    );
  }

  return (
    <>
      <SessionPlayer
        day={day}
        track={p.track}
        soundOn={p.soundOn}
        species={p.species}
        onToggleSound={p.toggleSound}
        onDone={(s) => {
          setSummary(s);
          setPhase("done");
        }}
        onExit={() => router.push("/")}
        overrides={overrides}
        onShowExerciseDetail={setSelectedExerciseIdx}
      />
      {detailSheet}
    </>
  );
}
