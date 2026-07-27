# Pet & cosmetic 3D assets

Everything here is **optional**. The app is fully functional with this
directory empty — species render as procedural primitive creatures and
cosmetics as hand-built primitive meshes. Dropping a real file in
activates it with **zero code changes**; deleting it falls back cleanly.

Same probe-then-branch convention as `public/animations/` (Lottie).

## Pet species — `public/models/{speciesId}.glb`

`speciesId` must match an id already in `SPECIES` (`src/lib/rewards.ts`):
`turtle`, `fox`, `dog`, `cat`, `rabbit`, `bear`.

```
public/models/fox.glb     → the fox species renders this instead of primitives
```

**Socket convention.** Name four nodes/bones `head`, `face`, `neck`,
`chest` and equipped cosmetics attach to them automatically. Models
without them fall back to the per-species placeholder anchors in
`src/components/pet3d/species-shapes.ts` (`SOCKET_TRANSFORMS`). To use
different bone names (e.g. a rigged `mixamorig:Head`), set `boneName` on
that species' socket in `SOCKET_TRANSFORMS`.

**Animation convention.** Name clips `idle`, `celebrate_small`,
`celebrate_streak`, `celebrate_big`. A model shipping only `idle` +
`happy` works too — declare it in `SPECIES_CLIP_OVERRIDES`
(`species-shapes.ts`). Any clip that turns out not to exist on the loaded
model falls back to `idle` at runtime, so a wrong guess degrades to a
still pet rather than an error.

## Cosmetics — `public/models/cosmetics/{itemId}.glb`

`itemId` must match an id in `ITEMS` (`src/lib/rewards.ts`). The six
socket-attached items:

| itemId | socket |
|---|---|
| `sweatband` | head |
| `party` | head |
| `crown` | head |
| `glasses` | face |
| `bandana` | neck |
| `medal` | chest |

`meadow` / `beach` / `night` are **scene backdrops**, not body
attachments — they have no socket and no `.glb`; see
`src/components/pet3d/SceneBackdrop.tsx`.

Author cosmetics **at the origin, unrotated, unit scale**. The socket
group already applies the species-specific offset, rotation, and scale,
which is what lets one asset work across all six species.

## Licensing

CC0 or fully owned only. Steady is redistributed to clinics under their
own branding, so no asset may carry a license restricting sublicensing.
