import { describe, it, expect, beforeEach } from "vitest";
import {
  STORAGE_KEY,
  SCHEMA_VERSION,
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
    saveNow(s);
    expect(load()).toEqual(s);
  });

  it("debounced save eventually persists", async () => {
    const s = { ...defaultState(), coins: 99 };
    save(s);
    await new Promise((r) => setTimeout(r, 200));
    expect(load().coins).toBe(99);
  });
});

describe("corruption / validation fallback", () => {
  it("returns defaults for a non-JSON blob", () => {
    localStorage.setItem(STORAGE_KEY, "{not valid json");
    expect(load()).toEqual(defaultState());
  });

  it("returns defaults when there is nothing stored", () => {
    expect(load()).toEqual(defaultState());
  });

  it("coerces missing / wrong-typed fields to defaults", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ track: "banana", coins: null, petName: 5 })
    );
    const loaded = load();
    expect(loaded.track).toBe(defaultState().track);
    expect(loaded.coins).toBe(0);
    expect(loaded.petName).toBe("Shelby");
  });

  it("filters out-of-range completed days and non-string owned items", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ completed: [1, 2, 99, -3, "x"], owned: ["crown", 7, null] })
    );
    const loaded = load();
    expect(loaded.completed).toEqual([1, 2]);
    expect(loaded.owned).toEqual(["crown"]);
  });

  it("rebuilds a valid equipped object from partial data", () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ equipped: { hat: "crown", bogus: "x" } })
    );
    const loaded = load();
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
