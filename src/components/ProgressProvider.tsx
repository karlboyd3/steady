"use client";

import { createContext, useContext } from "react";
import { useProgress } from "@/hooks/useProgress";

type ProgressValue = ReturnType<typeof useProgress>;

const ProgressContext = createContext<ProgressValue | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const progress = useProgress();
  return (
    <ProgressContext.Provider value={progress}>
      {children}
    </ProgressContext.Provider>
  );
}

/** Access the single shared, persisted progress state. */
export function useProgressContext(): ProgressValue {
  const ctx = useContext(ProgressContext);
  if (!ctx)
    throw new Error("useProgressContext must be used within ProgressProvider");
  return ctx;
}
