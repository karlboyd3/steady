/* Generates the Google Play feature graphic (1024x500) into store-assets/.
   Pine background + turtle mark + wordmark. Run: node scripts/gen-feature-graphic.mjs */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const outDir = join(dirname(fileURLToPath(import.meta.url)), "..", "store-assets");

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="500" viewBox="0 0 1024 500">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#245446"/>
      <stop offset="1" stop-color="#2F6D5B"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="500" fill="url(#bg)"/>

  <!-- soft decorative rings -->
  <circle cx="150" cy="250" r="230" fill="#ffffff" opacity="0.04"/>
  <circle cx="150" cy="250" r="170" fill="#ffffff" opacity="0.04"/>

  <!-- turtle mark -->
  <g transform="translate(60 150) scale(1.25)">
    <ellipse cx="66" cy="128" rx="12" ry="9" fill="#7FB58A"/>
    <ellipse cx="128" cy="128" rx="12" ry="9" fill="#7FB58A"/>
    <polygon points="42,104 28,110 44,114" fill="#7FB58A"/>
    <ellipse cx="98" cy="92" rx="54" ry="40" fill="#EFF4F1" stroke="#C9DBD2" stroke-width="4"/>
    <circle cx="80" cy="84" r="10" fill="#C9DBD2"/>
    <circle cx="108" cy="74" r="10" fill="#C9DBD2"/>
    <circle cx="112" cy="100" r="9" fill="#C9DBD2"/>
    <circle cx="160" cy="80" r="18" fill="#8CBE8F"/>
    <circle cx="166" cy="76" r="3.4" fill="#22332D"/>
  </g>

  <!-- wordmark + tagline -->
  <text x="470" y="230" font-family="Georgia, 'Times New Roman', serif" font-size="118" font-weight="700" fill="#FFFFFF" letter-spacing="-2">Steady</text>
  <text x="474" y="292" font-family="Arial, Helvetica, sans-serif" font-size="34" fill="#DDEBE5">Strength &amp; mobility for your knees</text>
  <rect x="474" y="330" width="330" height="52" rx="26" fill="#E09A32"/>
  <text x="503" y="365" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#3A2A0E">30-day guided program</text>
</svg>`;

await mkdir(outDir, { recursive: true });
await sharp(Buffer.from(svg)).png().toFile(join(outDir, "feature-graphic.png"));
console.log("wrote store-assets/feature-graphic.png (1024x500)");
