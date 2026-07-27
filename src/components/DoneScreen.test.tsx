import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DoneScreen } from "./DoneScreen";
import { EMPTY_EQUIPPED, type Species } from "@/lib/rewards";
import { DEFAULT_TENANT } from "@/lib/tenant/types";
import { todayISO } from "@/lib/storage";

vi.mock("@/lib/tenant/tenant-provider", () => ({
  useTenant: () => DEFAULT_TENANT,
}));

const progressCompanionMock = vi.fn();
vi.mock("./ProgressCompanion", () => ({
  ProgressCompanion: (props: unknown) => {
    progressCompanionMock(props);
    return <div data-testid="progress-companion" />;
  },
}));

const celebrationOverlayMock = vi.fn();
vi.mock("./pet3d/CelebrationOverlay", () => ({
  default: (props: unknown) => {
    celebrationOverlayMock(props);
    return <div data-testid="celebration-overlay" />;
  },
}));

function daysAgoISO(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return todayISO(d);
}

function baseProps(overrides: Partial<React.ComponentProps<typeof DoneScreen>> = {}) {
  return {
    day: 4,
    track: 1,
    streak: 1,
    alreadyDone: false,
    lastCompletedDate: daysAgoISO(1), // consecutive → newStreak = streak+1
    skippedCount: 0,
    totalCount: 6,
    petName: "Shelby",
    species: "turtle" as Species,
    equipped: EMPTY_EQUIPPED,
    onFinish: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  progressCompanionMock.mockClear();
  celebrationOverlayMock.mockClear();
});

describe("DoneScreen — tier selection", () => {
  it("session tier: celebrates inline immediately, no overlay", () => {
    render(<DoneScreen {...baseProps({ day: 4, streak: 1 })} />); // newStreak=2, not a threshold
    expect(screen.getByText("Day 4 complete!")).toBeInTheDocument();
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.variant).toBe("celebrate");
    expect(lastCall.celebration).toEqual({ tier: "session", subdued: false });
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
  });

  it("streak tier: celebrates inline with the streak badge, no overlay", () => {
    render(<DoneScreen {...baseProps({ day: 5, streak: 6 })} />); // newStreak=7 → threshold
    expect(screen.getByText("🔥 7-day streak!")).toBeInTheDocument();
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.celebration).toEqual({ tier: "streak", subdued: false });
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
  });

  it("track tier: does not celebrate (inline or overlay) until pain is answered", () => {
    render(<DoneScreen {...baseProps({ day: 10 })} />);
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.variant).toBeUndefined(); // plain, non-celebrating ProgressCompanion
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
  });

  it("track tier: shows the full-screen overlay once pain is answered (non-sharp)", async () => {
    render(<DoneScreen {...baseProps({ day: 20 })} />);
    fireEvent.click(screen.getByText("😊 Felt good"));
    // CelebrationOverlay is Suspense/dynamic-loaded — wait for it to resolve.
    await screen.findByTestId("celebration-overlay", {}, { timeout: 8000 });
    expect(celebrationOverlayMock).toHaveBeenCalledTimes(1);
    expect(celebrationOverlayMock.mock.calls[0][0]).toMatchObject({ day: 20, subdued: false });
    // inline hero stays plain while the overlay is the one celebrating —
    // no stacked/duplicate celebration
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.variant).toBeUndefined();
  }, 10000);

  it("track tier: never shows the overlay if a finish button is clicked before pain is answered", () => {
    const onFinish = vi.fn();
    render(<DoneScreen {...baseProps({ day: 30, onFinish })} />);
    fireEvent.click(screen.getByText("Collect & finish"));
    expect(onFinish).toHaveBeenCalledWith("home");
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
  });

  it("does not re-fire streak/track tiers on a repeat of an already-completed day", () => {
    render(<DoneScreen {...baseProps({ day: 10, alreadyDone: true, streak: 9 })} />);
    fireEvent.click(screen.getByText("😊 Felt good"));
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.celebration).toEqual({ tier: "session", subdued: false });
  });
});

describe("DoneScreen — subdued tone", () => {
  it("inline tiers subdue immediately when the skip rate is at/above 50%, without waiting for pain", () => {
    render(<DoneScreen {...baseProps({ day: 4, skippedCount: 3, totalCount: 6 })} />);
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.celebration.subdued).toBe(true);
  });

  it("track tier subdues (inline, no overlay) when pain is answered 'sharp'", () => {
    render(<DoneScreen {...baseProps({ day: 10 })} />);
    fireEvent.click(screen.getByText("😣 Sharp or worsening pain"));
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.variant).toBe("celebrate");
    expect(lastCall.celebration).toEqual({ tier: "track", subdued: true });
  });

  it("track tier subdues via skip rate alone, even with a non-sharp pain answer", () => {
    render(<DoneScreen {...baseProps({ day: 10, skippedCount: 4, totalCount: 6 })} />);
    fireEvent.click(screen.getByText("😊 Felt good"));
    expect(celebrationOverlayMock).not.toHaveBeenCalled();
    const lastCall = progressCompanionMock.mock.calls.at(-1)?.[0];
    expect(lastCall.celebration).toEqual({ tier: "track", subdued: true });
  });

  it("track tier is NOT subdued for mild soreness alone (below the skip threshold)", async () => {
    render(<DoneScreen {...baseProps({ day: 10 })} />);
    fireEvent.click(screen.getByText("😐 A little sore or stiff"));
    await screen.findByTestId("celebration-overlay", {}, { timeout: 8000 });
    expect(celebrationOverlayMock).toHaveBeenCalledTimes(1);
    expect(celebrationOverlayMock.mock.calls[0][0]).toMatchObject({ subdued: false });
  }, 10000);
});

describe("DoneScreen (default tenant, unchanged behavior)", () => {
  it("shows the mascot cheer copy for day completion", () => {
    render(<DoneScreen {...baseProps({ day: 5, streak: 3 })} />);
    expect(screen.getByText("Day 5 complete!")).toBeInTheDocument();
    expect(screen.getByText(/Shelby is doing a happy dance/)).toBeInTheDocument();
    expect(screen.getByTestId("progress-companion")).toBeInTheDocument();
  });
});
