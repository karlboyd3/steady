import { describe, it, expect } from "vitest";
import {
  createAdminSession,
  verifyAdminSession,
  safeEqual,
  SESSION_MAX_AGE_SECONDS,
} from "./admin-session";

const SECRET = "a-long-random-admin-token";

describe("safeEqual", () => {
  it("is true for identical strings", async () => {
    await expect(safeEqual("abc", "abc")).resolves.toBe(true);
  });

  it("is false for different strings of the same length", async () => {
    await expect(safeEqual("abc", "abd")).resolves.toBe(false);
  });

  it("is false for different strings of different lengths", async () => {
    await expect(safeEqual("abc", "abcdef")).resolves.toBe(false);
  });

  it("is true for two empty strings", async () => {
    await expect(safeEqual("", "")).resolves.toBe(true);
  });
});

describe("createAdminSession", () => {
  it("never embeds the secret in the cookie value", async () => {
    const session = await createAdminSession(SECRET);
    expect(session).not.toContain(SECRET);
  });

  it("encodes the absolute expiry as the payload", async () => {
    const now = 1_700_000_000_000;
    const [payload] = (await createAdminSession(SECRET, now)).split(".");
    expect(Number(payload)).toBe(Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS);
  });

  it("produces different values for different secrets", async () => {
    const now = 1_700_000_000_000;
    const a = await createAdminSession(SECRET, now);
    const b = await createAdminSession("a-different-token", now);
    expect(a).not.toBe(b);
  });

  it("produces a url-safe signature", async () => {
    const [, signature] = (await createAdminSession(SECRET)).split(".");
    expect(signature).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("verifyAdminSession", () => {
  it("accepts a freshly minted session", async () => {
    const session = await createAdminSession(SECRET);
    await expect(verifyAdminSession(session, SECRET)).resolves.toBe(true);
  });

  it("rejects a session signed with a different secret", async () => {
    const session = await createAdminSession("some-other-token");
    await expect(verifyAdminSession(session, SECRET)).resolves.toBe(false);
  });

  it("rejects a tampered expiry even when the signature is a real one", async () => {
    const now = 1_700_000_000_000;
    const [, signature] = (await createAdminSession(SECRET, now)).split(".");
    const extended = `${Math.floor(now / 1000) + SESSION_MAX_AGE_SECONDS * 100}.${signature}`;
    await expect(verifyAdminSession(extended, SECRET, now)).resolves.toBe(false);
  });

  it("rejects a tampered signature", async () => {
    const session = await createAdminSession(SECRET);
    const [payload, signature] = session.split(".");
    const flipped = signature[0] === "A" ? `B${signature.slice(1)}` : `A${signature.slice(1)}`;
    await expect(verifyAdminSession(`${payload}.${flipped}`, SECRET)).resolves.toBe(false);
  });

  it("rejects an expired session", async () => {
    const issuedAt = 1_700_000_000_000;
    const session = await createAdminSession(SECRET, issuedAt);
    const afterExpiry = issuedAt + (SESSION_MAX_AGE_SECONDS + 1) * 1000;
    await expect(verifyAdminSession(session, SECRET, afterExpiry)).resolves.toBe(false);
  });

  it("accepts a session one second before it expires", async () => {
    const issuedAt = 1_700_000_000_000;
    const session = await createAdminSession(SECRET, issuedAt);
    const justBefore = issuedAt + (SESSION_MAX_AGE_SECONDS - 1) * 1000;
    await expect(verifyAdminSession(session, SECRET, justBefore)).resolves.toBe(true);
  });

  it("rejects everything when the secret is missing", async () => {
    const session = await createAdminSession(SECRET);
    await expect(verifyAdminSession(session, undefined)).resolves.toBe(false);
    await expect(verifyAdminSession(session, "")).resolves.toBe(false);
  });

  it("rejects an absent cookie value", async () => {
    await expect(verifyAdminSession(undefined, SECRET)).resolves.toBe(false);
    await expect(verifyAdminSession("", SECRET)).resolves.toBe(false);
  });

  it("rejects the raw secret, which the pre-signing scheme used to accept", async () => {
    await expect(verifyAdminSession(SECRET, SECRET)).resolves.toBe(false);
  });

  it.each([
    ["no separator", "abcdef"],
    ["empty payload", ".abcdef"],
    ["empty signature", "1700000000."],
    ["non-numeric payload", "not-a-number.abcdef"],
    ["negative expiry", "-1700000000.abcdef"],
    ["float expiry", "1700000000.5.abcdef"],
  ])("rejects a malformed cookie (%s)", async (_label, value) => {
    await expect(verifyAdminSession(value, SECRET)).resolves.toBe(false);
  });
});
