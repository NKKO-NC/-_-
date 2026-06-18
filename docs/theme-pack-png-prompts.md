# Theme Pack PNG Prompt Pack

這份文件可在你和 LLM 定完主題方向後使用。先填入 `Theme Variables`，再把每個 `Asset Prompt` 丟給圖片生成工具，輸出指定 PNG 檔名與尺寸。

## Theme Variables

```text
THEME_SLUG = <kebab-case theme slug>
THEME_NAME = <display name>
CORE_THEME = <one sentence theme direction>
MOOD = <3-8 mood keywords>
BOARD_MATERIAL = <main board materials>
BOARD_SURFACE = <board reflection, wear, texture behavior>
TEXT_SURFACE = <UI text panel material>
BACKGROUND_LANGUAGE = <quiet background direction>
PLAYER_ONE_ACCENT = <player one color/material/symbol>
PLAYER_TWO_ACCENT = <player two color/material/symbol>
NEUTRAL_ACCENT = <neutral highlight/particle material>
UTILITY_ACCENT = <focus or hint accent>
STYLE_BOUNDARY = <what makes this theme unique but still readable>
```

## Global Rules For Every PNG

Use these rules in every prompt:

```text
Create an original game-ready PNG asset for Kalah Childhood Memories.
Theme: CORE_THEME.
Mood: MOOD.
Style boundary: STYLE_BOUNDARY.
No baked text, no letters, no numbers, no labels, no score values, no logos, no watermark, no signature.
No people, hands, dice, chess pieces, recognizable third-party IP, or existing game branding.
No baked gameplay stones inside board pits or stores unless the asset is explicitly a stone.
sRGB color. Crisp edges. Clean composition. High readability in a browser game UI.
Commercial-use original generated art only.
```

Global negative prompt:

```text
text, letters, numbers, UI labels, score numbers, logo, watermark, signature, hands, people, characters, dice, chess pieces, recognizable IP, existing game branding, baked stones in pits, baked stones in stores, blurry crop, low contrast, unreadable holes, noisy UI center, jpeg artifacts, distorted board layout, extra pits, missing pits
```

## Board Assets

### board-landscape-base.png

```text
Generate board-landscape-base.png, 2048 x 1024 PNG with transparent background outside the board silhouette.
Top-down orthographic Kalah mancala board base for a 6 pits per player board with 12 small pits and 2 large stores.
Board material: BOARD_MATERIAL.
Surface behavior: BOARD_SURFACE.
Use PLAYER_ONE_ACCENT and PLAYER_TWO_ACCENT only as restrained side accents, not as large noisy fills.
Keep pit and store openings clean, dark enough for depth, but readable under small runtime stones.
Composition: horizontal landscape board centered, complete silhouette visible, no crop.
No stones, no text, no numbers, no labels.
```

### board-landscape-rim-overlay.png

```text
Generate board-landscape-rim-overlay.png, 2048 x 1024 PNG with transparent background.
Top-down transparent overlay for the same landscape Kalah board.
Only render rim, bevel highlights, inlay lines, pit/store lip details, subtle edge wear, and decorative trim.
Material language: BOARD_MATERIAL with restrained PLAYER_ONE_ACCENT, PLAYER_TWO_ACCENT, and NEUTRAL_ACCENT.
The overlay must align to a 2048 x 1024 board base with 12 pits and 2 stores.
Mostly transparent center areas; do not repaint the full board body.
No stones, no text, no numbers, no labels.
```

### board-landscape-shadow.png

```text
Generate board-landscape-shadow.png, 2048 x 1024 transparent PNG.
Soft contact shadow for the landscape board silhouette only.
Shadow should sit under the board, subtle and blurred, no hard decorative details.
Transparent outside shadow. No board texture, no stones, no text.
```

### board-landscape-slot-mask.png

```text
Generate board-landscape-slot-mask.png, 2048 x 1024 transparent PNG.
Pure white alpha mask shapes only: 12 round pit masks and 2 large store masks for the landscape Kalah layout.
Everything else transparent. No texture, no gradients, no decoration, no text.
Pits must be evenly aligned in two rows of six; stores at far left and far right.
```

### board-portrait-base.png

```text
Generate board-portrait-base.png, 1536 x 2048 PNG with transparent background outside the board silhouette.
Top-down orthographic portrait Kalah mancala board base for a 6 pits per player board with 12 small pits and 2 large stores.
This must be an independently composed portrait board, not a cropped landscape board.
Board material: BOARD_MATERIAL.
Surface behavior: BOARD_SURFACE.
Use PLAYER_ONE_ACCENT and PLAYER_TWO_ACCENT only as restrained side accents.
Keep pit and store openings clean and readable under runtime stones.
No stones, no text, no numbers, no labels.
```

