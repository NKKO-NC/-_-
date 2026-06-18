import {
  getAssetUrl,
  getCoinFace,
  getNeutralSkin,
  getPlayerSkin,
} from "./object-pack-manifest.js?v=20260618d";

function createObjectPackRuntime(pack) {
  function getPackAssetUrl(assetId) {
    return getAssetUrl(pack, assetId);
  }

  function getPlayerStoneUrl(player) {
    return getPackAssetUrl(getPlayerSkin(pack, player).stoneAsset);
  }

  function getPlayerStoreSigilUrl(player) {
    return getPackAssetUrl(getPlayerSkin(pack, player).storeSigilAsset);
  }

  function getPlayerCssClass(player, className) {
    return getPlayerSkin(pack, player).classes[className];
  }

  function getTurnBodyClasses() {
    return Object.values(pack.players).map((player) => player.classes.bodyTurn);
  }

  function applyCssVars(root = globalThis.document?.documentElement) {
    if (!root) return;

    root.dataset.objectPack = pack.id;

    for (const [name, value] of Object.entries(pack.cssVars)) {
      root.style.setProperty(`--${name}`, value);
    }
  }

  function applySkin({ coinTossButton } = {}) {
    applyCssVars();

    coinTossButton?.style.setProperty(
      "--coin-fallback-image",
      `url("${getPackAssetUrl(pack.coin.fallbackAsset)}")`
    );
  }

  return Object.freeze({
    pack,
    applySkin,
    getAssetUrl: getPackAssetUrl,
    getCoinFace: (face) => getCoinFace(pack, face),
    getNeutralSkin: () => getNeutralSkin(pack),
    getPlayerCssClass,
    getPlayerSkin: (player) => getPlayerSkin(pack, player),
    getPlayerStoneUrl,
    getPlayerStoreSigilUrl,
    getTurnBodyClasses,
  });
}

export { createObjectPackRuntime };
