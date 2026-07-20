import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DoneScreen } from "./DoneScreen";
import { EMPTY_EQUIPPED } from "@/lib/rewards";
import { DEFAULT_TENANT } from "@/lib/tenant/types";

vi.mock("@/lib/tenant/tenant-provider", () => ({
  useTenant: () => DEFAULT_TENANT,
}));
vi.mock("./ProgressProvider", () => ({
  useProgressContext: () => ({
    completedCount: 5,
    streak: 3,
    completed: [1, 2, 3, 4, 5],
    currentDay: 6,
  }),
}));

describe("DoneScreen (default tenant)", () => {
  it("shows the mascot cheer copy and the Pet mascot for day completion", () => {
    render(
      <DoneScreen
        day={5}
        track={1}
        streak={3}
        alreadyDone={false}
        petName="Shelby"
        equipped={EMPTY_EQUIPPED}
        onFinish={vi.fn()}
      />
    );
    expect(screen.getByText("Day 5 complete!")).toBeInTheDocument();
    expect(screen.getByText(/Shelby is doing a happy dance/)).toBeInTheDocument();
    expect(screen.getByRole("img", { name: /turtle/i })).toBeInTheDocument();
  });
});
