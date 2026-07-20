import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { DisclaimerModal } from "./DisclaimerModal";

const usePathnameMock = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

const useProgressContextMock = vi.fn();
vi.mock("./ProgressProvider", () => ({
  useProgressContext: () => useProgressContextMock(),
}));

describe("DisclaimerModal", () => {
  it("renders when hydrated and not yet accepted, outside /admin", () => {
    usePathnameMock.mockReturnValue("/");
    useProgressContextMock.mockReturnValue({
      hydrated: true,
      disclaimerAccepted: false,
      acceptDisclaimer: vi.fn(),
    });
    const { container } = render(<DisclaimerModal />);
    expect(container.querySelector(".modal-scrim")).not.toBeNull();
  });

  it("never renders on /admin routes even if not yet accepted", () => {
    usePathnameMock.mockReturnValue("/admin/login");
    useProgressContextMock.mockReturnValue({
      hydrated: true,
      disclaimerAccepted: false,
      acceptDisclaimer: vi.fn(),
    });
    const { container } = render(<DisclaimerModal />);
    expect(container.querySelector(".modal-scrim")).toBeNull();
  });

  it("doesn't render before hydration", () => {
    usePathnameMock.mockReturnValue("/");
    useProgressContextMock.mockReturnValue({
      hydrated: false,
      disclaimerAccepted: false,
      acceptDisclaimer: vi.fn(),
    });
    const { container } = render(<DisclaimerModal />);
    expect(container.querySelector(".modal-scrim")).toBeNull();
  });

  it("doesn't render once accepted", () => {
    usePathnameMock.mockReturnValue("/");
    useProgressContextMock.mockReturnValue({
      hydrated: true,
      disclaimerAccepted: true,
      acceptDisclaimer: vi.fn(),
    });
    const { container } = render(<DisclaimerModal />);
    expect(container.querySelector(".modal-scrim")).toBeNull();
  });
});
