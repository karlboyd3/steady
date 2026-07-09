"use client";

import { useRouter } from "next/navigation";
import { PetScreen } from "@/components/PetScreen";
import { useProgressContext } from "@/components/ProgressProvider";

export default function BuddyPage() {
  const router = useRouter();
  const p = useProgressContext();

  if (!p.hydrated) return null;

  return (
    <PetScreen
      petName={p.petName}
      setPetName={p.setPetName}
      coins={p.coins}
      owned={p.owned}
      equipped={p.equipped}
      level={p.level}
      onBuy={p.buyItem}
      onEquip={p.equipItem}
      onBack={() => router.push("/")}
    />
  );
}
