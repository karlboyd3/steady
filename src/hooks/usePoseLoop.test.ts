import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePoseLoop } from "./usePoseLoop";
import { EX } from "@/lib/exercises";
import { mockMatchMedia } from "@/test-utils/matchMedia";

describe("usePoseLoop", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("stays at 0 when inactive", () => {
    const { result } = renderHook(() => usePoseLoop(EX.quadSet, false));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(0);
  });

  it("stays at 0 under reduced motion even when active", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => usePoseLoop(EX.quadSet, true));
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBe(0);
  });

  it("advances the pose phase over time when active", () => {
    const { result } = renderHook(() => usePoseLoop(EX.quadSet, true)); // cadence 6s
    act(() => {
      vi.advanceTimersByTime(1500); // quarter of the 6s cadence
    });
    expect(result.current).toBeGreaterThan(0.3);
    expect(result.current).toBeLessThan(0.7);
  });
});
