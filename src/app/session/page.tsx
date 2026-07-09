"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SessionPlayer } from "@/components/SessionPlayer";
import { DoneScreen, type FinishDest } from "@/components/DoneScreen";
import { useProgressContext } from "@/components/ProgressProvider";

export default function SessionPage() {
  const router = useRouter();
  const p = useProgressContext();
  const [phase, setPhase] = useState<"play" | "done">("play");

  useEffect(() => {
    if (p.hydrated && !p.onboarded) router.replace("/level");
  }, [p.hydrated, p.onboarded, router]);

  if (!p.hydrated || !p.onboarded) return null;

  const day = p.selectedDay;

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
        petName={p.petName}
        equipped={p.equipped}
        onFinish={finish}
      />
    );
  }

  return (
    <SessionPlayer
      day={day}
      track={p.track}
      soundOn={p.soundOn}
      onToggleSound={p.toggleSound}
      onDone={() => setPhase("done")}
      onExit={() => router.push("/")}
    />
  );
}