### board-portrait-rim-overlay.png

```text
Generate board-portrait-rim-overlay.png, 1536 x 2048 PNG with transparent background.
Top-down transparent overlay for the portrait Kalah board.
Only render rim, bevel highlights, inlay lines, pit/store lip details, subtle edge wear, and decorative trim.
The overlay must align to a 1536 x 2048 portrait board with 12 pits and 2 stores.
Mostly transparent center areas; do not repaint the full board body.
No stones, no text, no numbers, no labels.
```

### board-portrait-shadow.png

```text
Generate board-portrait-shadow.png, 1536 x 2048 transparent PNG.
Soft contact shadow for the portrait board silhouette only.
Shadow should sit under the board, subtle and blurred, no hard decorative details.
Transparent outside shadow. No board texture, no stones, no text.
```

### board-portrait-slot-mask.png

```text
Generate board-portrait-slot-mask.png, 1536 x 2048 transparent PNG.
Pure white alpha mask shapes only: 12 round pit masks and 2 large store masks for the portrait Kalah layout.
Everything else transparent. No texture, no gradients, no decoration, no text.
Pits must be arranged for portrait play with two vertical pit columns and stores near top and bottom.
```

## Pit And Store Materials

### pit-well-albedo.png

```text
Generate pit-well-albedo.png, 512 x 512 opaque PNG.
Reusable top-down albedo texture for an empty round Kalah pit interior.
Material: BOARD_MATERIAL.
Surface behavior: BOARD_SURFACE, readable central depth, clean bevel highlight.
This texture must tile or scale cleanly inside circular pits.
No stones, no text, no symbols, no alpha.
```

### pit-well-normal.png

```text
Generate pit-well-normal.png, 512 x 512 opaque PNG.
Game material normal map for an empty round Kalah pit interior.
Represent a shallow bowl shape with bevel and central depth.
Use standard tangent-space normal-map colors, mostly blue/purple.
No decorative color albedo, no text, no stones, no alpha.
```

### pit-well-roughness.png

```text
Generate pit-well-roughness.png, 512 x 512 opaque PNG.
Grayscale roughness map for an empty round Kalah pit interior.
White means rough, black means glossy.
Match BOARD_MATERIAL surface behavior with subtle variation and readable bowl center.
No color, no alpha, no text, no stones.
```

### store-well-landscape-albedo.png

```text
Generate store-well-landscape-albedo.png, 512 x 1024 opaque PNG.
Reusable vertical albedo texture for a large Kalah store well on the landscape board.
Material: BOARD_MATERIAL.
Surface behavior: BOARD_SURFACE, elongated bowl depth, clean bevel highlight.
No stones, no text, no symbols, no alpha.
```

### store-well-portrait-albedo.png

```text
Generate store-well-portrait-albedo.png, 512 x 768 opaque PNG.
Reusable albedo texture for a large Kalah store well on the portrait board.
Material: BOARD_MATERIAL.
Surface behavior: BOARD_SURFACE, elongated bowl depth, clean bevel highlight.
No stones, no text, no symbols, no alpha.
```

### store-well-normal.png

```text
Generate store-well-normal.png, 512 x 1024 opaque PNG.
Game material normal map for an elongated Kalah store well.
Represent a long shallow bowl with beveled rim and central depth.
Use standard tangent-space normal-map colors, mostly blue/purple.
No decorative color albedo, no text, no stones, no alpha.
```

### store-well-roughness.png

```text
Generate store-well-roughness.png, 512 x 1024 opaque PNG.
Grayscale roughness map for an elongated Kalah store well.
White means rough, black means glossy.
Match BOARD_MATERIAL surface behavior with subtle variation.
No color, no alpha, no text, no stones.
```

## UI Skin Assets

### ui-score-panel-9slice.png

```text
Generate ui-score-panel-9slice.png, 1024 x 256 transparent PNG.
Stretch-safe 9-slice score strip panel for browser game UI.
Text surface material: TEXT_SURFACE.
Center must be quiet, mostly flat, and readable for runtime text and numbers.
Decorate only edges and corners using NEUTRAL_ACCENT with very restrained PLAYER_ONE_ACCENT and PLAYER_TWO_ACCENT.
Nine-slice safe borders: left 96, right 96, top 72, bottom 72.
No baked text, no icons, no numbers, no logo.
```

