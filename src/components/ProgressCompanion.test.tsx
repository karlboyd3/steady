import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressCompanion } from "./ProgressCompanion";
import { EMPTY_EQUIPPED } from "@/lib/rewards";

const useTenantMock = vi.fn();
vi.mock("@/lib/tenant/tenant-provider", () => ({
  useTenant: () => useTenantMock(),
}));

const useProgressContextMock = vi.fn();
vi.mock("./ProgressProvider", () => ({
  useProgressContext: () => useProgressContextMock(),
}));

const petMock = vi.fn();
vi.mock("./Pet", () => ({
  Pet: (props: unknown) => {
    petMock(props);
    return <div data-testid="pet-mock" />;
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  useProgressContextMock.mockReturnValue({
    completedCount: 10,
    streak: 3,
    completed: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    currentDay: 11,
  });
});

describe("ProgressCompanion", () => {
  it("renders Pet when the tenant has the mascot enabled", () => {
    useTenantMock.mockReturnValue({ mascotEnabled: true });
    render(<ProgressCompanion equipped={EMPTY_EQUIPPED} name="Shelby" />);
    expect(petMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("pet-mock")).toBeInTheDocument();
  });

  it("renders the clinical progress view (and never calls Pet) when the mascot is disabled", () => {
    useTenantMock.mockReturnValue({ mascotEnabled: false });
    render(<ProgressCompanion equipped={EMPTY_EQUIPPED} name="Shelby" />);
    expect(petMock).not.toHaveBeenCalled();
    expect(screen.getByText("day streak")).toBeInTheDocument();
    expect(screen.getByText("adherence")).toBeInTheDocument();
  });

  it("computes weekly completion from the trailing 7-day window", () => {
    useTenantMock.mockReturnValue({ mascotEnabled: false });
    useProgressContextMock.mockReturnValue({
      completedCount: 5,
      streak: 2,
      completed: [1, 3, 5, 7, 9],
      currentDay: 9,
    });
    render(<ProgressCompanion equipped={EMPTY_EQUIPPED} />);
    // window is days 3..9 (7 days): completed days in range = 3,5,7,9 = 4
    expect(screen.getByText("4/7")).toBeInTheDocument();
  });

  it("computes adherence as a percentage of the 30-day program", () => {
    useTenantMock.mockReturnValue({ mascotEnabled: false });
    useProgressContextMock.mockReturnValue({
      completedCount: 15,
      streak: 1,
      completed: [],
      currentDay: 1,
    });
    render(<ProgressCompanion equipped={EMPTY_EQUIPPED} />);
    expect(screen.getByText("50%")).toBeInTheDocument();
  });
});
