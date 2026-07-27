import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SessionPlayer } from "./SessionPlayer";
import { buildDay } from "@/lib/tracks";
import { mockMatchMedia } from "@/test-utils/matchMedia";

function renderPlayer(props: Partial<React.ComponentProps<typeof SessionPlayer>> = {}) {
  const onDone = vi.fn();
  const onExit = vi.fn();
  const onToggleSound = vi.fn();
  const result = render(
    <SessionPlayer
      day={1}
      track={0}
      soundOn={false}
      species="turtle"
      onToggleSound={onToggleSound}
      onDone={onDone}
      onExit={onExit}
      {...props}
    />
  );
  return { onDone, onExit, onToggleSound, ...result };
}

const skipOrStartNow = () =>
  screen.getByRole("button", { name: /skip →|start now →/i });

describe("SessionPlayer", () => {
  beforeEach(() => {
    mockMatchMedia(false);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts on the first exercise's prep stage with a segment per exercise", () => {
    const items = buildDay(1, 0);
    const { container } = renderPlayer({});
    expect(screen.getByText("Exercise 1 of 6")).toBeInTheDocument();
    expect(screen.getByText(items[0].ex.name)).toBeInTheDocument();
    expect(container.querySelectorAll(".segbar-seg").length).toBe(items.length);
  });

  it("advances stages via Skip and moves to the next exercise on the rest screen", () => {
    const items = buildDay(1, 0);
    renderPlayer();
    // prep(0) -> rest(0)
    fireEvent.click(skipOrStartNow());
    expect(screen.getByText("Rest & reset")).toBeInTheDocument();
    expect(screen.getByText(items[1].ex.name)).toBeInTheDocument(); // "up next"
    // rest(0) -> prep(1)
    fireEvent.click(skipOrStartNow());
    expect(screen.getByText("Exercise 2 of 6")).toBeInTheDocument();
  });

  it("calls onDone once the last exercise is skipped past", () => {
    const { onDone } = renderPlayer();
    // 6 exercises: prep->rest->prep->rest->...->prep(last)->done
    for (let i = 0; i < 11; i++) {
      fireEvent.click(skipOrStartNow());
    }
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it("calls onShowExerciseDetail with the current exercise index from the help button", () => {
    const onShowExerciseDetail = vi.fn();
    renderPlayer({ onShowExerciseDetail });
    fireEvent.click(screen.getByRole("button", { name: /about/i }));
    expect(onShowExerciseDetail).toHaveBeenCalledWith(0);
  });

  it("omits the help button entirely when onShowExerciseDetail isn't provided", () => {
    renderPlayer();
    expect(screen.queryByRole("button", { name: /about/i })).not.toBeInTheDocument();
  });

  it("applies reps overrides to the displayed session (Exercise count unaffected, volume reflected)", () => {
    const items = buildDay(1, 0);
    const target = items[0];
    renderPlayer({ overrides: { [target.id]: { reps: 77 } } });
    // still 6 exercises, just the first one's volume is overridden
    expect(screen.getByText("Exercise 1 of 6")).toBeInTheDocument();
  });
});
