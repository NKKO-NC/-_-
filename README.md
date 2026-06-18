# Kalah Childhood Memories

&#31461;&#24180;&#22238;&#25014;_&#38750;&#27954;&#26827; / Kalah &#25773;&#26827; MVP

A simple browser-based Kalah / Mancala MVP built with plain HTML, CSS, and JavaScript.

## Play

[Play the game on GitHub Pages](https://nkko-nc.github.io/-_-/)

## Run

Run a local static server, then open the site in a browser:

```bash
node serve.mjs 8123
```

If Node is not available on Windows, use the built-in PowerShell server:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\serve.ps1 -Port 8123
```

Then visit `http://127.0.0.1:8123/`.

## Features

- 6 pits per player
- 6 stones per pit at start
- Ruby and amethyst image stones
- Replaceable object, visual, and sound packs
- Generated dark crystal board, UI panels, background, particles, and procedural audio pack
- Animated sowing with random landing positions and light collision spacing
- Stones keep their original color after moving
- Coin toss rendered with local Three.js build and a transparent canvas overlay
- Capture, extra turn, end-game collection, and winner detection

## Files

- `index.html` - page shell
- `styles.css` - board and animation styling
- `script.js` - Kalah turn flow, UI orchestration, and rendering
- `core/object-model.js` - board indices, player ids, initial object state, and model helpers
- `core/object-physics.js` - stone placement, collision, flight, and particle tuning
- `core/object-pack-manifest.js` - expected object-pack contract and validation helpers
- `core/object-pack-runtime.js` - active object-pack accessors and CSS variable application
- `core/visual-pack-runtime.js` - visual-pack manifest loader and CSS variable binding
- `sound/sound-pack-runtime.js` - sound-pack manifest loader and Web Audio playback
- `game/ai.js` - Easy / Medium / Hard count-board AI move selection
- `ui/copy.js` - shared UI copy constants
- `ui/dom.js` - DOM reference collection for the game screen
- `ui/rule-demo-data.js` - rule tutorial data used by the rules panel
- `object-packs/crystal.js` - current skin/theme object pack
- `visual-packs/crystal-childhood/` - generated first-round visual pack and manifest
- `sound-packs/procedural-crystal/` - procedural sound pack and manifest
- `docs/object-pack-architecture.md` - notes for adding or swapping object packs
- `docs/cross-department-asset-pack-brief-v0.1.md` - visual/sound pack handoff brief
- `serve.mjs` - tiny local static server for module-based offline use
- `serve.ps1` - Windows PowerShell static server fallback
- `vendor/three/` - local Three.js build files
- `assets/` - generated gemstone assets used by the game
