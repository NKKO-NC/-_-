# Cross-Department Asset Pack Brief v0.1

Date: 2026-06-18  
Project: Kalah Childhood Memories  
Owner: Engine / Codex integration  
Audience: Material FX artist, sound designer, UI/runtime integration

## 1. Objective

The project is moving toward replaceable theme packs. The stable runtime should own game rules, board state, animation timing, and pack loading. Visual and sound departments should deliver compliant asset packs that can be swapped without changing the core engine.

First-round target:

- Visual pack: `crystal-childhood-visual`
- Sound pack integrated: `procedural-crystal`
- Current engine model: standard Kalah 6 pits per player, 2 stores, horizontal and portrait layouts treated as separate physical models.

## 2.方案驗證與決議

Reviewed inputs:

- `C:/Users/User/OneDrive/桌面/特效師A.txt`
- `C:/Users/User/OneDrive/桌面/特效師B.txt`

Decision for the first playable integration:

- Adopt B as the implementation path because it provides a generated, repeatable pack workflow and can immediately feed runtime integration.
- Preserve A as the contract/specification layer because it defines the stricter asset list, schema expectations, layout constraints, and acceptance checklist.
- Current local environment has no available Node/Python image generation path, so the B-style generator was implemented as `visual-packs/crystal-childhood/generate-pack.ps1` using PowerShell and .NET `System.Drawing`.
- First playable build uses PNG backgrounds instead of WebP because the local .NET encoder path does not provide WebP output. If the material FX team delivers WebP later, update `manifest.json` `src` and `type` only; the runtime does not need core engine changes.

Integration status:

- Visual manifest is loadable through `core/visual-pack-runtime.js`.
- Sound manifest is loadable through `sound/sound-pack-runtime.js`.
- Main game UI binds pack assets through CSS variables and event hooks.
- Service worker precaches app shell, visual pack assets, and sound pack assets.

## 3. Shared Rules

All departments must follow these constraints:

- Do not bake text, numbers, UI labels, score values, button labels, player names, or watermarks into images.
- Do not include stones already sitting in pits or stores. Stones remain separate runtime objects.
- Do not copy recognizable game, film, brand, icon, or UI sound/visual signatures.
- Keep source and rights notes with every pack.
- Use lowercase kebab-case filenames.
- Use sRGB color.
- PNG/WebP alpha must be straight alpha, not premultiplied.
- Leave transparent padding where the engine needs hover, glow, and scale animation.
- Every deliverable must be listed in the pack manifest with dimensions, format, role, source, license, and hash placeholder.

## 4. Visual Art Direction

Theme: dark crystal childhood memory.

Primary read:

- Obsidian or deep black crystal board body.
- Gold inlay lines, not ornate clutter.
- Ruby accents for player 1, amethyst accents for player 2.
- Warm enough for a childhood-memory game, but still clean and readable.
- High contrast around pits and stores so gemstones remain visible.

Negative prompt for all generated bitmap assets:

```text
text, letters, numbers, logos, watermark, signature, UI labels, score numbers,
hands, people, characters, dice, chess pieces, existing game branding,
photorealistic table clutter, baked stones in pits, blurry crop, low contrast,
overly busy filigree, unreadable dark holes, jpeg artifacts
```

## 5. First-Round Visual Deliverables

All assets go under:

```text
visual-packs/crystal-childhood/assets/
```

### 5.1 Board Physical Skins

| Asset id | File | Size | Format | Alpha | Required | Purpose |
|---|---:|---:|---|---|---|---|
| `board.landscape.base` | `board-landscape-base.png` | 2048 x 1024 | PNG | yes | yes | Full horizontal board body, transparent outside board silhouette. |
| `board.landscape.rim` | `board-landscape-rim-overlay.png` | 2048 x 1024 | PNG | yes | yes | Gold/crystal rim and decorative inlay overlay. No pits filled with stones. |
| `board.landscape.shadow` | `board-landscape-shadow.png` | 2048 x 1024 | PNG | yes | yes | Soft board contact shadow only. |
| `board.landscape.slot-mask` | `board-landscape-slot-mask.png` | 2048 x 1024 | PNG | yes | yes | White/alpha mask for 12 pits and 2 stores. No decorative art. |
| `board.portrait.base` | `board-portrait-base.png` | 1536 x 2048 | PNG | yes | yes | Independent portrait board body, not a cropped horizontal board. |
| `board.portrait.rim` | `board-portrait-rim-overlay.png` | 1536 x 2048 | PNG | yes | yes | Portrait-specific rim and inlay overlay. |
| `board.portrait.shadow` | `board-portrait-shadow.png` | 1536 x 2048 | PNG | yes | yes | Soft portrait board contact shadow. |
| `board.portrait.slot-mask` | `board-portrait-slot-mask.png` | 1536 x 2048 | PNG | yes | yes | White/alpha mask for portrait pit/store slots. |