### ui-dialogue-panel-9slice.png

```text
Generate ui-dialogue-panel-9slice.png, 1536 x 320 transparent PNG.
Stretch-safe dialogue panel for browser game UI.
Text surface material: TEXT_SURFACE.
Center must be calm and readable for multi-line runtime dialogue.
Edges may carry subtle theme texture, corner framing, and NEUTRAL_ACCENT trim.
Nine-slice safe borders: left 128, right 128, top 88, bottom 88.
No baked text, no icons, no numbers, no logo.
```

### ui-modal-panel-9slice.png

```text
Generate ui-modal-panel-9slice.png, 1400 x 1200 transparent PNG.
Stretch-safe modal panel for rules and settings.
Text surface material: TEXT_SURFACE.
Large center area must be low-noise and readable for paragraphs.
Edges and corners may show theme material and restrained trim.
Nine-slice safe borders: left 128, right 128, top 128, bottom 128.
No baked text, no icons, no numbers, no logo.
```

### ui-result-panel-9slice.png

```text
Generate ui-result-panel-9slice.png, 1024 x 1024 transparent PNG.
Stretch-safe result panel for end-game state.
Text surface material: TEXT_SURFACE.
Center must be readable for winner text and scores added by CSS/HTML.
Allow subtle celebratory NEUTRAL_ACCENT framing, but keep it premium and quiet.
Nine-slice safe borders: left 120, right 120, top 120, bottom 120.
No baked text, no icons, no numbers, no logo.
```

### ui-button-primary-9slice.png

```text
Generate ui-button-primary-9slice.png, 768 x 224 transparent PNG.
Stretch-safe primary button surface.
Text surface material: TEXT_SURFACE with stronger NEUTRAL_ACCENT trim and clear hover-ready edges.
Center must remain readable for runtime button label text.
Nine-slice safe borders: left 96, right 96, top 72, bottom 72.
No baked text, no icons, no numbers, no logo.
```

### ui-button-secondary-9slice.png

```text
Generate ui-button-secondary-9slice.png, 768 x 224 transparent PNG.
Stretch-safe secondary button surface.
Text surface material: TEXT_SURFACE with quieter trim than the primary button.
Center must remain readable for runtime button label text.
Nine-slice safe borders: left 96, right 96, top 72, bottom 72.
No baked text, no icons, no numbers, no logo.
```

### ui-icon-frame.png

```text
Generate ui-icon-frame.png, 256 x 256 transparent PNG.
Compact icon button frame for browser game controls.
Theme material should match TEXT_SURFACE or BOARD_MATERIAL, with NEUTRAL_ACCENT rim.
Center must be transparent or quiet enough for runtime icon glyphs.
No baked icons, no text, no numbers, no logo.
```

### ui-turn-badge.png

```text
Generate ui-turn-badge.png, 384 x 384 transparent PNG.
Turn indicator badge holder for a small player/coin image.
Theme material should match BOARD_MATERIAL with NEUTRAL_ACCENT trim.
Center must be clear enough to display runtime image.
No baked text, no player symbol, no numbers, no logo.
```

## Hint Rings

### hint-ring-red.png

```text
Generate hint-ring-red.png, 512 x 512 transparent PNG.
Circular hint ring sprite for player one move preview.
Use PLAYER_ONE_ACCENT as the main glow/material.
Ring only, transparent center, transparent outside, soft but crisp edge.
No text, no numbers, no icons.
```

### hint-ring-purple.png

```text
Generate hint-ring-purple.png, 512 x 512 transparent PNG.
Circular hint ring sprite for player two move preview.
Use PLAYER_TWO_ACCENT as the main glow/material.
Ring only, transparent center, transparent outside, soft but crisp edge.
No text, no numbers, no icons.
```

### hint-ring-landing.png

```text
Generate hint-ring-landing.png, 512 x 512 transparent PNG.
Circular hint ring sprite for landing/neutral move preview.
Use NEUTRAL_ACCENT as the main glow/material.
Ring only, transparent center, transparent outside, slightly brighter than player hint rings.
No text, no numbers, no icons.
```

## Backgrounds

### background-landscape-idle.png

```text
Generate background-landscape-idle.png, 2560 x 1440 opaque PNG.
Full-screen landscape game background.
Background language: BACKGROUND_LANGUAGE.
It must support the board and UI rather than compete with them.
Keep center readable behind a large board; low visual noise, soft depth, no fixed UI shapes.
Use palette colors from CORE_THEME with restrained accents.
No text, no logos, no characters, no obvious table clutter.
```

