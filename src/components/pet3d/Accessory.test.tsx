import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor, screen } from "@testing-library/react";
import { Accessory, buildAccessorySlots } from "./Accessory";
import { EMPTY_EQUIPPED, ITEMS, SOCKET_FOR_SLOT, type Slot } from "@/lib/rewards";

// Stand in for the real drei-backed loader — this test is about which
// branch Accessory picks, not about actually parsing a .glb (jsdom has
// no WebGL, so a real load is meaningless here).
vi.mock("./GltfAccessory", () => ({
  GltfAccessory: ({ itemId }: { itemId: string }) => (
    <div data-testid="gltf-accessory" data-item={itemId} />
  ),
}));

function stubFetch(ok: boolean) {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok, status: ok ? 200 : 404 }));
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 404 }));
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Accessory — GLB vs procedural switch", () => {
  it("renders the procedural primitive when no cosmetic .glb exists", async () => {
    stubFetch(false);
    const { container } = render(<Accessory itemId="crown" />);
    await waitFor(() => {
      expect(container.querySelector("mesh")).toBeTruthy();
    });
    expect(screen.queryByTestId("gltf-accessory")).not.toBeInTheDocument();
  });

  it("activates the real .glb with zero code changes once the file exists", async () => {
    stubFetch(true);
    render(<Accessory itemId="crown" />);
    const loaded = await screen.findByTestId("gltf-accessory");
    expect(loaded).toHaveAttribute("data-item", "crown");
  });

  it("probes the documented cosmetics path for the item id", async () => {
    stubFetch(true);
    render(<Accessory itemId="bandana" />);
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/models/cosmetics/bandana.glb", {
        method: "HEAD",
      });
    });
  });

  it("falls back to the procedural mesh when the probe itself rejects", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const { container } = render(<Accessory itemId="medal" />);
    await waitFor(() => {
      expect(container.querySelector("mesh")).toBeTruthy();
    });
    expect(screen.queryByTestId("gltf-accessory")).not.toBeInTheDocument();
  });

  it("renders something for every wearable catalog item, with or without a model", async () => {
    stubFetch(false);
    for (const item of ITEMS.filter((i) => SOCKET_FOR_SLOT[i.slot])) {
      const { container, unmount } = render(<Accessory itemId={item.id} />);
      await waitFor(() => {
        expect(
          container.querySelector("mesh") ?? container.querySelector("group")
        ).toBeTruthy();
      });
      unmount();
    }
  });
});

describe("buildAccessorySlots", () => {
  it("maps each equipped wearable onto its socket", () => {
    const slots = buildAccessorySlots({
      ...EMPTY_EQUIPPED,
      hat: "crown",
      face: "glasses",
      neck: "bandana",
      chest: "medal",
    });
    expect(Object.keys(slots).sort()).toEqual(["chest", "face", "head", "neck"]);
  });

  it("ignores backdrops — they are scene art, not body attachments", () => {
    const slots = buildAccessorySlots({ ...EMPTY_EQUIPPED, bg: "meadow" });
    expect(Object.keys(slots)).toHaveLength(0);
  });

  it("omits sockets with nothing equipped", () => {
    const slots = buildAccessorySlots({ ...EMPTY_EQUIPPED, hat: "crown" });
    expect(Object.keys(slots)).toEqual(["head"]);
  });

  it("covers every wearable slot in the catalog", () => {
    const wearableSlots = [...new Set(ITEMS.map((i) => i.slot))].filter(
      (s) => SOCKET_FOR_SLOT[s as Slot]
    );
    const equipped = { ...EMPTY_EQUIPPED };
    for (const slot of wearableSlots) {
      const item = ITEMS.find((i) => i.slot === slot)!;
      equipped[slot as Slot] = item.id;
    }
    expect(Object.keys(buildAccessorySlots(equipped))).toHaveLength(wearableSlots.length);
  });
});
