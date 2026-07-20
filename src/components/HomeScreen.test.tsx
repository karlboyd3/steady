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
