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

function scaleThreshold(total, ratio, minimum) {
  return Math.max(minimum, Math.round(total * ratio));
}

function createStandardAiProfile({ startingStonesPerPit, pitsPerSide }) {
  const initialTotalStones = pitsPerSide * 2 * startingStonesPerPit;

  return deepFreeze({
    endgame: {
      sideThreshold: startingStonesPerPit,
      emptySideBonus: startingStonesPerPit,
    },
    evaluationWeights: {
      storeDiff: 12,
      sideStoneDiff: 2,
      ownExtraTurns: 7,
      opponentExtraTurns: 5,
      ownCapturePotential: 5,
      opponentCaptureThreat: 6,
      endgamePressure: 8,
    },
    searchPriorityWeights: {
      extraTurn: 100,
      captureCount: 18,
      immediateStoreGain: 7,
      opponentBestCapture: 4,
      opponentBestExtraTurn: 6,
    },
    greedyWeights: {
      immediateStoreGain: 10,
      captureCount: 7,
      extraTurn: 9,
      storeDiffAfter: 2,
    },
    easyWeights: {
      immediateStoreGain: 6,
      captureCount: 8,
      extraTurn: 12,
      evaluationFactor: 0.35,
      opponentBestCapture: 4,
    },
    easySelection: {
      preferredShare: 0.82,
      preferredMargin: 10,
      fallbackMargin: 8,
      preferredWeightBase: 24,
      fallbackWeightBase: 8,
    },
    mediumDepthBands: [
      { remainingAtMost: scaleThreshold(initialTotalStones, 18 / 72, 10), depth: 4 },
      { depth: 3 },
    ],
    mediumSelection: {
      smartShare: 0.7,
      greedyShare: 0.29,
      sillyShare: 0.01,
      smartMargin: 6,
      greedyMargin: 8,
      smartWeightBase: 48,
      greedyWeightBase: 20,
      sillyWeightBase: 24,
      minimumSearchDepth: 2,
    },
    hardDepthBands: [
      { remainingAtMost: scaleThreshold(initialTotalStones, 14 / 72, 8), depth: 8 },
      { remainingAtMost: scaleThreshold(initialTotalStones, 24 / 72, 12), depth: 7 },
      { depth: 6 },
    ],
    hardSelection: {
      searchMargin: 2,
      nextBestMargin: 5,
      greedyMargin: 6,
      smartShare: 0.9,
      nextBestShare: 0.09,
      greedyShare: 0.01,
      smartWeightBase: 64,
      nextBestWeightBase: 40,
      greedyWeightBase: 18,
    },
    risk: {
      severeBlunderCaptureThreat: Math.max(3, Math.round(startingStonesPerPit * (4 / 6))),
    },
  });
}

export { createStandardAiProfile };
