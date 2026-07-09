/* Generates Steady's PWA icons (turtle mark) as PNGs via sharp. */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "icons");

// A simple turtle centered in a 200x200 box. `inset` shrinks the turtle for
// maskable icons so it stays inside the platform's safe zone.
function turtle(inset = 0) {
  const bg = "#245446"; // pine-deep
  const shell = "#EFF4F1";
  const shellDark = "#C9DBD2";
  const head = "#8CBE8F";
  const t = `translate(100 100) scale(${1 - inset}) translate(-100 -100)`;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect width="200" height="200" rx="44" fill="${bg}"/>
  <g transform="${t}">
    <ellipse cx="94" cy="118" rx="14" ry="10" fill="${shell}"/>
    <ellipse cx="140" cy="118" rx="14" ry="10" fill="${shell}"/>
    <ellipse cx="100" cy="98" rx="52" ry="40" fill="${shell}" stroke="${shellDark}" stroke-width="5"/>
    <circle cx="82" cy="90" r="10" fill="${shellDark}"/>
    <circle cx="112" cy="80" r="10" fill="${shellDark}"/>
    <circle cx="116" cy="106" r="9" fill="${shellDark}"/>
    <circle cx="158" cy="86" r="18" fill="${head}"/>
    <circle cx="164" cy="82" r="3.4" fill="#22332D"/>
  </g>
</svg>`;
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const jobs = [
    ["icon-192.png", 192, turtle(0)],
    ["icon-512.png", 512, turtle(0)],
    ["icon-192-maskable.png", 192, turtle(0.2)],
    ["icon-512-maskable.png", 512, turtle(0.2)],
  ];
  for (const [name, size, svg] of jobs) {
    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(join(outDir, name));
    console.log("wrote", name);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