Board prompt:

```text
Top-down orthographic asset for a Kalah mancala board, dark obsidian crystal body,
subtle ruby and amethyst reflections, fine gold inlay lines, premium board-game
material, clean readable pit/store openings, transparent background outside the
board silhouette, no stones, no text, no numbers, no logos, no hands.
```

### 5.2 Pit And Store Materials

| Asset id | File | Size | Format | Alpha | Required | Purpose |
|---|---:|---:|---|---|---|---|
| `pit.albedo` | `pit-well-albedo.png` | 512 x 512 | PNG | no | yes | Reusable round pit interior texture. |
| `pit.normal` | `pit-well-normal.png` | 512 x 512 | PNG | no | preferred | Normal map for future canvas/WebGL model. |
| `pit.roughness` | `pit-well-roughness.png` | 512 x 512 | PNG | no | preferred | Grayscale roughness map. |
| `store.landscape.albedo` | `store-well-landscape-albedo.png` | 512 x 1024 | PNG | no | yes | Vertical store interior texture for horizontal board. |
| `store.portrait.albedo` | `store-well-portrait-albedo.png` | 512 x 768 | PNG | no | yes | Portrait store interior texture. |
| `store.normal` | `store-well-normal.png` | 512 x 1024 | PNG | no | preferred | Store normal map; can be vertical master. |
| `store.roughness` | `store-well-roughness.png` | 512 x 1024 | PNG | no | preferred | Store roughness map. |

Material prompt:

```text
Close top-down material texture for an empty crystal Kalah pit interior,
dark translucent glass and obsidian, soft bevel highlight, readable central
depth, subtle gold rim reflection, seamless enough for scaling, no stones,
no text, no symbols.
```

## 6. First-Round UI Skin Deliverables

All UI skin assets must be stretch-safe. Provide a 9-slice guide in manifest.

| Asset id | File | Size | Format | Alpha | Required | Purpose |
|---|---:|---:|---|---|---|---|
| `ui.score.panel` | `ui-score-panel-9slice.png` | 1024 x 256 | PNG | yes | yes | Score strip panel background. |
| `ui.dialogue.panel` | `ui-dialogue-panel-9slice.png` | 1536 x 320 | PNG | yes | yes | AI/dialogue panel. |
| `ui.modal.panel` | `ui-modal-panel-9slice.png` | 1400 x 1200 | PNG | yes | yes | Rules/settings modal surface. |
| `ui.result.panel` | `ui-result-panel-9slice.png` | 1024 x 1024 | PNG | yes | yes | End-game result panel. |
| `ui.button.primary` | `ui-button-primary-9slice.png` | 768 x 224 | PNG | yes | yes | Primary button surface. |
| `ui.button.secondary` | `ui-button-secondary-9slice.png` | 768 x 224 | PNG | yes | yes | Secondary button surface. |
| `ui.icon.frame` | `ui-icon-frame.png` | 256 x 256 | PNG | yes | yes | Circular or compact icon button frame. |
| `ui.turn.badge` | `ui-turn-badge.png` | 384 x 384 | PNG | yes | yes | Turn indicator holder. |
| `hint.ring.red` | `hint-ring-red.png` | 512 x 512 | PNG | yes | optional | Player-one sow-preview ring material; CSS fallback exists. |
| `hint.ring.purple` | `hint-ring-purple.png` | 512 x 512 | PNG | yes | optional | Player-two sow-preview ring material; CSS fallback exists. |
| `hint.ring.landing` | `hint-ring-landing.png` | 512 x 512 | PNG | yes | optional | Yellow landing-stop preview ring material; CSS fallback exists. |

UI prompt:

```text
Transparent 9-slice UI panel for a dark crystal Kalah game, obsidian glass,
subtle gold bevel, restrained ruby and amethyst glints, high readability,
clean center area for runtime text, no text, no icons, no numbers, no logo.
```

## 7. Background And Particles

| Asset id | File | Size | Format | Alpha | Required | Purpose |
|---|---:|---:|---|---|---|---|
| `background.landscape.idle` | `background-landscape-idle.png` | 2560 x 1440 | PNG | no | yes | Main idle background. |
| `background.portrait.idle` | `background-portrait-idle.png` | 1440 x 2560 | PNG | no | yes | Mobile portrait background. |
| `particle.ruby.01-05` | `particle-ruby-01.png` ... `05` | 128 x 128 | PNG | yes | yes | Red player particles. |
| `particle.amethyst.01-05` | `particle-amethyst-01.png` ... `05` | 128 x 128 | PNG | yes | yes | Purple player particles. |
| `particle.gold.01-05` | `particle-gold-01.png` ... `05` | 128 x 128 | PNG | yes | yes | Neutral/result particles. |

Background prompt:

