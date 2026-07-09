"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { HomeScreen } from "@/components/HomeScreen";
import { useProgressContext } from "@/components/ProgressProvider";

export default function HomePage() {
  const router = useRouter();
  const p = useProgressContext();

  useEffect(() => {
    if (p.hydrated && !p.onboarded) router.replace("/level");
  }, [p.hydrated, p.onboarded, router]);

  if (!p.hydrated || !p.onboarded) return null;

  return (
    <HomeScreen
      currentDay={p.currentDay}
      completedSet={p.completedSet}
      completedCount={p.completedCount}
      streak={p.streak}
      selectedDay={p.selectedDay}
      track={p.track}
      coins={p.coins}
      petName={p.petName}
      equipped={p.equipped}
      level={p.level}
      onStart={() => router.push("/session")}
      onPick={p.selectDay}
      onChangeLevel={() => router.push("/level")}
      onVisitPet={() => router.push("/buddy")}
    />
  );
}
