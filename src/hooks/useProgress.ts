"use client";

/* ============================================================
   useProgress — the single gateway to persisted app state.
   Components never touch localStorage directly; they read/act here.
   ============================================================ */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  defaultState,
  load,
  nextStreak,
  save,
  saveNow,
  todayISO,
  type SteadyState,
} from "@/lib/storage";
import {
  applyEquip,
  applyPurchase,
  coinsForCompletion,
  petLevel,
  type Item,
  type Species,
} from "@/lib/rewards";

export function useProgress(slug: string, defaultSpecies?: Species) {
  const [state, setState] = useState<SteadyState>(() => defaultState(defaultSpecies));
  const [hydrated, setHydrated] = useState(false);

  // Read via a ref so a tenant-config refresh never re-triggers the load
  // effect below — the default must only ever seed a fresh install once.
  const defaultSpeciesRef = useRef(defaultSpecies);
  defaultSpeciesRef.current = defaultSpecies;

  // Load persisted state once, on the client, after mount.
  useEffect(() => {
    setState(load(slug, defaultSpeciesRef.current));
    setHydrated(true);
  }, [slug]);

  // Persist (debounced) on every change once hydrated.
  useEffect(() => {
    if (hydrated) save(slug, state);
  }, [state, hydrated, slug]);

  // Flush immediately when the page is being hidden/closed/refreshed so the
  // last action is never lost to the debounce window.
  const stateRef = useRef(state);
  stateRef.current = state;
  useEffect(() => {
    if (!hydrated) return;
    const flush = () => saveNow(slug, stateRef.current);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [hydrated, slug]);

  const patch = useCallback(
    (p: Partial<SteadyState> | ((s: SteadyState) => Partial<SteadyState>)) => {
      setState((prev) => ({
        ...prev,
        ...(typeof p === "function" ? p(prev) : p),
      }));
    },
    []
  );

  const selectDay = useCallback((day: number) => patch({ selectedDay: day }), [patch]);

  const chooseTrack = useCallback(
    (track: number) => patch({ track, onboarded: true }),
    [patch]
  );

  const acceptDisclaimer = useCallback(
    () => patch({ disclaimerAccepted: true }),
    [patch]
  );

  const toggleSound = useCallback(
    () => patch((s) => ({ soundOn: !s.soundOn })),
    [patch]
  );

  const setSoundOn = useCallback(
    (soundOn: boolean) => patch({ soundOn }),
    [patch]
  );

  const setPetName = useCallback(
    (petName: string) => patch({ petName: petName.slice(0, 14) }),
    [patch]
  );

  const setSpecies = useCallback(
    (species: Species) => patch({ species, speciesChosen: true }),
    [patch]
  );

  const buyItem = useCallback(
    (item: Item) =>
      setState((prev) => ({
        ...prev,
        ...applyPurchase(
          { coins: prev.coins, owned: prev.owned, equipped: prev.equipped },
          item
        ),
      })),
    []
  );

  const equipItem = useCallback(
    (item: Item) =>
      setState((prev) => ({ ...prev, equipped: applyEquip(prev.equipped, item) })),
    []
  );

  /** Credit a finished session (coins + date-aware streak + day advance). */
  const finishDay = useCallback((day: number) => {
    setState((prev) => {
      const today = todayISO();
      const already = prev.completed.includes(day);
      const earned = coinsForCompletion(prev.streak, already);
      const next: SteadyState = { ...prev, coins: prev.coins + earned };
      if (!already) {
        next.completed = [...prev.completed, day];
        next.streak = nextStreak(prev.streak, prev.lastCompletedDate, today);
        next.lastCompletedDate = today;
      }
      if (day === prev.currentDay && prev.currentDay < 30) {
        next.currentDay = prev.currentDay + 1;
        next.selectedDay = prev.currentDay + 1;
      }
      return next;
    });
  }, []);

  const completedSet = useMemo(
    () => new Set(state.completed),
    [state.completed]
  );
  const level = useMemo(
    () => petLevel(state.completed.length),
    [state.completed.length]
  );

  return {
    hydrated,
    ...state,
    completedSet,
    completedCount: state.completed.length,
    level,
    // actions
    selectDay,
    chooseTrack,
    acceptDisclaimer,
    toggleSound,
    setSoundOn,
    setPetName,
    setSpecies,
    buyItem,
    equipItem,
    finishDay,
  };
}
