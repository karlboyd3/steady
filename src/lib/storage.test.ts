import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
  storageKey,
  defaultState,
  load,
  save,
  saveNow,
  todayISO,
  nextStreak,
} from "./storage";

beforeEach(() => {
  localStorage.clear();
});

describe("defaults", () => {
  it("starts on the Rebuilding Strength track, day 1, not onboarded", () => {
    const d = defaultState();
    expect(d.version).toBe(SCHEMA_VERSION);
    expect(d.track).toBe(1);
    expect(d.currentDay).toBe(1);
    expect(d.onboarded).toBe(false);
    expect(d.completed).toEqual([]);
    expect(d.petName).toBe("Shelby");
    expect(d.soundOn).toBe(true);
  });
});

describe("round-trip", () => {
  it("saves and loads state faithfully", () => {
    const s = {
      ...defaultState(),
      track: 2,
      onboarded: true,
      currentDay: 7,
      selectedDay: 7,
      completed: [1, 2, 3, 4, 5, 6],
      streak: 6,
      lastCompletedDate: "2026-07-08",
      coins: 42,
      owned: ["crown", "meadow"],
      equipped: { ...defaultState().equipped, hat: "crown", bg: "meadow" },
      petName: "Franklin",
      disclaimerAccepted: true,
      soundOn: false,
    };
    saveNow("default", s);
    expect(load("default")).toEqual(s);
  });

  it("debounced save eventually persists", async () => {
    const s = { ...defaultState(), coins: 99 };
    save("default", s);
    await new Promise((r) => setTimeout(r, 200));
    expect(load("default").coins).toBe(99);
  });
});

describe("tenant scoping", () => {
  it("keeps two tenants' state isolated under the same origin", () => {
    saveNow("acme-pt", { ...defaultState(), coins: 5 });
    saveNow("beta-clinic", { ...defaultState(), coins: 500 });
    expect(load("acme-pt").coins).toBe(5);
    expect(load("beta-clinic").coins).toBe(500);
  });

  it("stores each tenant under its own key", () => {
    saveNow("acme-pt", { ...defaultState(), coins: 5 });
    expect(localStorage.getItem(storageKey("acme-pt"))).not.toBeNull();
    expect(localStorage.getItem(storageKey("beta-clinic"))).toBeNull();
  });

  it("fails soft to defaults for a tenant with nothing stored", () => {
    expect(load("unknown-slug")).toEqual(defaultState());
  });
});

describe("legacy key migration", () => {
  it("claims the legacy unscoped key for the default tenant only, once", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultState(), coins: 77 })
    );
    expect(load("default").coins).toBe(77);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(localStorage.getItem(storageKey("default"))).not.toBeNull();
  });

  it("is idempotent: a second load after migration doesn't touch anything odd", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultState(), coins: 77 })
    );
    load("default");
    saveNow("default", { ...defaultState(), coins: 88 });
    expect(load("default").coins).toBe(88);
  });

  it("does not migrate the legacy key into a non-default tenant", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...defaultState(), coins: 77 })
    );
    expect(load("acme-pt")).toEqual(defaultState());
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });
});

describe("corruption / validation fallback", () => {
  it("returns defaults for a non-JSON blob", () => {
    localStorage.setItem(storageKey("default"), "{not valid json");
    expect(load("default")).toEqual(defaultState());
  });

  it("returns defaults when there is nothing stored", () => {
    expect(load("default")).toEqual(defaultState());
  });

  it("coerces missing / wrong-typed fields to defaults", () => {
    localStorage.setItem(
      storageKey("default"),
      JSON.stringify({ track: "banana", coins: null, petName: 5 })
    );
    const loaded = load("default");
    expect(loaded.track).toBe(defaultState().track);
    expect(loaded.coins).toBe(0);
    expect(loaded.petName).toBe("Shelby");
  });

  it("filters out-of-range completed days and non-string owned items", () => {
    localStorage.setItem(
      storageKey("default"),
      JSON.stringify({ completed: [1, 2, 99, -3, "x"], owned: ["crown", 7, null] })
    );
    const loaded = load("default");
    expect(loaded.completed).toEqual([1, 2]);
    expect(loaded.owned).toEqual(["crown"]);
  });

  it("rebuilds a valid equipped object from partial data", () => {
    localStorage.setItem(
      storageKey("default"),
      JSON.stringify({ equipped: { hat: "crown", bogus: "x" } })
    );
    const loaded = load("default");
    expect(loaded.equipped).toEqual({
      hat: "crown",
      face: null,
      neck: null,
      chest: null,
      bg: null,
    });
  });
});

describe("date-aware streak", () => {
  it("first-ever completion starts a streak of 1", () => {
    expect(nextStreak(0, null, "2026-07-08")).toBe(1);
  });
  it("consecutive calendar days increment", () => {
    expect(nextStreak(3, "2026-07-07", "2026-07-08")).toBe(4);
  });
  it("a same-day repeat leaves the streak unchanged", () => {
    expect(nextStreak(3, "2026-07-08", "2026-07-08")).toBe(3);
  });
  it("a gap of more than one day resets to 1", () => {
    expect(nextStreak(9, "2026-07-05", "2026-07-08")).toBe(1);
  });
  it("handles month boundaries", () => {
    expect(nextStreak(2, "2026-06-30", "2026-07-01")).toBe(3);
    expect(nextStreak(2, "2026-06-28", "2026-07-01")).toBe(1);
  });
});

describe("todayISO", () => {
  it("formats a date as YYYY-MM-DD (local)", () => {
    expect(todayISO(new Date(2026, 6, 8))).toBe("2026-07-08");
    expect(todayISO(new Date(2026, 0, 3))).toBe("2026-01-03");
  });
});
