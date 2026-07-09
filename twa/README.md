# Steady — TWA (Trusted Web Activity) build kit

This packages the deployed PWA at **https://getsteady.app** into a signed
Android App Bundle (`.aab`) for Google Play using
[Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap).

- **Package name:** `com.bashntech.steady`
- **Production domain:** `getsteady.app`
- `twa-manifest.json` here is a ready-made reference config. The canonical way
  to (re)generate it is `bubblewrap init` (below), which needs the domain live.

---

## 🔴 KEYSTORE: READ THIS FIRST

The app is signed with **one keystore**. That keystore is the *only* thing that
can publish updates to this exact Play listing.

> **If you lose `steady-release.keystore` or forget its passwords, you can NEVER
> update this app again.** You would have to publish a brand-new listing under a
> new package name and lose all installs, reviews, and ratings.

Rules:

1. Generate it **once** (see step 2).
2. **Back it up outside this repo** — a password manager and/or an encrypted
   cloud vault. Store the keystore password AND the key alias password with it.
3. It is **git-ignored** (`twa/*.keystore`, `twa/android.keystore`,
   `*.jks`) — never commit it.
4. Also save the resulting **SHA-256 fingerprint** (it goes in
   `assetlinks.json`).

> Tip: once uploaded, enable **Play App Signing** so Google also holds a signing
> key — but you still must keep the *upload* keystore safe to push updates.

---

## Prerequisites (one-time)

- Node 18+ (you have Node 24).
- `getsteady.app` **registered and pointed at the Vercel project**, serving the
  live manifest at `https://getsteady.app/manifest.webmanifest`.
  (Bubblewrap fetches this during `init`.)
- Bubblewrap will fetch a JDK 17 + Android SDK command-line tools on first run
  (`bubblewrap doctor` / `bubblewrap init` prompt to install them to
  `~/.bubblewrap`). Accept the prompts. This is a few hundred MB, one time.

Install the CLI:

```bash
npm install -g @bubblewrap/cli
bubblewrap doctor   # installs/validates JDK + Android SDK
```

## Step 1 — (optional) regenerate config from the live manifest

Run from this `twa/` directory. Skip if you're using the provided
`twa-manifest.json`.

```bash
bubblewrap init --manifest=https://getsteady.app/manifest.webmanifest
```

Confirm when prompted: package `com.bashntech.steady`, portrait orientation,
Custom Tabs fallback.

## Step 2 — generate the signing keystore (ONCE)

```bash
# from twa/  — uses the JDK keytool Bubblewrap installed
keytool -genkeypair \
  -alias steady \
  -keystore steady-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -dname "CN=Steady, O=BashNTech, C=US"
```

Choose strong passwords and **save them with the keystore backup**.
`twa-manifest.json` already points `signingKey.path` at `./steady-release.keystore`
and `alias` at `steady`.

## Step 3 — build the signed bundle

```bash
bubblewrap build
```

Output: **`app-release-signed.aab`** (upload this to Play) and
`app-release-signed.apk` (for local device testing).

## Step 4 — wire up Digital Asset Links (removes the URL bar)

Get the SHA-256 fingerprint of the signing cert:

```bash
keytool -list -v -keystore steady-release.keystore -alias steady
# copy the "SHA256:" line value (AA:BB:...:FF)
```

Then, from the **repo root**, write it into the served file and redeploy:

```bash
node scripts/gen-assetlinks.mjs AA:BB:CC:...:FF
vercel deploy --prod --yes
node scripts/check-assetlinks.mjs        # must print ✓
```

Install the APK on a device and confirm the app launches **full-screen with no
browser URL bar**. If a URL bar shows, asset-link verification failed — recheck
the fingerprint and that `assetlinks.json` is live at
`https://getsteady.app/.well-known/assetlinks.json`.

> If you enable **Play App Signing**, also add the **App signing key**
> fingerprint from Play Console → Setup → App signing to `assetlinks.json`
> (you can list multiple fingerprints).

---

## Future releases (rebuild command)

1. Bump the version in `twa-manifest.json`: increase `appVersionCode` by 1 and
   set a new `appVersionName` (e.g. `1.0.1`).
2. Rebuild with the **same keystore**:

```bash
bubblewrap build
```

3. Upload the new `app-release-signed.aab` to a Play track.

(`bubblewrap update` can also refresh the Android project scaffolding before a
build after CLI upgrades.)
