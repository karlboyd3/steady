import { describe, it, expect } from "vitest";
import {
  ITEMS,
  SPECIES,
  SOCKET_FOR_SLOT,
  EMPTY_EQUIPPED,
  coinsForCompletion,
  petLevel,
  canAfford,
  applyPurchase,
  applyEquip,
  itemById,
  isSpecies,
  type Item,
  type Equipped,
} from "./rewards";

const crown = itemById("crown")!; // hat, 40
const glasses = itemById("glasses")!; // face, 15
const party = itemById("party")!; // hat, 15

describe("coinsForCompletion", () => {
  it("first completion = 10 + 2×(streak+1)", () => {
    expect(coinsForCompletion(0, false)).toBe(12);
    expect(coinsForCompletion(1, false)).toBe(14);
    expect(coinsForCompletion(4, false)).toBe(20);
  });
  it("repeating an already-done day = flat 3", () => {
    expect(coinsForCompletion(0, true)).toBe(3);
    expect(coinsForCompletion(10, true)).toBe(3);
  });
});

describe("petLevel thresholds", () => {
  it("levels up every 5 completed days", () => {
    expect(petLevel(0)).toBe(1);
    expect(petLevel(4)).toBe(1);
    expect(petLevel(5)).toBe(2);
    expect(petLevel(9)).toBe(2);
    expect(petLevel(10)).toBe(3);
    expect(petLevel(30)).toBe(7);
  });
});

describe("catalog", () => {
  it("has 9 items across the five slots", () => {
    expect(ITEMS).toHaveLength(9);
    const slots = new Set(ITEMS.map((i) => i.slot));
    expect(slots).toEqual(new Set(["hat", "face", "neck", "chest", "bg"]));
  });
});

describe("canAfford", () => {
  it("requires enough coins and not already owned", () => {
    expect(canAfford(40, crown, [])).toBe(true);
    expect(canAfford(39, crown, [])).toBe(false);
    expect(canAfford(40, crown, ["crown"])).toBe(false);
  });
});

describe("applyPurchase", () => {
  const base = { coins: 50, owned: [] as string[], equipped: { ...EMPTY_EQUIPPED } };
  it("deducts coins, records ownership, and auto-equips", () => {
    const r = applyPurchase(base, crown);
    expect(r.coins).toBe(10);
    expect(r.owned).toContain("crown");
    expect(r.equipped.hat).toBe("crown");
  });
  it("is a no-op when unaffordable", () => {
    const poor = { ...base, coins: 5 };
    const r = applyPurchase(poor, crown);
    expect(r).toBe(poor);
  });
  it("is a no-op when already owned", () => {
    const r = applyPurchase({ ...base, owned: ["crown"] }, crown);
    expect(r.coins).toBe(50);
  });
  it("replaces the item already equipped in the same slot", () => {
    const rich = { coins: 60, owned: [] as string[], equipped: { ...EMPTY_EQUIPPED } };
    const afterParty = applyPurchase(rich, party); // hat = party, 45 left
    const afterCrown = applyPurchase(afterParty, crown); // hat = crown, 5 left
    expect(afterCrown.equipped.hat).toBe("crown");
    expect(afterCrown.owned).toEqual(["party", "crown"]);
  });
});

describe("applyEquip", () => {
  it("toggles an owned item on and off within its slot", () => {
    let eq: Equipped = { ...EMPTY_EQUIPPED };
    eq = applyEquip(eq, glasses);
    expect(eq.face).toBe("glasses");
    eq = applyEquip(eq, glasses);
    expect(eq.face).toBeNull();
  });
  it("swaps items sharing a slot", () => {
    let eq: Equipped = { ...EMPTY_EQUIPPED, hat: "party" };
    eq = applyEquip(eq, crown);
    expect(eq.hat).toBe("crown");
  });
  it("leaves other slots untouched", () => {
    const eq = applyEquip({ ...EMPTY_EQUIPPED, bg: "meadow" }, glasses);
    expect(eq.bg).toBe("meadow");
    expect(eq.face).toBe("glasses");
  });
});

describe("itemById", () => {
  it("finds a known item and returns undefined otherwise", () => {
    expect(itemById("medal")?.cost).toBe(25);
    expect(itemById("nope" as unknown as string) as Item | undefined).toBeUndefined();
  });
});

describe("SPECIES", () => {
  it("has exactly 6 unique species", () => {
    expect(SPECIES).toHaveLength(6);
    expect(new Set(SPECIES.map((s) => s.id)).size).toBe(6);
  });

  it("isSpecies validates against the catalog", () => {
    expect(isSpecies("turtle")).toBe(true);
    expect(isSpecies("fox")).toBe(true);
    expect(isSpecies("dragon")).toBe(false);
    expect(isSpecies(undefined)).toBe(false);
    expect(isSpecies(42)).toBe(false);
  });
});

describe("SOCKET_FOR_SLOT", () => {
  it("maps every wearable slot to a 3D socket, but not bg", () => {
    expect(SOCKET_FOR_SLOT.hat).toBe("head");
    expect(SOCKET_FOR_SLOT.face).toBe("face");
    expect(SOCKET_FOR_SLOT.neck).toBe("neck");
    expect(SOCKET_FOR_SLOT.chest).toBe("chest");
    expect(SOCKET_FOR_SLOT.bg).toBeUndefined();
  });
});
