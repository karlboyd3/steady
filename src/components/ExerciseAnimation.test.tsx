import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { ExerciseAnimation } from "./ExerciseAnimation";
import { mockMatchMedia } from "@/test-utils/matchMedia";

// Overrides vitest.setup.ts's global lottie-react mock for this file only,
// so we can assert LottieLoop actually mounted (not just that nothing crashed).
const useLottieMock = vi.fn(() => ({
  View: <div data-testid="lottie-view" />,
  play: vi.fn(),
  pause: vi.fn(),
}));
vi.mock("lottie-react", () => ({
  useLottie: () => useLottieMock(),
}));

describe("ExerciseAnimation", () => {
  beforeEach(() => {
    mockMatchMedia(false);
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("falls back to the Figure pose animation when no Lottie JSON exists", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
    const { container } = render(<ExerciseAnimation exerciseId="quadSet" />);
    await waitFor(() => {
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  it("still renders a static Figure frame under reduced motion", async () => {
    mockMatchMedia(true);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 404 })
    );
    const { container } = render(<ExerciseAnimation exerciseId="wallSit" />);
    await waitFor(() => {
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  it("falls back to Figure when the fetch itself rejects (network error)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { container } = render(<ExerciseAnimation exerciseId="miniSquat" />);
    await waitFor(() => {
      expect(container.querySelector("svg")).toBeTruthy();
    });
  });

  it("renders Figure immediately with no gap, then activates the lazy-loaded Lottie path once a real animation JSON exists", async () => {
    useLottieMock.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ v: "5.9.0", layers: [] }),
      })
    );
    const { container } = render(<ExerciseAnimation exerciseId="quadSet" />);
    // No loading flash: Figure renders synchronously before the fetch (and
    // therefore the dynamic lottie-react chunk) has even resolved.
    expect(container.querySelector("svg")).toBeTruthy();

    // Once the JSON resolves, the Suspense-wrapped dynamic import of
    // LottieLoop resolves in turn and useLottie takes over.
    await screen.findByTestId("lottie-view", {}, { timeout: 8000 });
    expect(useLottieMock).toHaveBeenCalled();
  }, 10000);
});
