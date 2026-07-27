import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSessionEngine } from "./useSessionEngine";
import { buildDay, sessionSeconds } from "@/lib/tracks";

describe("useSessionEngine overrides", () => {
  it("uses the base buildDay() volume when no overrides are given", () => {
    const { result } = renderHook(() =>
      useSessionEngine({ day: 1, track: 0, soundOn: false, onDone: () => {} })
    );
    const base = buildDay(1, 0);
    expect(result.current.items.map((i) => i.reps ?? i.secs)).toEqual(
      base.map((i) => i.reps ?? i.secs)
    );
  });

  it("applies a reps override for the matching exercise only", () => {
    const base = buildDay(1, 0);
    const target = base[0];
    const { result } = renderHook(() =>
      useSessionEngine({
        day: 1,
        track: 0,
        soundOn: false,
        onDone: () => {},
        overrides: { [target.id]: { reps: 99 } },
      })
    );
    expect(result.current.items[0].id).toBe(target.id);
    if (target.ex.type === "reps") {
      expect(result.current.items[0].reps).toBe(99);
    }
    // every other item is untouched
    for (let i = 1; i < base.length; i++) {
      expect(result.current.items[i].reps).toBe(base[i].reps);
      expect(result.current.items[i].secs).toBe(base[i].secs);
    }
  });

  it("applies a secs override for a timed exercise", () => {
    const base = buildDay(1, 0);
    const timedIdx = base.findIndex((i) => i.ex.type === "time");
    const target = base[timedIdx];
    const { result } = renderHook(() =>
      useSessionEngine({
        day: 1,
        track: 0,
        soundOn: false,
        onDone: () => {},
        overrides: { [target.id]: { secs: 42 } },
      })
    );
    expect(result.current.items[timedIdx].secs).toBe(42);
  });
});

describe("useSessionEngine skip tracking", () => {
  it("counts a skip that cuts an exercise short, not a rest→next advance", () => {
    const onDone = vi.fn();
    const items = buildDay(1, 0);
    const { result } = renderHook(() =>
      useSessionEngine({ day: 1, track: 0, soundOn: false, onDone })
    );
    expect(result.current.items.length).toBe(items.length);

    // Skip through every exercise from "prep" each time (never entering
    // work), alternating with the rest→next advance that follows.
    for (let i = 0; i < items.length; i++) {
      act(() => result.current.skip()); // prep/work → rest: counts
      if (i < items.length - 1) {
        act(() => result.current.skip()); // rest → next prep: does not count
      }
    }

    expect(onDone).toHaveBeenCalledTimes(1);
    expect(onDone).toHaveBeenCalledWith({
      skippedCount: items.length,
      totalCount: items.length,
    });
  });

  it("counts zero skips when the session plays out on its own clock", () => {
    vi.useFakeTimers();
    try {
      const onDone = vi.fn();
      const { result } = renderHook(() =>
        useSessionEngine({ day: 1, track: 0, soundOn: false, onDone })
      );
      const totalItems = result.current.items.length;
      const totalMs = (sessionSeconds(1, 0) + 30) * 1000;
      act(() => {
        vi.advanceTimersByTime(totalMs);
      });
      expect(onDone).toHaveBeenCalledWith({ skippedCount: 0, totalCount: totalItems });
    } finally {
      vi.useRealTimers();
    }
  });

  it("counts a skip during the actual work stage (not just prep)", () => {
    vi.useFakeTimers();
    try {
      const onDone = vi.fn();
      const { result } = renderHook(() =>
        useSessionEngine({ day: 1, track: 0, soundOn: false, onDone })
      );
      const totalItems = result.current.items.length;
      // Advance past "prep" (PREP_SECS = 5s) into "work".
      act(() => {
        vi.advanceTimersByTime(5100);
      });
      expect(result.current.state.stage).not.toBe("prep");
      act(() => result.current.skip()); // the only skip — counts once
      // Let the rest of the session play out on its own clock (no more
      // skip() calls), so nothing else adds to the count.
      act(() => {
        vi.advanceTimersByTime((sessionSeconds(1, 0) + 30) * 1000);
      });
      expect(onDone).toHaveBeenCalledWith({ skippedCount: 1, totalCount: totalItems });
    } finally {
      vi.useRealTimers();
    }
  });
});
