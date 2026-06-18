# Theme Pack Material Requirements

本文件整理目前專案中跟盤面、視覺效果、材料、圖卡、字體、顏色有關的替換規格。目標是讓你和 LLM 討論完新主題後，可以依照同一份命名與尺寸，產出完整可替換素材包。

## Current Runtime Contract

目前主題分成兩層：

- Visual pack: `visual-packs/<theme-slug>/manifest.json` 和 `visual-packs/<theme-slug>/assets/*.png`。負責背景、盤面、坑洞材料、UI 面板、提示圈、粒子。
- Object pack: `object-packs/*.js`。負責玩家名稱、棋子圖片、投幣圖片、玩家徽章、CSS 顏色變數。

目前載入點：

- `core/visual-pack-runtime.js` 會讀取 visual manifest，並把 asset id 綁成 CSS 變數。
- `core/object-pack-manifest.js` 驗證 object pack 必填欄位。
- `object-packs/crystal.js` 是現在的可複製範本。
- `styles.css` 仍保有版面與細節選擇器；新主題要盡量維持 asset id、尺寸、檔名與 CSS class 不變。

## Naming Rules

- Theme slug: 小寫 kebab-case，例如 `moon-market-memory`。
- Visual pack id: `<theme-slug>-visual`。
- Object pack id: `<theme-slug>`。
- Visual pack folder: `visual-packs/<theme-slug>/`。
- Visual assets folder: `visual-packs/<theme-slug>/assets/`。
- PNG 檔名: 小寫 kebab-case，維持下表原檔名可最低風險替換。
- Asset id: 維持 dot.case，例如 `board.landscape.base`。
- Asset version: `yyyymmdd-visual-a` 或 `yyyymmdd-object-a`，例如 `20260619-visual-a`。
- 不要在圖中烘焙任何文字、數字、Logo、浮水印、簽名、分數、按鈕標籤、玩家名稱。

## Required Visual Assets

| Asset id | File | Size | Alpha | Role |
|---|---:|---:|---:|---|
| `board.landscape.base` | `board-landscape-base.png` | 2048 x 1024 | yes | `board-base` |
| `board.landscape.rim` | `board-landscape-rim-overlay.png` | 2048 x 1024 | yes | `board-rim-overlay` |
| `board.landscape.shadow` | `board-landscape-shadow.png` | 2048 x 1024 | yes | `board-shadow` |
| `board.landscape.slot-mask` | `board-landscape-slot-mask.png` | 2048 x 1024 | yes | `board-slot-mask` |
| `board.portrait.base` | `board-portrait-base.png` | 1536 x 2048 | yes | `board-base` |
| `board.portrait.rim` | `board-portrait-rim-overlay.png` | 1536 x 2048 | yes | `board-rim-overlay` |
| `board.portrait.shadow` | `board-portrait-shadow.png` | 1536 x 2048 | yes | `board-shadow` |
| `board.portrait.slot-mask` | `board-portrait-slot-mask.png` | 1536 x 2048 | yes | `board-slot-mask` |
| `pit.albedo` | `pit-well-albedo.png` | 512 x 512 | no | `pit-material` |
| `pit.normal` | `pit-well-normal.png` | 512 x 512 | no | `pit-material-normal` |
| `pit.roughness` | `pit-well-roughness.png` | 512 x 512 | no | `pit-material-roughness` |
| `store.landscape.albedo` | `store-well-landscape-albedo.png` | 512 x 1024 | no | `store-material` |
| `store.portrait.albedo` | `store-well-portrait-albedo.png` | 512 x 768 | no | `store-material` |
| `store.normal` | `store-well-normal.png` | 512 x 1024 | no | `store-material-normal` |
| `store.roughness` | `store-well-roughness.png` | 512 x 1024 | no | `store-material-roughness` |
| `ui.score.panel` | `ui-score-panel-9slice.png` | 1024 x 256 | yes | `ui-score-panel` |
| `ui.dialogue.panel` | `ui-dialogue-panel-9slice.png` | 1536 x 320 | yes | `ui-dialogue-panel` |
| `ui.modal.panel` | `ui-modal-panel-9slice.png` | 1400 x 1200 | yes | `ui-modal-panel` |
| `ui.result.panel` | `ui-result-panel-9slice.png` | 1024 x 1024 | yes | `ui-result-panel` |
| `ui.button.primary` | `ui-button-primary-9slice.png` | 768 x 224 | yes | `ui-button-primary` |
| `ui.button.secondary` | `ui-button-secondary-9slice.png` | 768 x 224 | yes | `ui-button-secondary` |
| `ui.icon.frame` | `ui-icon-frame.png` | 256 x 256 | yes | `ui-icon-frame` |
| `ui.turn.badge` | `ui-turn-badge.png` | 384 x 384 | yes | `ui-turn-badge` |
| `hint.ring.red` | `hint-ring-red.png` | 512 x 512 | yes | `hint-ring` |
| `hint.ring.purple` | `hint-ring-purple.png` | 512 x 512 | yes | `hint-ring` |
| `hint.ring.landing` | `hint-ring-landing.png` | 512 x 512 | yes | `hint-ring` |
| `background.landscape.idle` | `background-landscape-idle.png` | 2560 x 1440 | no | `background` |
| `background.portrait.idle` | `background-portrait-idle.png` | 1440 x 2560 | no | `background` |
| `particle.<player-one-key>.01-05` | `particle-<player-one-key>-01.png` ... `05` | 128 x 128 | yes | `particle` |
| `particle.<player-two-key>.01-05` | `particle-<player-two-key>-01.png` ... `05` | 128 x 128 | yes | `particle` |
| `particle.<neutral-key>.01-05` | `particle-<neutral-key>-01.png` ... `05` | 128 x 128 | yes | `particle` |

