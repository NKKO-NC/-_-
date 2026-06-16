const OBJECT_PACK_MANIFEST = Object.freeze({
  version: 1,
  requiredTopLevel: ["id", "displayName", "assetVersion", "assets", "players", "neutral", "coin", "cssVars"],
  requiredPlayerFields: ["label", "sideLabel", "stoneAsset", "storeSigilAsset", "classes"],
  requiredPlayerClassFields: ["bodyTurn", "turnIndicator", "particle", "store"],
  requiredNeutralFields: ["turnAsset", "particleClass", "turnIndicatorClass"],
  requiredCoinFields: ["bodyAsset", "fallbackAsset", "faces"],
  requiredCoinFaceFields: ["player", "faceAsset", "dialogueKey", "resultText"],
});

function defineObjectPack(pack) {
  const errors = validateObjectPack(pack);

  if (errors.length > 0) {
    throw new Error(`Invalid object pack "${pack?.id || "unknown"}": ${errors.join("; ")}`);
  }

  return deepFreeze(pack);
}

function validateObjectPack(pack) {
  const errors = [];

  if (!isRecord(pack)) {
    return ["pack must be an object"];
  }

  for (const field of OBJECT_PACK_MANIFEST.requiredTopLevel) {
    requireField(pack, field, "pack", errors);
  }

  if (isRecord(pack.players)) {
    for (const [playerId, player] of Object.entries(pack.players)) {
      validatePlayerSkin(playerId, player, errors);
    }
  }

  if (isRecord(pack.neutral)) {
    for (const field of OBJECT_PACK_MANIFEST.requiredNeutralFields) {
      requireField(pack.neutral, field, "neutral", errors);
    }
  }

  if (isRecord(pack.coin)) {
    for (const field of OBJECT_PACK_MANIFEST.requiredCoinFields) {
      requireField(pack.coin, field, "coin", errors);
    }

    if (isRecord(pack.coin.faces)) {
      for (const [faceId, face] of Object.entries(pack.coin.faces)) {
        for (const field of OBJECT_PACK_MANIFEST.requiredCoinFaceFields) {
          requireField(face, field, `coin.faces.${faceId}`, errors);
        }
      }
    }
  }

  return errors;
}

function validatePlayerSkin(playerId, player, errors) {
  if (!isRecord(player)) {
    errors.push(`players.${playerId} must be an object`);
    return;
  }

  for (const field of OBJECT_PACK_MANIFEST.requiredPlayerFields) {
    requireField(player, field, `players.${playerId}`, errors);
  }

  if (isRecord(player.classes)) {
    for (const field of OBJECT_PACK_MANIFEST.requiredPlayerClassFields) {
      requireField(player.classes, field, `players.${playerId}.classes`, errors);
    }
  }
}

function requireField(object, field, path, errors) {
  if (object?.[field] == null) {
    errors.push(`${path}.${field} is required`);
  }
}

function getPlayerSkin(pack, player) {
  return pack.players[String(player)];
}

function getNeutralSkin(pack) {
  return pack.neutral;
}

function getCoinFace(pack, face) {
  return pack.coin.faces[face];
}

function getAssetUrl(pack, assetId) {
  const path = pack.assets[assetId];

  if (!path) {
    throw new Error(`Object pack "${pack.id}" is missing asset "${assetId}".`);
  }

  const versionedPath = `${path}?v=${pack.assetVersion}`;

  if (globalThis.document?.baseURI) {
    return new URL(versionedPath, document.baseURI).href;
  }

  return versionedPath;
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) {
    return value;
  }

  Object.freeze(value);

  for (const child of Object.values(value)) {
    deepFreeze(child);
  }

  return value;
}

function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export {
  OBJECT_PACK_MANIFEST,
  defineObjectPack,
  getAssetUrl,
  getCoinFace,
  getNeutralSkin,
  getPlayerSkin,
  validateObjectPack,
};
