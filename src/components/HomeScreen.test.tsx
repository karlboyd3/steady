import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HomeScreen } from "./HomeScreen";
import { EMPTY_EQUIPPED } from "@/lib/rewards";
import { DEFAULT_TENANT } from "@/lib/tenant/types";

vi.mock("@/lib/tenant/tenant-provider", () => ({
  useTenant: () => DEFAULT_TENANT,
}));
vi.mock("./ProgressProvider", () => ({
  useProgressContext: () => ({
    completedCount: 3,
    streak: 2,
    completed: [1, 2, 3],
    currentDay: 4,
  }),
}));

function baseProps() {
  return {
    currentDay: 4,
    completedSet: new Set([1, 2, 3]),
    completedCount: 3,
    streak: 2,
    selectedDay: 4,
    track: 1,
    coins: 40,
    petName: "Shelby",
    equipped: EMPTY_EQUIPPED,
    level: 1,
    onStart: vi.fn(),
    onPick: vi.fn(),
    onChangeLevel: vi.fn(),
    onVisitPet: vi.fn(),
  };
}

describe("HomeScreen (default tenant)", () => {
  it("renders the Steady brand, stats, and the Shelby mascot unchanged", () => {
    render(<HomeScreen {...baseProps()} />);
    expect(screen.getByText("Steady")).toBeInTheDocument();
    expect(screen.getByText("Start today's session")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /turtle/i })).toBeInTheDocument();
  });
});

describe("HomeScreen empty state", () => {
  function statFor(label: string): HTMLElement {
    const stat = screen.getByText(label).closest(".stat");
    if (!stat) throw new Error(`no .stat wrapper for "${label}"`);
    return stat as HTMLElement;
  }

  it("marks the zeroed stats as empty for a brand-new user", () => {
    render(
      <HomeScreen
        {...baseProps()}
        completedSet={new Set()}
        completedCount={0}
        streak={0}
        selectedDay={1}
        currentDay={1}
      />
    );
    expect(statFor("days done")).toHaveClass("is-empty");
    expect(statFor("day streak")).toHaveClass("is-empty");
    // "to go" is 30, a real number even on day one, so it stays emphasised.
    expect(statFor("to go")).not.toHaveClass("is-empty");
  });

  it("does not mark stats empty once there is progress", () => {
    render(<HomeScreen {...baseProps()} />);
    expect(statFor("days done")).not.toHaveClass("is-empty");
    expect(statFor("day streak")).not.toHaveClass("is-empty");
  });

  it("marks only the streak empty when a streak is broken but days are done", () => {
    render(<HomeScreen {...baseProps()} streak={0} />);
    expect(statFor("days done")).not.toHaveClass("is-empty");
    expect(statFor("day streak")).toHaveClass("is-empty");
  });
});
