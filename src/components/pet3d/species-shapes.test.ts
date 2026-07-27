import { describe, it, expect } from "vitest";
import { SOCKET_TRANSFORMS, SPECIES_CLIP_OVERRIDES, CREATURES } from "./species-shapes";
import { SPECIES, SOCKET_FOR_SLOT, ITEMS, type Socket, type Species } from "@/lib/rewards";

const SPECIES_IDS = SPECIES.map((s) => s.id);
const SOCKETS: Socket[] = ["head", "face", "neck", "chest"];

describe("SOCKET_TRANSFORMS", () => {
  it("defines all 4 sockets for every species", () => {
    for (const species of SPECIES_IDS) {
      expect(Object.keys(SOCKET_TRANSFORMS[species]).sort()).toEqual([...SOCKETS].sort());
    }
  });

  it("defaults every boneName to the socket's own name (the drop-in convention)", () => {
    for (const species of SPECIES_IDS) {
      for (const socket of SOCKETS) {
        expect(SOCKET_TRANSFORMS[species][socket].boneName).toBe(socket);
      }
    }
  });

  it("gives every socket a complete, well-formed transform", () => {
    for (const species of SPECIES_IDS) {
      for (const socket of SOCKETS) {
        const t = SOCKET_TRANSFORMS[species][socket];
        expect(t.offset).toHaveLength(3);
        expect(t.rotation).toHaveLength(3);
        expect(t.offset.every(Number.isFinite)).toBe(true);
        expect(t.rotation.every(Number.isFinite)).toBe(true);
        expect(t.scale).toBeGreaterThan(0);
      }
    }
  });

  it("scales head/face accessories with the species' head size", () => {
    for (const species of SPECIES_IDS) {
      const { headScale } = CREATURES[species];
      expect(SOCKET_TRANSFORMS[species].head.scale).toBe(headScale);
      expect(SOCKET_TRANSFORMS[species].face.scale).toBe(headScale);
      // body-mounted sockets are not head-scaled
      expect(SOCKET_TRANSFORMS[species].neck.scale).toBe(1);
      expect(SOCKET_TRANSFORMS[species].chest.scale).toBe(1);
    }
  });

  it("puts the face socket in front of the head socket on every species", () => {
    // z is depth; the face anchor must sit forward of the head anchor or
    // glasses would render inside the skull.
    for (const species of SPECIES_IDS) {
      const { head, face } = SOCKET_TRANSFORMS[species];
      expect(face.offset[2]).toBeGreaterThan(head.offset[2]);
    }
  });

  it("orders body sockets vertically: head above neck above chest", () => {
    for (const species of SPECIES_IDS) {
      const s = SOCKET_TRANSFORMS[species];
      expect(s.head.offset[1]).toBeGreaterThan(s.neck.offset[1]);
      expect(s.neck.offset[1]).toBeGreaterThan(s.chest.offset[1]);
    }
  });

  it("distinguishes species — socket tables are not all identical", () => {
    const headOffsets = SPECIES_IDS.map((s) => SOCKET_TRANSFORMS[s].head.offset.join(","));
    expect(new Set(headOffsets).size).toBeGreaterThan(1);
  });
});

describe("SPECIES_CLIP_OVERRIDES", () => {
  it("is empty today — no real .glb assets ship yet, so all species use the shared convention", () => {
    expect(Object.keys(SPECIES_CLIP_OVERRIDES)).toHaveLength(0);
  });

  it("only ever keys off real species ids", () => {
    for (const key of Object.keys(SPECIES_CLIP_OVERRIDES)) {
      expect(SPECIES_IDS).toContain(key as Species);
    }
  });
});

describe("cosmetic slot classification (Step 0 audit)", () => {
  it("classifies all 9 catalog items as either socket-attached or backdrop", () => {
    const socketed = ITEMS.filter((i) => SOCKET_FOR_SLOT[i.slot] !== undefined);
    const backdrops = ITEMS.filter((i) => i.slot === "bg");
    expect(ITEMS).toHaveLength(9);
    expect(socketed).toHaveLength(6);
    expect(backdrops).toHaveLength(3);
    expect(socketed.length + backdrops.length).toBe(ITEMS.length);
  });

  it("maps every wearable to a socket that exists on every species", () => {
    for (const item of ITEMS) {
      const socket = SOCKET_FOR_SLOT[item.slot];
      if (!socket) continue;
      for (const species of SPECIES_IDS) {
        expect(SOCKET_TRANSFORMS[species][socket]).toBeDefined();
      }
    }
  });

  it("has no turtle-only / legacy items — the shell is body geometry, never a catalog item", () => {
    const legacy = ITEMS.filter(
      (i) => SOCKET_FOR_SLOT[i.slot] === undefined && i.slot !== "bg"
    );
    expect(legacy).toEqual([]);
  });

  it("keeps the Gold Medal on the chest socket", () => {
    const medal = ITEMS.find((i) => i.id === "medal");
    expect(medal?.slot).toBe("chest");
    expect(SOCKET_FOR_SLOT.chest).toBe("chest");
  });
});
