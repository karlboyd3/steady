/* Writes public/.well-known/assetlinks.json for the Digital Asset Links
   verification. Pass one or more signing-key SHA-256 fingerprints — you need
   both the local upload-key fingerprint AND the Play App Signing fingerprint
   once you're enrolled in Play App Signing (Google re-signs the app you
   upload, so installed builds carry a different cert than your local key):

     node scripts/gen-assetlinks.mjs AA:BB:...:FF [BB:CC:...:AA ...]

   Get the local fingerprint from your keystore:
     keytool -list -v -keystore twa/steady-release.keystore -alias steady
   Get the Play Signing fingerprint from:
     Play Console → your app → Setup → App signing
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

const fingerprints = process.argv.slice(2);
if (fingerprints.length === 0) {
  console.error(
    "Usage: node scripts/gen-assetlinks.mjs <SHA256_FINGERPRINT> [<SHA256_FINGERPRINT> ...]"
  );
  process.exit(1);
}
const normalized = fingerprints.map((fp) => fp.trim().toUpperCase());
for (const fp of normalized) {
  if (!/^([0-9A-F]{2}:){31}[0-9A-F]{2}$/.test(fp)) {
    console.error(
      `Fingerprint must be 32 colon-separated hex byte pairs (SHA-256): got "${fp}"`
    );
    process.exit(1);
  }
}

const packageName = await readConst("PACKAGE_NAME", "com.bashntech.steady");

const body = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: packageName,
      sha256_cert_fingerprints: normalized,
    },
  },
];

const outDir = join(root, "public", ".well-known");
await mkdir(outDir, { recursive: true });
await writeFile(join(outDir, "assetlinks.json"), JSON.stringify(body, null, 2) + "\n");
console.log(
  `✓ wrote public/.well-known/assetlinks.json for ${packageName} (${normalized.length} fingerprint${normalized.length === 1 ? "" : "s"})`
);
