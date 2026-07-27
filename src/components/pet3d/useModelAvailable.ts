"use client";

/* ============================================================
   Drop-in path helpers + availability probes for the optional .glb
   assets. Both wrap useGlbAvailable; the path builders are exported
   so the preloader (usePetPreload.ts) and the loaders themselves stay
   in sync with a single definition of where assets live.
   ============================================================ */

import type { Species } from "@/lib/rewards";
import { useGlbAvailable } from "./useGlbAvailable";

export function speciesModelUrl(species: Species): string {
  return `/models/${species}.glb`;
}

export function cosmeticModelUrl(itemId: string): string {
  return `/models/cosmetics/${itemId}.glb`;
}

/** True once a real model for this species is confirmed to exist. */
export function useModelAvailable(species: Species): boolean {
  return useGlbAvailable(speciesModelUrl(species));
}

/** True once a real model for this cosmetic item is confirmed to exist. */
export function useCosmeticModelAvailable(itemId: string): boolean {
  return useGlbAvailable(cosmeticModelUrl(itemId));
}
