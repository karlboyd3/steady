import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WorkoutOverview } from "./WorkoutOverview";
import { buildDay } from "@/lib/tracks";
import { mockMatchMedia } from "@/test-utils/matchMedia";

beforeEach(() => {
  mockMatchMedia(false);
});

describe("WorkoutOverview", () => {
  it("shows the exercise count, tappable list, and Start button", () => {
    const items = buildDay(1, 0);
    const onStart = vi.fn();
    const onSelectExercise = vi.fn();
    render(
      <WorkoutOverview
        day={1}
        trackIdx={0}
        items={items}
        alreadyDone={false}
        onSelectExercise={onSelectExercise}
        onStart={onStart}
        onExit={vi.fn()}
      />
    );
    expect(screen.getByText(String(items.length))).toBeInTheDocument();
    expect(screen.getByText(items[0].ex.name.toUpperCase())).toBeInTheDocument();

    fireEvent.click(screen.getByText("Start Workout"));
    expect(onStart).toHaveBeenCalled();

    fireEvent.click(screen.getByText(items[0].ex.name.toUpperCase()));
    expect(onSelectExercise).toHaveBeenCalledWith(0);
  });

  it("shows 'Do it again' when the day is already completed", () => {
    render(
      <WorkoutOverview
        day={1}
        trackIdx={0}
        items={buildDay(1, 0)}
        alreadyDone
        onSelectExercise={vi.fn()}
        onStart={vi.fn()}
        onExit={vi.fn()}
      />
    );
    expect(screen.getByText("Do it again")).toBeInTheDocument();
  });

  it("calls onExit from the back button", () => {
    const onExit = vi.fn();
    render(
      <WorkoutOverview
        day={1}
        trackIdx={0}
        items={buildDay(1, 0)}
        alreadyDone={false}
        onSelectExercise={vi.fn()}
        onStart={vi.fn()}
        onExit={onExit}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(onExit).toHaveBeenCalled();
  });
});
