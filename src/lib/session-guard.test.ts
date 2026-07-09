import { describe, it, expect } from "vitest";
import { guardReducer, guardInitial } from "./session-guard";

describe("guardReducer", () => {
  it("exit request during a running session pauses and asks (does not leave)", () => {
    const r = guardReducer(guardInitial, { type: "EXIT_REQUEST" }, true);
    expect(r.leave).toBe(false);
    expect(r.pause).toBe(true);
    expect(r.state.asking).toBe(true);
  });

  it("exit request when not running leaves immediately", () => {
    const r = guardReducer(guardInitial, { type: "EXIT_REQUEST" }, false);
    expect(r.leave).toBe(true);
    expect(r.pause).toBe(false);
    expect(r.state.asking).toBe(false);
  });

  it("cancel dismisses the prompt and stays", () => {
    const r = guardReducer({ asking: true }, { type: "CANCEL" }, true);
    expect(r.leave).toBe(false);
    expect(r.pause).toBe(false);
    expect(r.state.asking).toBe(false);
  });

  it("confirm leaves and closes the prompt", () => {
    const r = guardReducer({ asking: true }, { type: "CONFIRM" }, true);
    expect(r.leave).toBe(true);
    expect(r.state.asking).toBe(false);
  });
});