### background-portrait-idle.png

```text
Generate background-portrait-idle.png, 1440 x 2560 opaque PNG.
Full-screen portrait/mobile game background.
Background language: BACKGROUND_LANGUAGE.
It must support the portrait board and UI rather than compete with them.
Keep center readable behind a tall board; low visual noise, soft depth, no fixed UI shapes.
Use palette colors from CORE_THEME with restrained accents.
No text, no logos, no characters, no obvious table clutter.
```

## Particles

### particle-ruby-01.png through particle-ruby-05.png

```text
Generate particle-ruby-0N.png, 128 x 128 transparent PNG.
Single small sparkle/shard/sprite for player one feedback.
Use PLAYER_ONE_ACCENT and theme-specific material.
Clean alpha, centered sprite, high contrast at small size.
Create five slight shape variants while keeping one visual family.
No text, no numbers, no background.
```

### particle-amethyst-01.png through particle-amethyst-05.png

```text
Generate particle-amethyst-0N.png, 128 x 128 transparent PNG.
Single small sparkle/shard/sprite for player two feedback.
Use PLAYER_TWO_ACCENT and theme-specific material.
Clean alpha, centered sprite, high contrast at small size.
Create five slight shape variants while keeping one visual family.
No text, no numbers, no background.
```

### particle-gold-01.png through particle-gold-05.png

```text
Generate particle-gold-0N.png, 128 x 128 transparent PNG.
Single small sparkle/shard/sprite for neutral, coin toss, and result feedback.
Use NEUTRAL_ACCENT and theme-specific material.
Clean alpha, centered sprite, high contrast at small size.
Create five slight shape variants while keeping one visual family.
No text, no numbers, no background.
```

## Object Pack Optional PNG Assets

這些目前放在根目錄 `assets/`，不是 visual pack manifest 的一部分。如果要做完整主題，建議一起重繪。

### player-one-stone.png

```text
Generate player-one-stone.png, 512 x 512 transparent PNG.
Single Kalah stone/game piece for player one.
Stone theme: PLAYER_ONE_ACCENT, matching CORE_THEME and BOARD_MATERIAL.
Readable at 30-58 px in game. Centered object, transparent background, soft contact shadow inside sprite only if useful.
No text, no numbers, no logo.
```

### player-two-stone.png

```text
Generate player-two-stone.png, 512 x 512 transparent PNG.
Single Kalah stone/game piece for player two.
Stone theme: PLAYER_TWO_ACCENT, matching CORE_THEME and BOARD_MATERIAL.
Readable at 30-58 px in game. Centered object, transparent background, soft contact shadow inside sprite only if useful.
No text, no numbers, no logo.
```

### coin-body.png

```text
Generate coin-body.png, 1024 x 1024 transparent PNG.
Round coin body texture for a Three.js coin toss.
Material should match CORE_THEME and NEUTRAL_ACCENT.
Centered circular coin face with transparent outside.
Leave center calm enough for runtime player sigil overlay.
No baked text, no numbers, no logo, no player-specific symbol.
```

### player-one-sigil.png

```text
Generate player-one-sigil.png, 1024 x 1024 transparent PNG.
Player one emblem/sigil for store marker and coin face overlay.
Theme: CORE_THEME.
Use PLAYER_ONE_ACCENT. Strong silhouette, readable when scaled down.
Original abstract symbol only, no text, no numbers, no recognizable IP.
Transparent background.
```

### player-two-sigil.png

```text
Generate player-two-sigil.png, 1024 x 1024 transparent PNG.
Player two emblem/sigil for store marker and coin face overlay.
Theme: CORE_THEME.
Use PLAYER_TWO_ACCENT. Strong silhouette, readable when scaled down.
Original abstract symbol only, no text, no numbers, no recognizable IP.
Transparent background.
```

## Post-Generation Checklist

After PNG generation:

- Confirm exact pixel dimensions.
- Confirm transparent assets really have alpha and opaque assets do not.
- Confirm no text, watermark, logo, baked scores, or baked stones appear.
- Fill `visual-packs/<theme-slug>/manifest.json`.
- Fill `checksums.sha256` and manifest `sha256` fields.
- Write `SOURCE_NOTES.md`.
- Write `VISUAL_LICENSE.md`.
- Update or duplicate `object-packs/crystal.js` only after visual assets are ready.
