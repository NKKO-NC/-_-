const CACHE_VERSION = "20260619b";
const CACHE_NAME = `kalah-pwa-${CACHE_VERSION}`;

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./styles.css?v=20260619b",
  "./script.js?v=20260619b",
  "./core/object-model.js?v=20260619a",
  "./core/object-physics.js?v=20260619a",
  "./core/object-pack-manifest.js?v=20260619a",
  "./core/object-pack-runtime.js?v=20260619a",
  "./core/visual-pack-runtime.js?v=20260619a",
  "./game/ai.js?v=20260619a",
  "./ui/copy.js?v=20260619b",
  "./ui/dom.js?v=20260619b",
  "./ui/rule-demo-data.js?v=20260619a",
  "./sound/sound-pack-runtime.js?v=20260619b",
  "./object-packs/crystal.js?v=20260619b",
  "./dialoguePicker.js?v=20260619a",
  "./dialogueBank.js?v=20260619a",
  "./coin/index.js?v=20260619a",
  "./coin/coin-toss-scene.js?v=20260619a",
  "./vendor/three/build/three.module.js?v=20260619a",
  "./vendor/three/build/three.core.js",
  "./assets/ruby-gem.png?v=20260619a",
  "./assets/amethyst-gem.png?v=20260619a",
  "./assets/Coin.png?v=20260619a",
  "./assets/Dragon.png?v=20260619a",
  "./assets/Shield.png?v=20260619a",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png"
];

const VISUAL_PACK_ASSETS = [
  "./visual-packs/crystal-childhood/manifest.json",
  "./visual-packs/crystal-childhood/assets/background-landscape-idle.png",
  "./visual-packs/crystal-childhood/assets/background-portrait-idle.png",
  "./visual-packs/crystal-childhood/assets/board-landscape-base.png",
  "./visual-packs/crystal-childhood/assets/board-landscape-rim-overlay.png",
  "./visual-packs/crystal-childhood/assets/board-landscape-shadow.png",
  "./visual-packs/crystal-childhood/assets/board-landscape-slot-mask.png",
  "./visual-packs/crystal-childhood/assets/board-portrait-base.png",
  "./visual-packs/crystal-childhood/assets/board-portrait-rim-overlay.png",
  "./visual-packs/crystal-childhood/assets/board-portrait-shadow.png",
  "./visual-packs/crystal-childhood/assets/board-portrait-slot-mask.png",
  "./visual-packs/crystal-childhood/assets/pit-well-albedo.png",
  "./visual-packs/crystal-childhood/assets/pit-well-normal.png",
  "./visual-packs/crystal-childhood/assets/pit-well-roughness.png",
  "./visual-packs/crystal-childhood/assets/store-well-landscape-albedo.png",
  "./visual-packs/crystal-childhood/assets/store-well-portrait-albedo.png",
  "./visual-packs/crystal-childhood/assets/store-well-normal.png",
  "./visual-packs/crystal-childhood/assets/store-well-roughness.png",
  "./visual-packs/crystal-childhood/assets/ui-button-primary-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-button-secondary-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-dialogue-panel-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-icon-frame.png",
  "./visual-packs/crystal-childhood/assets/ui-modal-panel-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-result-panel-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-score-panel-9slice.png",
  "./visual-packs/crystal-childhood/assets/ui-turn-badge.png",
  "./visual-packs/crystal-childhood/assets/hint-ring-red.png",
  "./visual-packs/crystal-childhood/assets/hint-ring-purple.png",
  "./visual-packs/crystal-childhood/assets/hint-ring-landing.png",
  "./visual-packs/crystal-childhood/assets/particle-ruby-01.png",
  "./visual-packs/crystal-childhood/assets/particle-ruby-02.png",
  "./visual-packs/crystal-childhood/assets/particle-ruby-03.png",
  "./visual-packs/crystal-childhood/assets/particle-ruby-04.png",
  "./visual-packs/crystal-childhood/assets/particle-ruby-05.png",
  "./visual-packs/crystal-childhood/assets/particle-amethyst-01.png",
  "./visual-packs/crystal-childhood/assets/particle-amethyst-02.png",
  "./visual-packs/crystal-childhood/assets/particle-amethyst-03.png",
  "./visual-packs/crystal-childhood/assets/particle-amethyst-04.png",
  "./visual-packs/crystal-childhood/assets/particle-amethyst-05.png",
  "./visual-packs/crystal-childhood/assets/particle-gold-01.png",
  "./visual-packs/crystal-childhood/assets/particle-gold-02.png",
  "./visual-packs/crystal-childhood/assets/particle-gold-03.png",
  "./visual-packs/crystal-childhood/assets/particle-gold-04.png",
  "./visual-packs/crystal-childhood/assets/particle-gold-05.png"
];

const SOUND_PACK_ASSETS = [
  "./sound-packs/procedural-crystal/manifest.json",
  "./sound-packs/procedural-crystal/audio/bgm-crystal-major-loop.wav",
  "./sound-packs/procedural-crystal/audio/coin-toss-crystal-spin-01.wav",
  "./sound-packs/procedural-crystal/audio/result-defeat-crystal-downbeat-01.wav",
  "./sound-packs/procedural-crystal/audio/result-draw-crystal-chord-01.wav",
  "./sound-packs/procedural-crystal/audio/result-victory-crystal-upbeat-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-capture-crystal-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-collision-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-collision-02.wav",
  "./sound-packs/procedural-crystal/audio/stone-collision-03.wav",
  "./sound-packs/procedural-crystal/audio/stone-drop-pit-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-drop-pit-02.wav",
  "./sound-packs/procedural-crystal/audio/stone-drop-pit-03.wav",
  "./sound-packs/procedural-crystal/audio/stone-drop-store-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-drop-store-02.wav",
  "./sound-packs/procedural-crystal/audio/stone-pickup-01.wav",
  "./sound-packs/procedural-crystal/audio/stone-pickup-02.wav",
  "./sound-packs/procedural-crystal/audio/stone-pickup-03.wav",
  "./sound-packs/procedural-crystal/audio/turn-change-chime-01.wav",
  "./sound-packs/procedural-crystal/audio/turn-extra-crystal-01.wav",
  "./sound-packs/procedural-crystal/audio/ui-button-wood-01.wav",
  "./sound-packs/procedural-crystal/audio/ui-button-wood-02.wav",
  "./sound-packs/procedural-crystal/audio/ui-button-wood-03.wav",
  "./sound-packs/procedural-crystal/audio/ui-invalid-muted-01.wav"
];

async function addAppShell() {
  const cache = await caches.open(CACHE_NAME);
  await cache.addAll([...APP_SHELL, ...VISUAL_PACK_ASSETS, ...SOUND_PACK_ASSETS]);
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