Runtime 現在預設粒子群組名稱是 `ruby`、`amethyst`、`gold`。若不改程式，檔名與 asset id 最安全是仍使用：

- `particle.ruby.01-05` / `particle-ruby-01.png` ... `particle-ruby-05.png`
- `particle.amethyst.01-05` / `particle-amethyst-01.png` ... `particle-amethyst-05.png`
- `particle.gold.01-05` / `particle-gold-01.png` ... `particle-gold-05.png`

## Nine Slice Settings

| Asset id | left | right | top | bottom |
|---|---:|---:|---:|---:|
| `ui.score.panel` | 96 | 96 | 72 | 72 |
| `ui.dialogue.panel` | 128 | 128 | 88 | 88 |
| `ui.modal.panel` | 128 | 128 | 128 | 128 |
| `ui.result.panel` | 120 | 120 | 120 | 120 |
| `ui.button.primary` | 96 | 96 | 72 | 72 |
| `ui.button.secondary` | 96 | 96 | 72 | 72 |

九宮格圖的中心必須安靜、可延展、可承載 runtime 文字。邊框和角落可以有主題材質，中心不要有強烈花紋。

## Object Pack Assets

目前 `object-packs/crystal.js` 需要這些資產 key：

| Object asset key | Current file | Purpose |
|---|---|---|
| `rubyStone` or `playerOneStone` | `assets/ruby-gem.png` | 玩家一棋子 |
| `amethystStone` or `playerTwoStone` | `assets/amethyst-gem.png` | 玩家二棋子 |
| `coinBody` | `assets/Coin.png` | 投幣本體與 fallback |
| `dragonSigil` or `playerOneSigil` | `assets/Dragon.png` | 玩家一商店/硬幣正面徽章 |
| `shieldSigil` or `playerTwoSigil` | `assets/Shield.png` | 玩家二商店/硬幣反面徽章 |

若要最低風險替換，先沿用既有 key 與 class：

- Player 1 classes: `turn-red`, `red`, `red`, `p1-store`
- Player 2 classes: `turn-purple`, `purple`, `purple`, `p2-store`
- Neutral classes: `gold`, `pending`

CSS 變數至少要保留：

- `ruby`
- `ruby-soft`
- `amethyst`
- `amethyst-soft`
- `gold`
- `gold-bright`
- `teal`

這些名稱目前不一定要代表紅/紫/金/青，但為了不改 CSS，建議把它們當作「玩家一、玩家二、中性高光、功能色」的相容別名。

## Visual Manifest Skeleton

```json
{
  "schemaVersion": 1,
  "id": "<theme-slug>-visual",
  "displayName": "<Theme Display Name> Visual",
  "assetVersion": "yyyymmdd-visual-a",
  "engineCompatibility": "^1.0.0",
  "baseUrl": "./assets/",
  "compliance": {
    "source": "original-generated",
    "commercialUseIntended": true,
    "commercialUse": true,
    "thirdPartySourceAssets": false,
    "attributionRequired": false,
    "licenseNote": "Original generated visual assets for Kalah Childhood Memories. Keep source notes and hashes with redistributed files."
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
      "source": "original-generated",
      "license": "project-owned-generated-commercial-use-ok",
      "sha256": "pending"
    }
  },
  "nineSlice": {
    "ui.score.panel": { "left": 96, "right": 96, "top": 72, "bottom": 72 },
    "ui.dialogue.panel": { "left": 128, "right": 128, "top": 88, "bottom": 88 },
    "ui.modal.panel": { "left": 128, "right": 128, "top": 128, "bottom": 128 },
    "ui.result.panel": { "left": 120, "right": 120, "top": 120, "bottom": 120 },
    "ui.button.primary": { "left": 96, "right": 96, "top": 72, "bottom": 72 },
    "ui.button.secondary": { "left": 96, "right": 96, "top": 72, "bottom": 72 }
  }
}
```

