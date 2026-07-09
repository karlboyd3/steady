# Steady — Google Play submission runbook

End-to-end steps to get Steady live on Google Play. Assumes Part A + the web
side of Part B are deployed. **Do the blockers first.**

## 0. Blockers to clear first

1. **Register `getsteady.app`** and add it to the Vercel `steady` project
   (Vercel → Project → Settings → Domains), then verify DNS. Confirm
   `https://getsteady.app/manifest.webmanifest` and
   `https://getsteady.app/.well-known/assetlinks.json` both load.
2. **Build the signed `.aab`** via Bubblewrap and **generate the keystore** —
   see [`twa/README.md`](../twa/README.md). Back the keystore up off-repo.
3. **Fill in `assetlinks.json`** with the real SHA-256 and redeploy:
   `node scripts/gen-assetlinks.mjs <SHA256>` → `vercel deploy --prod` →
   `node scripts/check-assetlinks.mjs` prints ✓.

## 1. Developer account

- Create a **Google Play Developer account** ($25 one-time) at
  <https://play.google.com/console>. Individual or organization; complete
  identity verification (can take a day or two — start early).

## 2. Create the app

- Play Console → **Create app**.
- App name: **Steady** · Default language: English (US) · App · Free.
- Accept the developer program & US export declarations.

## 3. Internal testing track (test before production)

- **Testing → Internal testing → Create release.**
- Upload `app-release-signed.aab`.
- Let Google **opt into Play App Signing** (recommended). If you do, copy the
  **App signing key** SHA-256 from *Setup → App signing* and add it to
  `assetlinks.json` alongside your upload key fingerprint, then redeploy.
- Add your own email as an internal tester; install via the opt-in link and run
  the [device checklist](./device-checklist.md) — especially **no URL bar**.

## 4. Store listing

- **Grow → Store presence → Main store listing.** Use
  [`store-assets/listing.md`](../store-assets/listing.md):
  - App name (30), short description (80), full description (4000).
  - **App icon:** 512×512 (use `public/icons/icon-512.png`).
  - **Feature graphic:** `store-assets/feature-graphic.png` (1024×500).
  - **Phone screenshots:** the six in `store-assets/screenshots/` (1080×2400).
- Category: **Health & Fitness**. Add contact email + privacy policy URL
  (`https://getsteady.app/privacy`).

## 5. Policy & content forms

- **Data safety:** answer from
  [`store-assets/data-safety.md`](../store-assets/data-safety.md) — *no data
  collected or shared*.
- **Content rating:** complete the IARC questionnaire using
  [`store-assets/content-rating.md`](../store-assets/content-rating.md).
- **App content:** ads = No; target audience = adults (not designed for
  children); news app = No; government app = No.
- **Health apps declaration:** Play now shows a Health/Fitness declaration —
  affirm it provides **general fitness/wellness content, not medical advice**,
  matching the /terms wording.

## 6. Promote to production

- Once internal testing passes, **Production → Create release**, promote the
  same `.aab` (or a new build), set the rollout %, and submit for review.
- First review can take a few days.

## Common health-app review snags (avoid these)

- **Medical claims:** the listing must NOT say rehab/therapy/treat/cure/recover
  from injury/physical therapy. Keep it "strength, mobility, guided exercise."
  (The in-app /terms already states general-fitness, not medical advice, and the
  sharp-pain-stop guidance — keep that.)
- **Missing/January-mismatched privacy policy:** the URL must be live and match
  the data-safety answers. Ours: everything on-device, nothing collected.
- **TWA URL bar showing:** = asset-link failure → treated as a broken app.
  Verify with `scripts/check-assetlinks.mjs` and on a real device.
- **Offline error page:** Play rejects TWAs that show Chrome's error page
  offline. Ours serves the app shell / branded `offline.html` (verified).
- **Screenshots not representative / wrong aspect:** use the provided
  1080×2400 phone shots.
- **Data-safety inaccuracy:** don't over-declare; we collect nothing, so keep
  every box "No."
