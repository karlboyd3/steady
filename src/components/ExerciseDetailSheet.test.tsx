import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExerciseDetailSheet } from "./ExerciseDetailSheet";
import { buildDay } from "@/lib/tracks";
import type { RepOverrides } from "@/lib/exercises";
import { mockMatchMedia } from "@/test-utils/matchMedia";

function Harness({
  index = 0,
  overrides = {},
  onOverrideChange = vi.fn(),
  onNavigate = vi.fn(),
  onClose = vi.fn(),
}: {
  index?: number;
  overrides?: RepOverrides;
  onOverrideChange?: (id: string, patch: { reps?: number; secs?: number }) => void;
  onNavigate?: (i: number) => void;
  onClose?: () => void;
}) {
  const items = buildDay(1, 0); // 6 items, "Early Recovery" plan
  return (
    <ExerciseDetailSheet
      open
      onClose={onClose}
      items={items}
      index={index}
      onNavigate={onNavigate}
      overrides={overrides}
      onOverrideChange={onOverrideChange as never}
    />
  );
}

describe("ExerciseDetailSheet", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the exercise name and defaults to the Animation tab", () => {
    render(<Harness />);
    expect(screen.getByRole("heading", { name: /quad squeezes/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Animation" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });

  it("hides the How-to-do tab when the exercise has no videoUrl", () => {
    render(<Harness />);
    expect(screen.queryByRole("tab", { name: "How to do" })).not.toBeInTheDocument();
  });

  it("switches to the Muscle tab and renders the BodyMap", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("tab", { name: "Muscle" }));
    expect(screen.getByRole("tab", { name: "Muscle" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("img", { name: /muscles worked|no muscle groups/i })).toBeInTheDocument();
  });

  it("steps the reps value up and reports the override for the current exercise", () => {
    const items = buildDay(1, 0);
    const onOverrideChange = vi.fn();
    render(<Harness onOverrideChange={onOverrideChange} />);
    fireEvent.click(screen.getByRole("button", { name: /increase repeats/i }));
    expect(onOverrideChange).toHaveBeenCalledWith(items[0].id, {
      reps: (items[0].reps ?? 0) + 1,
    });
  });

  it("reflects an existing override instead of the base value", () => {
    const items = buildDay(1, 0);
    render(<Harness overrides={{ [items[0].id]: { reps: 42 } }} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows a coming-soon toast when Replace is tapped", async () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: "Replace" }));
    expect(await screen.findByRole("status")).toHaveTextContent(/coming soon/i);
  });

  it("disables Prev on the first exercise and calls onNavigate from Next", () => {
    const onNavigate = vi.fn();
    render(<Harness index={0} onNavigate={onNavigate} />);
    expect(screen.getByRole("button", { name: /prev/i })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: /next/i }));
    expect(onNavigate).toHaveBeenCalledWith(1);
  });

  it("disables Next on the last exercise", () => {
    const items = buildDay(1, 0);
    render(<Harness index={items.length - 1} />);
    expect(screen.getByRole("button", { name: /next/i })).toBeDisabled();
  });

  it("calls onClose from the footer Close button", () => {
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
