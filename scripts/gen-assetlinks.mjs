/* Writes public/.well-known/assetlinks.json for the Digital Asset Links
   verification. Pass the signing key's SHA-256 fingerprint:

     node scripts/gen-assetlinks.mjs AA:BB:CC:...:FF

   Get the fingerprint from your keystore:
     keytool -list -v -keystore twa/steady-release.keystore -alias steady
*/
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function readConst(name, fallback) {
  const cfg = await readFile(join(root, "src", "lib", "config.ts"), "utf8");
  const m = cfg.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
  return m ? m[1] : fallback;
}

const fingerprint = process.argv[2];
if (!fingerprint) {
  console.error("Usage: node scripts/gen-assetlinks.mjs <SHA256_FINGERPRINT>");
  process.exit(1);
}
const normalized = fingerprint.trim().toUpperCase();
if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(normalized)) {
  console.error(
    "Fingerprint must be 32 colon-separated hex byte pairs (SHA-256)."
  );
  process.exit(1);
}

const packageName = await readConst("PACKAGE_NAME", "com.bashntech.steady");

const body = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: packageName,
      sha256_cert_fingerprints: [normalized],
    },
  },
];

const outDir = join(root, "public", ".well-known");
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "assetlinks.json"), JSON.stringify(body, null, 2) + "\n");
console.log(`✓ wrote public/.well-known/assetlinks.json for ${packageName}`);