```text
Full-screen game background for a dark crystal Kalah board game, subtle
obsidian surface, faint childhood-memory warmth, soft depth, low visual noise,
board area remains readable, no cards, no text, no objects that imply fixed UI.
```

Particle prompt:

```text
Transparent sprite, single small crystal sparkle shard, high contrast, clean
alpha, ruby red / amethyst purple / warm gold variant, no background, no text.
```

## 8. Optional Coin And Emblem Refresh

Current pack already has coin, dragon, shield, ruby stone, and amethyst stone. Replace only if art direction wants a unified pass.

| Asset id | File | Size | Format | Alpha | Required |
|---|---:|---:|---|---|---|
| `coin.body.albedo` | `coin-body-albedo.png` | 1024 x 1024 | PNG | yes | optional |
| `coin.edge.strip` | `coin-edge-strip.png` | 1024 x 128 | PNG | no | optional |
| `emblem.player1` | `emblem-player1.png` | 1024 x 1024 | PNG | yes | optional |
| `emblem.player2` | `emblem-player2.png` | 1024 x 1024 | PNG | yes | optional |
| `stone.player1` | `stone-player1-ruby.png` | 512 x 512 | PNG | yes | optional |
| `stone.player2` | `stone-player2-amethyst.png` | 512 x 512 | PNG | yes | optional |

## 9. Visual Manifest Draft

Create:

```text
visual-packs/crystal-childhood/manifest.json
```

Minimum schema:

```json
{
  "schemaVersion": 1,
  "id": "crystal-childhood-visual",
  "displayName": "Crystal Childhood Visual",
  "assetVersion": "20260618-visual-a",
  "engineCompatibility": "^1.0.0",
  "baseUrl": "./assets/",
  "compliance": {
    "source": "original-or-procedural-generated",
    "commercialUseIntended": true,
    "thirdPartySourceAssets": false,
    "attributionRequired": false,
    "licenseNote": "Keep source notes and hashes with redistributed files."
  },
  "layouts": {
    "landscape": {
      "canvas": [2048, 1024],
      "physicalModel": "kalah-6x6-landscape"
    },
    "portrait": {
      "canvas": [1536, 2048],
      "physicalModel": "kalah-6x6-portrait"
    }
  },
  "assets": {
    "board.landscape.base": {
      "src": "board-landscape-base.png",
      "type": "image/png",
      "width": 2048,
      "height": 1024,
      "alpha": true,
      "role": "board-base",
      "sha256": ""
    }
  },
  "nineSlice": {
    "ui.score.panel": { "left": 96, "right": 96, "top": 72, "bottom": 72 }
  }
}
```

## 10. Visual Acceptance Checklist

The engine team can accept the first visual pass when:

- All required assets exist at exact pixel sizes.
- Manifest parses as JSON and every manifest asset points to an existing file.
- No asset contains text, watermark, UI label, score number, or baked gameplay state.
- Landscape and portrait boards are independently composed.
- Pits/stores are readable under current ruby/amethyst stones.
- UI panels have quiet centers suitable for runtime text.
- Source/license notes are present.
- Hashes are either filled in or explicitly marked as pending.

## 11. Sound Pack Review: `procedural-crystal`

Reviewed location:

```text
sound-packs/procedural-crystal/
```

Read results:

- `manifest.json` parses correctly.
- 23 manifest assets found.
- 14 event mappings found.
- 23 WAV files found.
- `checksums.sha256` contains 23 entries.
- Manifest SHA-256 values match audio files.
- Checksum file SHA-256 values match audio files.
- Every event variant points to an existing asset.
- WAV headers are PCM, 44.1 kHz, stereo, 16-bit.
- Manifest durations match WAV data durations.
- Total WAV size is approximately 9.9 MB.

Sound feedback:

- Approved for development integration.
- Before production PWA shipping, add compressed delivery formats such as `.ogg` or `.webm/opus`.
- Keep WAV as source/master assets.
- Consider adding `engineCompatibility`, `schemaName`, and a normalized `commercialUse: true` alias in the next sound manifest revision so visual and sound pack compliance fields match.
- Keep `SOUND_LICENSE.md`, `manifest.json`, `checksums.sha256`, and `generate-pack.ps1` together.

## 12. Runtime Integration Notes

Near-term engine hooks expected from sound:

- `music.game`
- `stone.pickup`
- `stone.drop.pit`
- `stone.drop.store`
- `stone.collision`
- `stone.capture`
- `turn.extra`
- `turn.change`
- `coin.toss`
- `ui.button`
- `ui.invalid`
- `result.victory`
- `result.defeat`
- `result.draw`

Near-term engine hooks expected from visual:

- `board.landscape.*`
- `board.portrait.*`
- `pit.*`
- `store.*`
- `ui.*`
- `background.*`
- `particle.*`

The game runtime should load these through pack manifests rather than direct CSS hardcoding.
