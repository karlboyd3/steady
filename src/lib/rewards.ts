/* ============================================================
   STEADY — Rewards: coin math, pet levels, closet catalog & logic
   ============================================================ */

export type Slot = "hat" | "face" | "neck" | "chest" | "bg";

export type Equipped = Record<Slot, string | null>;

export type Species = "turtle" | "fox" | "dog" | "cat" | "rabbit" | "bear";

export interface SpeciesInfo {
  id: Species;
  label: string;
  emoji: string;
}

export const SPECIES: SpeciesInfo[] = [
  { id: "turtle", label: "Turtle", emoji: "🐢" },
  { id: "fox", label: "Fox", emoji: "🦊" },
  { id: "dog", label: "Dog", emoji: "🐶" },
  { id: "cat", label: "Cat", emoji: "🐱" },
  { id: "rabbit", label: "Rabbit", emoji: "🐰" },
  { id: "bear", label: "Bear", emoji: "🐻" },
];

const SPECIES_IDS = SPECIES.map((s) => s.id);

export function isSpecies(v: unknown): v is Species {
  return typeof v === "string" && (SPECIES_IDS as string[]).includes(v);
}

/** 3D attachment socket a given cosmetic slot maps to. `bg` items are scene
 * backdrops, not body attachments, so they have no socket. */
export type Socket = "head" | "face" | "neck" | "chest";

export const SOCKET_FOR_SLOT: Partial<Record<Slot, Socket>> = {
  hat: "head",
  face: "face",
  neck: "neck",
  chest: "chest",
};

export interface Item {
  id: string;
  name: string;
  cost: number;
  slot: Slot;
  emoji: string;
}

export const ITEMS: Item[] = [
  { id: "sweatband", name: "Sweatband", cost: 10, slot: "hat", emoji: "🎽" },
  { id: "party", name: "Party Hat", cost: 15, slot: "hat", emoji: "🥳" },
  { id: "crown", name: "Crown", cost: 40, slot: "hat", emoji: "👑" },
  { id: "glasses", name: "Cool Shades", cost: 15, slot: "face", emoji: "🕶️" },
  { id: "bandana", name: "Bandana", cost: 20, slot: "neck", emoji: "🧣" },
  { id: "medal", name: "Gold Medal", cost: 25, slot: "chest", emoji: "🏅" },
  { id: "meadow", name: "Meadow", cost: 20, slot: "bg", emoji: "🌼" },
  { id: "beach", name: "Beach Day", cost: 30, slot: "bg", emoji: "🏖️" },
  { id: "night", name: "Starry Night", cost: 30, slot: "bg", emoji: "🌙" },
];

export const EMPTY_EQUIPPED: Equipped = {
  hat: null,
  face: null,
  neck: null,
  chest: null,
  bg: null,
};

/**
 * Coins earned when finishing a session.
 * First completion: 10 + 2×(streak + 1), where `streak` is the count *before*
 * this session is credited. Repeating an already-completed day: a flat 3.
 */
export function coinsForCompletion(streak: number, alreadyDone: boolean): number {
  return alreadyDone ? 3 : 10 + 2 * (streak + 1);
}

/** Pet level = floor(completedDays / 5) + 1. */
export function petLevel(completedCount: number): number {
  return Math.floor(completedCount / 5) + 1;
}

export function itemById(id: string): Item | undefined {
  return ITEMS.find((it) => it.id === id);
}

export function canAfford(coins: number, item: Item, owned: string[]): boolean {
  return coins >= item.cost && !owned.includes(item.id);
}

export interface PurchaseState {
  coins: number;
  owned: string[];
  equipped: Equipped;
}

/**
 * Buy an item: deduct coins, add to owned, auto-equip in its slot.
 * No-op (returns the same values) if unaffordable or already owned.
 */
export function applyPurchase(state: PurchaseState, item: Item): PurchaseState {
  if (!canAfford(state.coins, item, state.owned)) return state;
  return {
    coins: state.coins - item.cost,
    owned: [...state.owned, item.id],
    equipped: { ...state.equipped, [item.slot]: item.id },
  };
}

/** Toggle an owned item in its slot (wear it, or take it off if already worn). */
export function applyEquip(equipped: Equipped, item: Item): Equipped {
  return {
    ...equipped,
    [item.slot]: equipped[item.slot] === item.id ? null : item.id,
  };
}
