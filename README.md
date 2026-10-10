# Unplugged

A private, offline-first tracker for breaking a habit. One honest check-in a day, with tools for the moments that are hard. Everything stays on your device: no accounts, no servers, no analytics.

**Live app:** https://yyoaavv.github.io/Unplugged/

## Features

- **Daily check-in:** log each day as clean or slipped, fix past days from the calendar, or fill in a whole range at once.
- **Slip journal:** when you log a slip, an optional 2-second survey asks about the trigger (Stress, Boredom, Fatigue, Loneliness, Late at night, Peer pressure, Low mood), where you were, and when. Skip it any time, or add details later.
- **Pattern insights:** the Stats tab turns your tags into plain-language insights, such as your most common trigger, setting and time of day.
- **Urge wins:** tap "I rode out an urge" (on the Tracker tab or from the help panel) to log urges you felt and didn't act on. Wins show up in Stats and unlock achievements.
- **Urge strength:** optionally rate an urge from 1 to 10 when it hits and again after you ride it out. Stats shows how much your urges fade on average.
- **Recovery plan:** after a slip, a short kind check-in asks what you'll do differently and what your plan is for tomorrow. The plan is shown to you the next day.
- **Move to a new phone:** show a QR code (or copy a link) that carries your whole backup. Scan it on the new phone, open the link and tap Import.
- **Share your progress:** make a read-only snapshot link or QR code for someone you trust, such as an accountability partner. It shows streaks and which days were clean or slipped, and never your reasons, triggers or notes.
- **Urge support:** the "I need help now" panel offers guided breathing, a ride-it-out timer, ideas to change the scene, and your own reasons.
- **Breathing styles:** Calm, Box, 4-7-8, Long exhale and Double inhale, with an optional soft vibration and sound for each breath.
- **Your own timer:** pick 5, 10, 15 or 20 minutes, or any length from 1 to 120.
- **Works for any habit:** choose what you're working on (anything, porn, smoking or vaping, alcohol, gambling, social media or gaming) and the suggested reasons and tips match it.
- **Your reasons:** pick built-in reasons or write your own; one is shown back to you when an urge hits.
- **Streaks and achievements:** current and best streak, milestones from day one to a full year, and extra badges, with a short celebration at each streak milestone.
- **Daily reminder:** pick a time and get a nudge to check in. In the browser it shows while the app is open; the Android app can remind you in the background.
- **App lock:** protect the app with a 4 to 8 digit PIN, locking right away or after 1 or 5 minutes. It's a privacy screen, not encryption.
- **Stats:** last 30 days, weekday breakdown, six-month trend and a year heatmap.
- **Themes:** nine themes plus a custom one, each with light and dark mode.
- **Backup:** export and import your data as a JSON file.
- **Installable PWA and Android app:** add it to your home screen for a full-screen app that works offline, or build an APK (see below).

## Privacy

All data is stored in your browser's `localStorage`. Nothing is sent anywhere.

Transfer and share links keep the data inside the part of the address after the `#`, which browsers never send to any server. The data is compressed into the link itself, so anyone who has a transfer link or QR code can read your whole log. Treat it like a password and don't post it. The only network request is the optional Google Font; the service worker caches it, and the app falls back to system fonts without it.

Clearing your browser data erases your log, so use **Settings > Export backup** regularly. Backups and transfer links never include your PIN.

## Run it

It's plain HTML, CSS and JavaScript with no build step.

**Locally:** open `index.html` in a browser. The service worker and install option need `https` or `localhost`, so for those run a local server:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

**GitHub Pages:**

1. Push all the files to your repository.
2. Go to **Settings > Pages**, choose your branch and the root folder, and save.
3. Open the `https://<username>.github.io/<repo>/` link, then use your browser's Install or Add to Home Screen option.

## Files

| File | Purpose |
| --- | --- |
| `index.html` | The whole app |
| `manifest.json` | PWA name, colors and icons |
| `sw.js` | Service worker for offline use |
| `favicon.svg` | Browser tab icon (adapts to light and dark mode) |
| `icon.svg`, `icon-maskable.svg` | App icons (SVG) used when installing the app |
| `apple-touch-icon.png` | iPhone and iPad home screen icon (iOS needs PNG) |
| `package.json`, `capacitor.config.json` | Settings for building the Android app |
| `assets/` | PNG icon sources used to make the Android app icons |
| `.github/workflows/build-apk.yml` | Builds the APK in GitHub Actions |

## Build the Android app (APK)

The repository includes a GitHub Actions workflow that builds an APK for you, with no tools to install.

1. Push the files to GitHub (including `.github/`, `package.json`, `capacitor.config.json` and `assets/`).
2. Open the **Actions** tab. **Build Android APK** runs on every push, or press **Run workflow**. It takes about 5 minutes.
3. Open the finished run and download **Unplugged-APK** at the bottom. Unzip it to get `app-debug.apk`.
4. Send the APK to your phone, open it, and allow installing from unknown sources.

`app-debug.apk` is for your own devices. Publishing on Google Play needs a signed release build. Change `appId` in `capacitor.config.json` before publishing.

## Updating

After changing any file, bump the `CACHE` version at the top of `sw.js` (for example `unplugged-v9`) so installed copies pick up the new version and clean out the old cache. A push also builds a fresh APK.

## Disclaimer

Unplugged is a self-help tool, not medical or mental health care. If you're struggling, consider talking to a doctor, therapist or someone you trust.
