"use client";

import { useRouter } from "next/navigation";
import { LevelPicker } from "@/components/LevelPicker";
import { useProgressContext } from "@/components/ProgressProvider";

export default function LevelPage() {
  const router = useRouter();
  const p = useProgressContext();

  if (!p.hydrated) return null;

  return (
    <LevelPicker
      isChange={p.onboarded}
      onBack={p.onboarded ? () => router.push("/") : undefined}
      onPick={(i) => {
        p.chooseTrack(i);
        router.push("/");
      }}
    />
  );
}
