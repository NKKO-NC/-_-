const CACHE_VERSION = "20260617b";
const CACHE_NAME = `kalah-pwa-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=20260617b",
  "./script.js?v=20260617b",
  "./core/object-model.js?v=20260617b",
  "./core/object-physics.js?v=20260617b",
  "./core/object-pack-manifest.js?v=20260617b",
  "./object-packs/crystal.js?v=20260617b",
  "./dialoguePicker.js?v=20260617b",
  "./dialogueBank.js?v=20260617b",
  "./coin/index.js?v=20260617b",
  "./coin/coin-toss-scene.js?v=20260617b",
  "./vendor/three/build/three.module.js?v=20260617b",
  "./vendor/three/build/three.core.js",
  "./assets/ruby-gem.png?v=20260617b",
  "./assets/amethyst-gem.png?v=20260617b",
  "./assets/Coin.png?v=20260617b",
  "./assets/Dragon.png?v=20260617b",
  "./assets/Shield.png?v=20260617b",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png"
];

async function addAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll(APP_SHELL);
}

self.addEventListener("install", (event) => {
  event.waitUntil(addAppShell().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await cache.match(request)) || cache.match("./index.html");
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});
