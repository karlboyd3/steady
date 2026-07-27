import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PetScreen } from "./PetScreen";
import { EMPTY_EQUIPPED } from "@/lib/rewards";
import { DEFAULT_TENANT } from "@/lib/tenant/types";

vi.mock("@/lib/tenant/tenant-provider", () => ({
  useTenant: () => DEFAULT_TENANT,
}));
vi.mock("./ProgressProvider", () => ({
  useProgressContext: () => ({
    completedCount: 0,
    streak: 0,
    completed: [],
    currentDay: 1,
    species: "turtle",
  }),
}));

function baseProps(overrides: Partial<React.ComponentProps<typeof PetScreen>> = {}) {
  return {
    petName: "Shelby",
    setPetName: vi.fn(),
    coins: 10,
    owned: [],
    equipped: EMPTY_EQUIPPED,
    level: 1,
    species: "turtle" as const,
    speciesChosen: true,
    setSpecies: vi.fn(),
    onBuy: vi.fn(),
    onEquip: vi.fn(),
    onBack: vi.fn(),
    ...overrides,
  };
}

describe("PetScreen (default tenant)", () => {
  it("renders Buddy's Corner with the mascot and closet once a species is chosen", async () => {
    render(<PetScreen {...baseProps()} />);
    expect(screen.getByText("Buddy's Corner")).toBeInTheDocument();
    // the hero pet loads through a Suspense-wrapped dynamic import — the
    // underlying dynamic import() is a real, uncached module transform
    // the first time it runs, so give it a generous timeout.
    expect(
      await screen.findByRole("img", { name: /turtle/i }, { timeout: 8000 })
    ).toBeInTheDocument();
    expect(screen.getByText("Closet — earn 🪙 by finishing sessions")).toBeInTheDocument();
    expect(screen.queryByText("Choose your buddy")).not.toBeInTheDocument();
  }, 10000);

  it("shows the species picker instead of the pet on a first visit", () => {
    render(<PetScreen {...baseProps({ speciesChosen: false })} />);
    expect(screen.getByText("Choose your buddy")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /turtle/i })).not.toBeInTheDocument();
  });

  it("calls setSpecies when a species is picked on first visit", () => {
    const setSpecies = vi.fn();
    render(<PetScreen {...baseProps({ speciesChosen: false, setSpecies })} />);
    fireEvent.click(screen.getByText("Fox"));
    expect(setSpecies).toHaveBeenCalledWith("fox");
  });

  it("opens a change-species sheet from the pet screen once a species exists", () => {
    const setSpecies = vi.fn();
    render(<PetScreen {...baseProps({ setSpecies })} />);
    fireEvent.click(screen.getByText("Change species"));
    // the sheet renders a second "Choose your buddy" grid, dismissible
    expect(screen.getAllByText("Choose your buddy").length).toBeGreaterThan(0);
    fireEvent.click(screen.getByText("Bear"));
    expect(setSpecies).toHaveBeenCalledWith("bear");
  });
});
