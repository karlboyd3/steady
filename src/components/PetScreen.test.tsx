import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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
  }),
}));

describe("PetScreen (default tenant)", () => {
  it("renders Buddy's Corner with the Shelby mascot and closet", () => {
    render(
      <PetScreen
        petName="Shelby"
        setPetName={vi.fn()}
        coins={10}
        owned={[]}
        equipped={EMPTY_EQUIPPED}
        level={1}
        onBuy={vi.fn()}
        onEquip={vi.fn()}
        onBack={vi.fn()}
      />
    );
    expect(screen.getByText("Buddy's Corner")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /turtle/i })).toBeInTheDocument();
    expect(screen.getByText("Closet — earn 🪙 by finishing sessions")).toBeInTheDocument();
  });
});
