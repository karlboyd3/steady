/* ============================================================
   STEADY — presentation-mode copy.
   Centralizes copy that differs between mascot mode (Shelby) and
   clinical mode, so screens branch on tenant data, not string
   ternaries scattered through JSX.
   ============================================================ */

import type { TenantConfig } from "./types";

export function doneHeroCopy(
  tenant: TenantConfig,
  petName: string,
  minutes: number
): string {
  if (tenant.mascotEnabled) {
    return `${minutes} minutes of steady work — ${
      petName || "your buddy"
    } is doing a happy dance.`;
  }
  return `${minutes} minutes of steady work. Session complete.`;
}
