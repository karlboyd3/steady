# Steady — Real-device manual test checklist

Run this on **your own phone** on both platforms before shipping. Test the live
site (https://getsteady.app once live, or https://steady-ruby.vercel.app today).

Legend: ☐ = to check.

## iOS — Safari (iPhone)

- ☐ **Install to Home Screen:** Share → *Add to Home Screen*. Icon is the green
  turtle; name reads "Steady".
- ☐ **Launches standalone:** opening from the home-screen icon shows **no Safari
  address bar / toolbar**.
- ☐ **Safe area:** on a notch/Dynamic-Island phone, the top bar and the bottom
  buttons are never under the notch or the home indicator.
- ☐ **Disclaimer** appears on first launch; after "I understand" it doesn't
  reappear on later launches.
- ☐ **Audio:** with the ringer on, start a session — you hear a chime at each
  work/rest transition. (iOS only allows this because the context is primed on
  the Start tap.) Toggle 🔔/🔕 mutes/unmutes.
- ☐ **Screen stays awake:** prop the phone down, start a session, and don't
  touch it. The screen should **not** dim/sleep during the exercise. (Note: iOS
  Wake Lock support is limited on older versions — if it sleeps, that's the
  documented graceful degrade, not a crash.)
- ☐ **No double-tap zoom / tap delay** on the big buttons; taps feel instant.
- ☐ **Exit guard:** mid-session, tap ← Exit → "Leave your session?" appears;
  "Keep going" stays, "Leave session" returns home. Swipe-back gesture also
  triggers the prompt rather than instantly leaving.
- ☐ **Refresh persistence:** finish a day, then fully close and reopen — the day
  shows ✓, streak and coins are retained.
- ☐ **Offline:** turn on Airplane Mode, open the app from the home screen — it
  loads and a session runs (does **not** show a browser error page).

## Android — Chrome

- ☐ **Install prompt / menu:** Chrome ⋮ → *Install app* (or the install banner).
  Installs with the turtle icon.
- ☐ **Launches standalone:** no URL bar; splash screen uses the cream
  background + turtle.
- ☐ **Maskable icon:** the launcher icon isn't awkwardly cropped (turtle sits
  inside the safe circle).
- ☐ **Safe area / gesture nav:** bottom buttons clear the gesture pill.
- ☐ **Audio, wake lock, exit guard, persistence, offline:** same checks as iOS
  above. Android Chrome supports Wake Lock, so the screen must stay awake during
  a running session and be allowed to sleep once paused/finished.
- ☐ **Back button:** the hardware/gesture back during a session shows the
  "Leave your session?" prompt.

## TWA (after the .aab is installed from Play internal testing)

- ☐ App launches **full-screen with no URL bar** (this is the Digital Asset
  Links check — if a URL bar shows, `assetlinks.json` isn't verified).
- ☐ Offline cold-launch shows the app (or the branded offline page), never
  Chrome's dinosaur error.
- ☐ Screen-wake, audio, and a full session all behave as on the web.
