import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Pet } from "./Pet";
import { EMPTY_EQUIPPED, SPECIES } from "@/lib/rewards";

describe("Pet", () => {
  it.each(SPECIES.map((s) => s.id))("renders %s without throwing", (species) => {
    render(<Pet equipped={EMPTY_EQUIPPED} name="Buddy" species={species} />);
    expect(screen.getByRole("img", { name: new RegExp(`Buddy the ${species}`, "i") })).toBeInTheDocument();
  });

  it("defaults to turtle when no species is given", () => {
    render(<Pet equipped={EMPTY_EQUIPPED} name="Shelby" />);
    expect(screen.getByRole("img", { name: /Shelby the turtle/i })).toBeInTheDocument();
  });

  it("renders wearables regardless of species", () => {
    const { container } = render(
      <Pet
        equipped={{ ...EMPTY_EQUIPPED, hat: "crown", face: "glasses" }}
        name="Foxy"
        species="fox"
      />
    );
    // crown polygon + glasses lenses should be present in the markup
    expect(container.querySelectorAll("polygon").length).toBeGreaterThan(0);
    expect(container.querySelectorAll("circle[fill='rgba(34,51,45,0.85)']").length).toBe(2);
  });
});
