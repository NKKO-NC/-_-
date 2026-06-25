# Kalah Childhood Memories

&#31461;&#24180;&#22238;&#25014;_&#38750;&#27954;&#26827; / Kalah &#25773;&#26827; MVP

這是一個以純 HTML、CSS、JavaScript 製作的瀏覽器版 Kalah / Mancala MVP。

## Play

玩家正式版入口：

[Play the player release build](https://nkko-nc.github.io/-_-/)

目前玩家實際使用的版本以 `gh-pages` 發版內容為準。

## 管理者驗收

管理者測試頁入口：

[Open the main branch test build](https://rawcdn.githack.com/NKKO-NC/-_-/main/index.html)

目前規則如下：

- `main` 對應管理者驗收用測試畫面
- `gh-pages` 對應玩家實際使用版本
- 日常修改預設先進 `main`
- 只有在管理者同意發版後，才同步到 `gh-pages`

詳細規範請見 [docs/release-channel-policy.md](/C:/Users/User/OneDrive/文件/Kalah_童年回憶計畫/docs/release-channel-policy.md)。

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
- Replaceable object stones and seal emblems by theme
- Theme dropdown for `經典`, `禪風`, and `貴器` packs
- Replaceable object, visual, and sound packs
- Generated Classic, Zen, and Artifact board, UI panel, background, token, coin, and particle visual packs
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
- `object-packs/obsidian.js` - `經典` skin/theme object pack
- `object-packs/artifact.js` - `貴器` skin/theme object pack
- `object-packs/zen.js` - `禪風` skin/theme object pack
- `visual-packs/artifact-childhood/` - `貴器` visual pack scaffold and object assets
- `visual-packs/obsidian-childhood/` - `經典` visual pack and manifest
- `visual-packs/zen-childhood/` - `禪風` visual pack and manifest
- `sound-packs/procedural-crystal/` - procedural sound pack and manifest
- `docs/object-pack-architecture.md` - notes for adding or swapping object packs
- `docs/cross-department-asset-pack-brief-v0.1.md` - visual/sound pack handoff brief
- `serve.mjs` - tiny local static server for module-based offline use
- `serve.ps1` - Windows PowerShell static server fallback
- `vendor/three/` - local Three.js build files
- `assets/` - generated gemstone assets used by the game
