/* ============================================================
   STEADY — Admin session: signed, expiring cookie value
   ============================================================

   The admin cookie used to hold ADMIN_TOKEN verbatim, which meant the
   raw secret sat in a browser jar and was compared with `===`. Instead
   the cookie now carries `<expiry>.<signature>`, where the signature is
   an HMAC-SHA256 of the expiry keyed by ADMIN_TOKEN. The secret never
   leaves the server, a stolen cookie expires on its own, and every
   comparison is constant-time.

   Everything here is Web Crypto only, so it runs unchanged in the Edge
   middleware runtime, in Node server actions, and under Vitest. */

const encoder = new TextEncoder();

export const ADMIN_COOKIE = "admin_session";

/** Eight hours, matching the cookie's own Max-Age. */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

async function sha256(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value)));
}

/**
 * Constant-time string equality. Both sides are hashed first, so the loop
 * always runs over two fixed-length digests: neither the contents nor the
 * lengths of the inputs are observable from how long this takes.
 */
export async function safeEqual(a: string, b: string): Promise<boolean> {
  const [da, db] = await Promise.all([sha256(a), sha256(b)]);
  let diff = 0;
  for (let i = 0; i < da.length; i++) diff |= da[i] ^ db[i];
  return diff === 0;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return toBase64Url(new Uint8Array(mac));
}

/**
 * Mints a cookie value that proves the holder knew `secret` at login time
 * and says when that proof stops counting. The payload is the absolute
 * expiry in whole seconds; it is signed rather than encrypted, because it
 * is not a secret, it just must not be forgeable.
 */
export async function createAdminSession(secret: string, now: number = Date.now()): Promise<string> {
  const payload = String(Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS);
  return `${payload}.${await sign(payload, secret)}`;
}

/**
 * True only for a well-formed, correctly signed, unexpired cookie value.
 * A missing secret (unconfigured ADMIN_TOKEN) fails closed, which is what
 * locks the admin panel out entirely rather than opening it up.
 *
 * The signature is checked before the expiry is trusted — the expiry is
 * attacker-supplied until the HMAC says otherwise.
 */
export async function verifyAdminSession(
  value: string | undefined,
  secret: string | undefined,
  now: number = Date.now()
): Promise<boolean> {
  if (!secret || !value) return false;

  const separator = value.lastIndexOf(".");
  if (separator <= 0 || separator === value.length - 1) return false;

  const payload = value.slice(0, separator);
  const signature = value.slice(separator + 1);

  if (!/^\d+$/.test(payload)) return false;
  const expiresAt = Number(payload);
  if (!Number.isSafeInteger(expiresAt)) return false;

  if (!(await safeEqual(signature, await sign(payload, secret)))) return false;

  return expiresAt * 1000 > now;
}
