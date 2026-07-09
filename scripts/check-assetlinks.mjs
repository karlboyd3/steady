/* Post-deploy check: fetch /.well-known/assetlinks.json from the production
   domain and validate its shape. Fails (exit 1) if missing, malformed, wrong
   package, or still holding the placeholder fingerprint.

     node scripts/check-assetlinks.mjs                 # uses PRODUCTION_DOMAIN
     node scripts/check-assetlinks.mjs https://host    # override origin
*/
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function readConst(name, fallback) {
  const cfg = await readFile(join(root, "src", "lib", "config.ts"), "utf8");
  const m = cfg.match(new RegExp(`${name}\\s*=\\s*"([^"]+)"`));
  return m ? m[1] : fallback;
}

const domain = await readConst("PRODUCTION_DOMAIN", "getsteady.app");
const pkg = await readConst("PACKAGE_NAME", "com.bashntech.steady");
const origin = process.argv[2] || `https://${domain}`;
const url = `${origin.replace(/\/$/, "")}/.well-known/assetlinks.json`;

function fail(msg) {
  console.error(`✗ ${msg}`);
  process.exit(1);
}

const res = await fetch(url).catch((e) => fail(`fetch failed: ${e.message}`));
if (!res.ok) fail(`HTTP ${res.status} for ${url}`);
const ct = res.headers.get("content-type") || "";
if (!ct.includes("json"))
  console.warn(`⚠ content-type is "${ct}" (expected application/json)`);

let data;
try {
  data = JSON.parse(await res.text());
} catch {
  fail("response is not valid JSON");
}

if (!Array.isArray(data) || data.length === 0) fail("expected a non-empty array");
const entry = data.find(
  (e) => e?.target?.namespace === "android_app" && e?.target?.package_name === pkg
);
if (!entry) fail(`no android_app entry for package ${pkg}`);
if (!Array.isArray(entry.relation) || !entry.relation.includes("delegate_permission/common.handle_all_urls"))
  fail("missing delegate_permission/common.handle_all_urls relation");
const fps = entry.target.sha256_cert_fingerprints;
if (!Array.isArray(fps) || fps.length === 0) fail("no sha256_cert_fingerprints");
const placeholder = fps.some((f) => /REPLACE|FINGERPRINT/i.test(f));
if (placeholder)
  fail("fingerprint is still a placeholder — run gen-assetlinks.mjs with the real SHA-256");
const bad = fps.find((f) => !/^([0-9A-Fa-f]{2}:){31}[0-9A-Fa-f]{2}$/.test(f));
if (bad) fail(`malformed fingerprint: ${bad}`);

console.log(`✓ assetlinks.json valid at ${url}`);
console.log(`  package: ${pkg}`);
console.log(`  fingerprints: ${fps.length}`);
