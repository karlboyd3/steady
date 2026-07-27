/* Defensively checks for WebGL support. Wrapped in try/catch so it
 * degrades safely both in real WebGL-less browsers and under jsdom
 * (which has no canvas backend at all in this project's test setup). */
export function hasWebGL(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}
