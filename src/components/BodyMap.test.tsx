import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BodyMap, MUSCLE_LABELS } from "./BodyMap";

const highlightColor = "rgb(47, 109, 91)"; // var(--pine) resolved isn't available in jsdom, so pass a literal

describe("BodyMap", () => {
  it("fills only the highlighted muscle group's shapes with the highlight color", () => {
    const { container } = render(
      <BodyMap highlighted={["quads"]} color={highlightColor} />
    );
    const quadShapes = container.querySelectorAll('[data-muscle="quads"]');
    expect(quadShapes.length).toBeGreaterThan(0);
    quadShapes.forEach((el) => {
      expect(el.getAttribute("fill")).toBe(highlightColor);
    });

    const glutesShapes = container.querySelectorAll('[data-muscle="glutes"]');
    expect(glutesShapes.length).toBeGreaterThan(0);
    glutesShapes.forEach((el) => {
      expect(el.getAttribute("fill")).not.toBe(highlightColor);
    });
  });

  it("highlights shapes on both the front and back figures when relevant", () => {
    const { container } = render(
      <BodyMap highlighted={["core", "hamstrings"]} color={highlightColor} />
    );
    const front = container.querySelector('[data-testid="bodymap-front"]');
    const back = container.querySelector('[data-testid="bodymap-back"]');
    expect(front?.querySelector('[data-muscle="core"]')?.getAttribute("fill")).toBe(
      highlightColor
    );
    expect(
      back?.querySelector('[data-muscle="hamstrings"]')?.getAttribute("fill")
    ).toBe(highlightColor);
  });

  it("renders no highlight color anywhere when nothing is highlighted", () => {
    const { container } = render(<BodyMap highlighted={[]} color={highlightColor} />);
    const allMuscleEls = container.querySelectorAll("[data-muscle]");
    expect(allMuscleEls.length).toBeGreaterThan(0);
    allMuscleEls.forEach((el) => {
      expect(el.getAttribute("fill")).not.toBe(highlightColor);
    });
  });

  it("lists the human-readable label for each highlighted group as a chip", () => {
    const { getByText } = render(
      <BodyMap highlighted={["hipAbductors", "lowerBack"]} color={highlightColor} />
    );
    expect(getByText(MUSCLE_LABELS.hipAbductors)).toBeInTheDocument();
    expect(getByText(MUSCLE_LABELS.lowerBack)).toBeInTheDocument();
  });
});
