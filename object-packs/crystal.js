import { defineObjectPack } from "../core/object-pack-manifest.js?v=20260619a";

const CRYSTAL_OBJECT_PACK = defineObjectPack({
  id: "crystal-childhood",
  displayName: "Crystal Childhood",
  assetVersion: "20260619a",
  assets: {
    rubyStone: "assets/ruby-gem.png",
    amethystStone: "assets/amethyst-gem.png",
    coinBody: "assets/Coin.png",
    dragonSigil: "assets/Dragon.png",
    shieldSigil: "assets/Shield.png",
  },
  players: {
    1: {
      label: "\u7d05\u65b9",
      sideLabel: "\u7d05\u5bf6\u77f3\u65b9",
      stoneAsset: "rubyStone",
      storeSigilAsset: "dragonSigil",
      classes: {
        bodyTurn: "turn-red",
        turnIndicator: "red",
        particle: "red",
        store: "p1-store",
      },
    },
    2: {
      label: "\u7d2b\u65b9",
      sideLabel: "\u7d2b\u6c34\u6676\u65b9",
      stoneAsset: "amethystStone",
      storeSigilAsset: "shieldSigil",
      classes: {
        bodyTurn: "turn-purple",
        turnIndicator: "purple",
        particle: "purple",
        store: "p2-store",
      },
    },
  },
  neutral: {
    turnAsset: "coinBody",
    particleClass: "gold",
    turnIndicatorClass: "pending",
  },
  coin: {
    bodyAsset: "coinBody",
    fallbackAsset: "coinBody",
    faces: {
      front: {
        player: 1,
        faceAsset: "dragonSigil",
        dialogueKey: "coin.redFirst",
        resultText: {
          pvp: "\u6b63\u9762\uff0c\u7d05\u65b9\u5148\u624b",
          pve: "\u6b63\u9762\uff0c\u73a9\u5bb6\u5148\u624b",
        },
      },
      back: {
        player: 2,
        faceAsset: "shieldSigil",
        dialogueKey: "coin.purpleFirst",
        resultText: {
          pvp: "\u53cd\u9762\uff0c\u7d2b\u65b9\u5148\u624b",
          pve: "\u53cd\u9762\uff0cAI \u5148\u624b",
        },
      },
    },
  },
  cssVars: {
    ruby: "#d71932",
    "ruby-soft": "rgba(215, 25, 50, 0.34)",
    amethyst: "#8f32d9",
    "amethyst-soft": "rgba(143, 50, 217, 0.34)",
    gold: "#d9b464",
    "gold-bright": "#ffe4a1",
    teal: "#52c7b8",
  },
});

export { CRYSTAL_OBJECT_PACK };
