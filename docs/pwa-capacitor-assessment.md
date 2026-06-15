# PWA and Capacitor Assessment

Updated: 2026-06-16

## Summary

This project is a strong PWA and Capacitor candidate because it is already a fully static web game:

- No backend dependency is required for the core game loop.
- Three.js is vendored locally under `vendor/three/`.
- All runtime images are local under `assets/`.
- The app can be served from a GitHub Pages subpath using relative URLs.

The main recommendation is to ship the web/PWA version first, then add Capacitor only when native distribution, store listing, native APIs, or packaged install behavior becomes valuable.

## PWA Work Completed

- Added `manifest.webmanifest` with install metadata, theme/background colors, app scope, start URL, and icons.
- Added `service-worker.js` with app-shell precache and same-origin runtime caching.
- Added generated PWA icons:
  - `assets/icon-192.png`
  - `assets/icon-512.png`
  - `assets/icon-maskable-512.png`
  - `assets/apple-touch-icon.png`
- Registered the service worker from `index.html`.
- Added mobile/PWA meta tags, including theme color and Apple home-screen metadata.
- Updated asset query versions to `20260616e` so the current Pages deployment can refresh cleanly.

## Offline Strategy

The service worker uses:

- Network-first for page navigations, so online users get the newest `index.html`.
- Cache-first for static assets, so images, CSS, JS modules, and local Three.js files work offline after first load.
- A versioned cache name, so future releases can invalidate older offline bundles.

This is enough for the current static game. If future features add saved campaigns, cloud sync, analytics, leaderboards, or remote asset downloads, the caching strategy should be revisited.

## Mobile UI Polish

Changes focused on installable/mobile use:

- Fixed corrupted visible Chinese text in rules/settings surfaces.
- Rewrote AI dialogue copy into readable Traditional Chinese while preserving the existing dialogue key structure.
- Added safe-area-aware padding for notches and standalone PWA display.
- Tightened small-screen board sizing around 420px and below.
- Improved header action layout so icon buttons and the return button do not crowd each other.
- Made modal cards scroll within the viewport on short mobile screens.

## Capacitor Readiness

Capacitor is a good next step if the target is App Store / Google Play distribution or a native-feeling installed app. According to the official Capacitor workflow, the native app consumes built web assets and syncs them into iOS/Android projects with `npx cap sync`; the config also needs a stable `appId`, `appName`, and `webDir`.

Recommended future setup:

```ts
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.example.kalah",
  appName: "Kalah 播棋",
  webDir: ".",
  backgroundColor: "#050505",
};

export default config;
```

Notes before committing to Capacitor:

- This repo has no build step, so `webDir: "."` can work, but a later bundler/Vite migration would make native packaging cleaner.
- Service worker is primarily a web/PWA concern. A Capacitor app bundles local assets into the native app, so offline availability should come from the packaged files first.
- Native app icons/splash assets should be generated separately from the PWA icons.
- If the game later needs persistent saves, prefer designing a storage abstraction before adding Capacitor plugins.
- If orientation should be locked, decide after real-device testing; the current web UI is better left flexible.

## References

- [Capacitor: Building Progressive Web Apps](https://capacitorjs.com/docs/web/progressive-web-apps)
- [Capacitor: Development Workflow](https://capacitorjs.com/docs/basics/workflow)
- [Capacitor: Configuration](https://capacitorjs.com/docs/config)
- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Manifest)
