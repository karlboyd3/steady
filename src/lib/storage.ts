/* ============================================================
   STEADY — Versioned localStorage persistence
   One JSON blob per tenant, under `steady:<slug>:v1`. All app state
   flows through here (via useProgress) — no component touches
   localStorage directly.
   ============================================================ */

import { EMPTY_EQUIPPED, isSpecies, type Equipped, type Slot, type Species } from "./rewards";

/** Legacy pre-multi-tenant key, kept only so migrateLegacyKey can claim it once. */
export const STORAGE_KEY = "steady:v1";
export const SCHEMA_VERSION = 2;

export function storageKey(slug: string): string {
  return `steady:${slug}:v1`;
}

export interface SteadyState {
  version: number;
  track: number;
  onboarded: boolean;
  currentDay: number;
  selectedDay: number;
  completed: number[];
  streak: number;
  /** Local calendar date (YYYY-MM-DD) of the last *new* completion, or null. */
  lastCompletedDate: string | null;
  coins: number;
  owned: string[];
  equipped: Equipped;
  petName: string;
  species: Species;
  /** False only for a genuinely fresh install that hasn't picked a species
   * yet — migrated users are stamped true so they're never re-prompted. */
  speciesChosen: boolean;
  disclaimerAccepted: boolean;
  soundOn: boolean;
}

export function defaultState(defaultSpecies: Species = "turtle"): SteadyState {
  return {
    version: SCHEMA_VERSION,
    track: 1,
    onboarded: false,
    currentDay: 1,
    selectedDay: 1,
    completed: [],
    streak: 0,
    lastCompletedDate: null,
    coins: 0,
    owned: [],
    equipped: { ...EMPTY_EQUIPPED },
    petName: "Shelby",
    species: defaultSpecies,
    speciesChosen: false,
    disclaimerAccepted: false,
    soundOn: true,
  };
}

/* ---------- date helpers (calendar-day aware) ---------- */

/** Today's local calendar date as YYYY-MM-DD. */
export function todayISO(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Whole calendar days between two YYYY-MM-DD strings (b − a). */
function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  const ua = Date.UTC(ay, am - 1, ad);
  const ub = Date.UTC(by, bm - 1, bd);
  return Math.round((ub - ua) / 86_400_000);
}

/**
 * Date-aware streak. Given the previous streak and the date of the last new
 * completion, return the streak after completing again on `today`:
 *  - same calendar day  → unchanged
 *  - consecutive day    → +1
 *  - gap (or first ever) → reset to 1
 * A missed day is never punished beyond quietly resetting the counter.
 */
export function nextStreak(
  prevStreak: number,
  lastCompletedDate: string | null,
  today: string
): number {
  if (!lastCompletedDate) return 1;
  const gap = daysBetween(lastCompletedDate, today);
  if (gap === 0) return prevStreak;
  if (gap === 1) return prevStreak + 1;
  return 1;
}

/* ---------- validation / migration ---------- */

function isObj(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

function str(v: unknown, fallback: string): string {
  return typeof v === "string" ? v : fallback;
}

function coerceEquipped(v: unknown): Equipped {
  const out: Equipped = { ...EMPTY_EQUIPPED };
  if (!isObj(v)) return out;
  (Object.keys(out) as Slot[]).forEach((slot) => {
    const val = v[slot];
    if (typeof val === "string") out[slot] = val;
  });
  return out;
}

/** Coerce an arbitrary parsed blob into a valid SteadyState. */
function coerce(raw: unknown): SteadyState {
  const d = defaultState();
  if (!isObj(raw)) return d;
  return {
    version: SCHEMA_VERSION,
    track: num(raw.track, d.track),
    onboarded: bool(raw.onboarded, d.onboarded),
    currentDay: num(raw.currentDay, d.currentDay),
    selectedDay: num(raw.selectedDay, d.selectedDay),
    completed: Array.isArray(raw.completed)
      ? raw.completed.filter(
          (n): n is number => typeof n === "number" && n >= 1 && n <= 30
        )
      : d.completed,
    streak: num(raw.streak, d.streak),
    lastCompletedDate:
      typeof raw.lastCompletedDate === "string" ? raw.lastCompletedDate : null,
    coins: num(raw.coins, d.coins),
    owned: Array.isArray(raw.owned)
      ? raw.owned.filter((s): s is string => typeof s === "string")
      : d.owned,
    equipped: coerceEquipped(raw.equipped),
    petName: str(raw.petName, d.petName),
    species: isSpecies(raw.species) ? raw.species : d.species,
    speciesChosen: bool(raw.speciesChosen, d.speciesChosen),
    disclaimerAccepted: bool(raw.disclaimerAccepted, d.disclaimerAccepted),
    soundOn: bool(raw.soundOn, d.soundOn),
  };
}

/** v1 had no species concept — everyone was Shelby the turtle. Stamp that in
 * explicitly and mark as already-chosen so migrated users are never
 * re-prompted with the species picker. */
function migrateV1toV2(raw: Record<string, unknown>): Record<string, unknown> {
  return { ...raw, version: 2, species: "turtle", speciesChosen: true };
}

/** Forward-migration hook. Switch on version as the schema evolves. */
function migrate(raw: Record<string, unknown>): unknown {
  const version = num(raw.version, 0);
  switch (version) {
    case 1:
      return migrateV1toV2(raw);
    default:
      return raw;
  }
}

/**
 * One-time, idempotent claim of the legacy unscoped key for the default
 * tenant only: if the scoped key is already there, or there's nothing
 * legacy to claim, this is a no-op.
 */
function migrateLegacyKey(slug: string): void {
  if (slug !== "default") return;
  const scoped = storageKey(slug);
  if (window.localStorage.getItem(scoped) !== null) return;
  const legacy = window.localStorage.getItem(STORAGE_KEY);
  if (legacy === null) return;
  window.localStorage.setItem(scoped, legacy);
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Load state, validating shape and falling back to defaults on corruption.
 * `defaultSpecies` (a tenant's white-label default) only seeds a genuinely
 * fresh install — it never overrides a stored or migrated species.
 */
export function load(slug: string, defaultSpecies?: Species): SteadyState {
  if (typeof window === "undefined") return defaultState(defaultSpecies);
  try {
    migrateLegacyKey(slug);
    const rawStr = window.localStorage.getItem(storageKey(slug));
    if (!rawStr) return defaultState(defaultSpecies);
    const parsed: unknown = JSON.parse(rawStr);
    const migrated = isObj(parsed) ? migrate(parsed) : parsed;
    return coerce(migrated);
  } catch {
    return defaultState(defaultSpecies);
  }
}

/* ---------- debounced save ---------- */

let saveTimer: ReturnType<typeof setTimeout> | null = null;

/** Persist state (debounced ~150ms). */
export function save(slug: string, state: SteadyState): void {
  if (typeof window === "undefined") return;
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(state));
    } catch {
      /* quota or unavailable — nothing we can do */
    }
  }, 150);
}

/** Write immediately, bypassing the debounce (used on unload / tests). */
export function saveNow(slug: string, state: SteadyState): void {
  if (typeof window === "undefined") return;
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  try {
    window.localStorage.setItem(storageKey(slug), JSON.stringify(state));
  } catch {
    /* ignore */
  }
}
