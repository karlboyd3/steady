import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { lazy, type ComponentType } from "react";

// lottie-web touches canvas at module-import time, which jsdom doesn't
// implement — stub lottie-react globally so any component that imports
// ExerciseAnimation doesn't crash in tests. Real Lottie playback only
// matters in the browser, where canvas is real.
vi.mock("lottie-react", () => ({
  useLottie: () => ({ View: null, play: () => {}, pause: () => {} }),
}));

// next/dynamic's LoadableComponent relies on Next's own webpack chunk-
// loading manifest, which doesn't exist under Vite/Vitest — it renders
// null forever instead of resolving. Swap it for a plain React.lazy,
// which Suspense handles correctly in jsdom. (This is why any assertion
// that crosses a dynamic()-loaded boundary in tests needs an async
// findBy* with a generous timeout — the underlying dynamic import() is
// a real, uncached module transform the first time it runs.)
vi.mock("next/dynamic", () => ({
  default: (loader: () => Promise<{ default: ComponentType<unknown> }>) => lazy(loader),
}));

// react-three-fiber intrinsics (<mesh>, <torusGeometry>, …) are only
// meaningful inside <Canvas>, where r3f's own reconciler handles them.
// Rendering them under jsdom to assert on branch/prop wiring is
// intentional, but React DOM logs an "unrecognized tag" / "incorrect
// casing" warning for each one, which drowns out real errors. Filter
// exactly those two messages and let everything else through.
const R3F_TAG_WARNING = /(is unrecognized in this browser|is using incorrect casing)/;
const realConsoleError = console.error;
console.error = (...args: unknown[]) => {
  if (typeof args[0] === "string" && R3F_TAG_WARNING.test(args[0])) return;
  realConsoleError(...args);
};
