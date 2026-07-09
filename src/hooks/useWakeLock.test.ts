import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useWakeLock } from "./useWakeLock";

interface FakeSentinel {
  released: boolean;
  release: ReturnType<typeof vi.fn>;
  addEventListener: (t: "release", l: () => void) => void;
  _fire: () => void;
}

function installWakeLock() {
  const sentinels: FakeSentinel[] = [];
  const request = vi.fn(async () => {
    const listeners: Array<() => void> = [];
    const s: FakeSentinel = {
      released: false,
      release: vi.fn(async () => {
        s.released = true;
        listeners.forEach((l) => l());
      }),
      addEventListener: (_t, l) => listeners.push(l),
      _fire: () => listeners.forEach((l) => l()),
    };
    sentinels.push(s);
    return s;
  });
  Object.defineProperty(navigator, "wakeLock", {
    value: { request },
    configurable: true,
    writable: true,
  });
  return { request, sentinels };
}

function removeWakeLock() {
  Object.defineProperty(navigator, "wakeLock", {
    value: undefined,
    configurable: true,
    writable: true,
  });
}

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    value: state,
    configurable: true,
  });
}

beforeEach(() => setVisibility("visible"));
afterEach(() => {
  removeWakeLock();
  vi.restoreAllMocks();
});

describe("useWakeLock", () => {
  it("acquires a screen lock when active", async () => {
    const { request } = installWakeLock();
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(request).toHaveBeenCalledWith("screen"));
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("does not acquire when inactive", async () => {
    const { request } = installWakeLock();
    renderHook(() => useWakeLock(false));
    await Promise.resolve();
    expect(request).not.toHaveBeenCalled();
  });

  it("releases when active flips to false", async () => {
    const { request, sentinels } = installWakeLock();
    const { rerender } = renderHook(({ a }) => useWakeLock(a), {
      initialProps: { a: true },
    });
    await waitFor(() => expect(sentinels).toHaveLength(1));
    rerender({ a: false });
    await waitFor(() => expect(sentinels[0].release).toHaveBeenCalled());
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("releases on unmount", async () => {
    const { sentinels } = installWakeLock();
    const { unmount } = renderHook(() => useWakeLock(true));
    await waitFor(() => expect(sentinels).toHaveLength(1));
    unmount();
    await waitFor(() => expect(sentinels[0].release).toHaveBeenCalled());
  });

  it("re-acquires on return to a visible tab while active", async () => {
    const { request, sentinels } = installWakeLock();
    renderHook(() => useWakeLock(true));
    await waitFor(() => expect(sentinels).toHaveLength(1));
    // Simulate the OS auto-releasing when hidden, then coming back.
    act(() => sentinels[0]._fire());
    setVisibility("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await waitFor(() => expect(request).toHaveBeenCalledTimes(2));
  });

  it("does not re-acquire on visibilitychange when inactive", async () => {
    const { request } = installWakeLock();
    renderHook(() => useWakeLock(false));
    setVisibility("visible");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    await Promise.resolve();
    expect(request).not.toHaveBeenCalled();
  });

  it("degrades silently when the API is unsupported", async () => {
    removeWakeLock();
    const { result } = renderHook(() => useWakeLock(true));
    await Promise.resolve();
    expect(result.current.isSupported).toBe(false);
    // must not throw
    await act(async () => {
      await result.current.acquire();
      await result.current.release();
    });
  });
});