完整限制可用 [theme-pack-material-schema.json](theme-pack-material-schema.json) 驗證。

## Art Rules

- 輸出 PNG，sRGB。
- 透明 PNG 使用 straight alpha。
- 背景圖不要 alpha；盤面、UI、粒子、提示圈需要 alpha。
- 不要把棋子烘焙在盤面、坑洞或商店裡。
- Landscape 和 portrait 盤面要獨立構圖，不要只裁切同一張圖。
- 盤面必須有 12 個小坑與 2 個商店的清楚視覺位置。
- 盤面外部要透明，讓 CSS 背景能透出來。
- UI 面板中心要低噪音、可讀字。
- 素材必須可商用，來源要記錄在 `SOURCE_NOTES.md` 和 `VISUAL_LICENSE.md`。

## Theme Brief JSON Template

```json
{
  "schemaVersion": 1,
  "pack": {
    "themeSlug": "new-theme-slug",
    "displayName": "New Theme Display Name",
    "assetVersion": "20260619-visual-a",
    "engineCompatibility": "^1.0.0",
    "baseUrl": "./assets/",
    "targetRoot": "visual-packs/new-theme-slug/"
  },
  "themeDirection": {
    "coreTheme": "一句話描述新主題，例如夜市童年記憶、海邊玻璃彈珠、紙劇場等。",
    "moodKeywords": ["readable", "warm", "premium", "playful"],
    "boardLanguage": {
      "materials": ["主要盤面材質"],
      "surfaceBehavior": "反光、粗糙、透明度、磨損、年代感等",
      "composition": "盤面視覺層級與裝飾規則",
      "avoid": ["不要出現的盤面元素"]
    },
    "textSurfaceLanguage": {
      "materials": ["文字面板材質"],
      "surfaceBehavior": "中心低噪音，可承載深色或淺色文字",
      "composition": "邊框、角落、留白規則",
      "avoid": ["不要造成閱讀困難的材質"]
    },
    "backgroundLanguage": {
      "materials": ["背景材質"],
      "surfaceBehavior": "安靜、低對比、襯托盤面",
      "composition": "不要搶過盤面與 UI",
      "avoid": ["固定 UI 形狀", "強烈中心物件"]
    },
    "accentPolicy": {
      "playerOne": "玩家一顏色/符號規則",
      "playerTwo": "玩家二顏色/符號規則",
      "neutral": "中性高光與結果粒子",
      "utility": "焦點、可互動、特殊提示色"
    },
    "avoid": [
      "text",
      "numbers",
      "logos",
      "watermark",
      "baked stones",
      "recognizable third-party IP"
    ]
  },
  "naming": {
    "assetIdStyle": "dot.case semantic ids matching runtime bindings",
    "fileNameStyle": "lowercase kebab-case png filenames",
    "playerOneKey": "ruby",
    "playerTwoKey": "amethyst",
    "neutralKey": "gold"
  },
  "palette": {
    "background": "#07080a",
    "boardBase": "#111315",
    "boardTrim": "#d9b464",
    "textSurface": "#e0cdad",
    "textInk": "#3a2618",
    "playerOne": "#d71932",
    "playerTwo": "#8f32d9",
    "neutral": "#d9b464",
    "utility": "#52c7b8"
  },
  "typography": {
    "bodyFontStack": "\"Segoe UI\", \"Microsoft JhengHei\", \"PingFang TC\", sans-serif",
    "displayFontStack": "\"Brush Script MT\", \"Segoe Script\", \"Lucida Handwriting\", cursive",
    "textReadabilityRule": "Images must not contain text; CSS text must remain readable on all text panels."
  },
  "players": {
    "one": {
      "label": "紅方",
      "sideLabel": "玩家一",
      "stoneTheme": "玩家一棋子描述",
      "sigilTheme": "玩家一徽章描述",
      "particleTheme": "玩家一粒子描述"
    },
    "two": {
      "label": "紫方",
      "sideLabel": "玩家二",
      "stoneTheme": "玩家二棋子描述",
      "sigilTheme": "玩家二徽章描述",
      "particleTheme": "玩家二粒子描述"
    },
    "neutral": {
      "label": "中性",
      "particleTheme": "中性粒子描述"
    }
  },
  "visualPack": {
    "manifest": {
      "schemaVersion": 1,
      "id": "new-theme-slug-visual",
      "displayName": "New Theme Display Name Visual",
      "assetVersion": "20260619-visual-a",
      "engineCompatibility": "^1.0.0",
      "baseUrl": "./assets/",
      "compliance": {
        "source": "original-generated",
        "commercialUseIntended": true,
        "commercialUse": true,
        "thirdPartySourceAssets": false,
        "attributionRequired": false,
        "licenseNote": "Original generated visual assets for Kalah Childhood Memories."
      },
      "layouts": {
        "landscape": { "canvas": [2048, 1024], "physicalModel": "kalah-6x6-landscape" },
        "portrait": { "canvas": [1536, 2048], "physicalModel": "kalah-6x6-portrait" }
      }
    },
    "assets": [],
    "nineSlice": {
      "ui.score.panel": { "left": 96, "right": 96, "top": 72, "bottom": 72 },
      "ui.dialogue.panel": { "left": 128, "right": 128, "top": 88, "bottom": 88 },
      "ui.modal.panel": { "left": 128, "right": 128, "top": 128, "bottom": 128 },
      "ui.result.panel": { "left": 120, "right": 120, "top": 120, "bottom": 120 },
      "ui.button.primary": { "left": 96, "right": 96, "top": 72, "bottom": 72 },
      "ui.button.secondary": { "left": 96, "right": 96, "top": 72, "bottom": 72 }
    }
  },
  "objectPack": {
    "id": "new-theme-slug",
    "displayName": "New Theme Display Name",
    "assetVersion": "20260619-object-a",
    "assets": {
      "playerOneStone": "assets/player-one-stone.png",
      "playerTwoStone": "assets/player-two-stone.png",
      "coinBody": "assets/coin-body.png",
      "playerOneSigil": "assets/player-one-sigil.png",
      "playerTwoSigil": "assets/player-two-sigil.png"
    },
    "players": {
      "1": {
        "label": "紅方",
        "sideLabel": "玩家一",
        "stoneAsset": "playerOneStone",
        "storeSigilAsset": "playerOneSigil",
        "classes": {
          "bodyTurn": "turn-red",
          "turnIndicator": "red",
          "particle": "red",
          "store": "p1-store"
        }
      },
      "2": {
        "label": "紫方",
        "sideLabel": "玩家二",
        "stoneAsset": "playerTwoStone",
        "storeSigilAsset": "playerTwoSigil",
        "classes": {
          "bodyTurn": "turn-purple",
          "turnIndicator": "purple",
          "particle": "purple",
          "store": "p2-store"
        }
      }
    },
    "neutral": {
      "turnAsset": "coinBody",
      "particleClass": "gold",
      "turnIndicatorClass": "pending"
    },
    "coin": {
      "bodyAsset": "coinBody",
      "fallbackAsset": "coinBody",
      "faces": {
        "front": {
          "player": 1,
          "faceAsset": "playerOneSigil",
          "dialogueKey": "coin.redFirst",
          "resultText": {
            "pvp": "正面，紅方先手",
            "pve": "正面，玩家先手"
          }
        },
        "back": {
          "player": 2,
          "faceAsset": "playerTwoSigil",
          "dialogueKey": "coin.purpleFirst",
          "resultText": {
            "pvp": "反面，紫方先手",
            "pve": "反面，AI 先手"
          }
        }
      }
    },
    "cssVars": {
      "ruby": "#d71932",
      "ruby-soft": "rgba(215, 25, 50, 0.34)",
      "amethyst": "#8f32d9",
      "amethyst-soft": "rgba(143, 50, 217, 0.34)",
      "gold": "#d9b464",
      "gold-bright": "#ffe4a1",
      "teal": "#52c7b8"
    }
  },
  "generationRules": {
    "format": "png",
    "colorSpace": "sRGB",
    "alpha": "straight alpha for transparent PNG assets",
    "textPolicy": "no baked text, numbers, labels, logos, signatures, or watermarks",
    "rightsPolicy": "original generated art or project-owned source only",
    "globalNegativePrompt": "text, letters, numbers, logos, watermark, signature, UI labels, score numbers, hands, people, characters, dice, chess pieces, existing game branding, baked stones in pits, blurry crop, low contrast, unreadable holes, jpeg artifacts"
  },
  "acceptance": [
    "All required assets exist at exact pixel sizes.",
    "Manifest JSON parses.",
    "Every manifest asset points to an existing PNG.",
    "No image contains baked text or watermark.",
    "No board image contains baked stones.",
    "Landscape and portrait boards are independently composed.",
    "UI panel centers remain readable.",
    "Source and license notes are present."
  ]
}
```
