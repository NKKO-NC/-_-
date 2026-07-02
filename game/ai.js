import {
  KALAH_BOARD_MODEL,
  PLAYER_ONE,
  PLAYER_TWO,
  getBoardSpaceOwner,
  getOpponentPlayer,
  getOpponentStoreIndex,
  getOppositePitIndex,
  getPlayerPitIndices,
  getStoreIndex,
  isStoreIndex,
} from "../core/object-model.js?v=20260703a";
import { createStandardAiProfile } from "./ai-profile.js?v=20260703a";

function toCountBoard(stoneBoard) {
  return stoneBoard.map((cell) => cell.length);
}

function pickDepthFromBands(remaining, bands) {
  const match = bands.find((band) => band.remainingAtMost == null || remaining <= band.remainingAtMost);
  return match?.depth ?? 3;
}

function getDistinctEntries(entries, excludedSet) {
  return entries.filter((entry) => !excludedSet.has(entry));
}

function createKalahAi(model = KALAH_BOARD_MODEL, profile = createStandardAiProfile(model)) {
  const boardSize = model.boardSize;
  const playerOneStore = getStoreIndex(model, PLAYER_ONE);
  const playerTwoStore = getStoreIndex(model, PLAYER_TWO);
  const playerOnePits = getPlayerPitIndices(model, PLAYER_ONE);
  const playerTwoPits = getPlayerPitIndices(model, PLAYER_TWO);

  function otherPlayer(player) {
    return getOpponentPlayer(model, player);
  }

  function getOwner(index) {
    return getBoardSpaceOwner(model, index);
  }

  function isStore(index) {
    return isStoreIndex(model, index);
  }

  function getStore(player) {
    return getStoreIndex(model, player);
  }

  function getOpponentStore(player) {
    return getOpponentStoreIndex(model, player);
  }

  function getPlayerPits(player) {
    return getPlayerPitIndices(model, player);
  }

  function cloneCountBoard(countBoard) {
    return countBoard.slice();
  }

  function getLegalMovesForCountBoard(countBoard, player) {
    return getPlayerPits(player).filter((index) => countBoard[index] > 0);
  }

  function getSideStoneTotal(countBoard, player) {
    return getPlayerPits(player).reduce((sum, index) => sum + countBoard[index], 0);
  }

  function isTerminalCountBoard(countBoard) {
    return getSideStoneTotal(countBoard, PLAYER_ONE) === 0 || getSideStoneTotal(countBoard, PLAYER_TWO) === 0;
  }

  function finalizeCountBoard(countBoard) {
    const nextBoard = cloneCountBoard(countBoard);
    const playerOneRemaining = getSideStoneTotal(nextBoard, PLAYER_ONE);
    const playerTwoRemaining = getSideStoneTotal(nextBoard, PLAYER_TWO);

    nextBoard[playerOneStore] += playerOneRemaining;
    nextBoard[playerTwoStore] += playerTwoRemaining;

    for (const index of [...playerOnePits, ...playerTwoPits]) {
      nextBoard[index] = 0;
    }

    return nextBoard;
  }

  function simulateCountMove(countBoard, player, startIndex) {
    const ownPits = getPlayerPits(player);
    if (!ownPits.includes(startIndex) || countBoard[startIndex] <= 0) {
      return null;
    }

    const nextBoard = cloneCountBoard(countBoard);
    const ownStore = getStore(player);
    const opponentStore = getOpponentStore(player);
    let stones = nextBoard[startIndex];
    let currentIndex = startIndex;

    nextBoard[startIndex] = 0;

    while (stones > 0) {
      currentIndex = (currentIndex + 1) % boardSize;
      if (currentIndex === opponentStore) {
        continue;
      }

      nextBoard[currentIndex] += 1;
      stones -= 1;
    }

    let captureCount = 0;
    const landedInOwnPit = !isStore(currentIndex) && getOwner(currentIndex) === player;

    if (landedInOwnPit && nextBoard[currentIndex] === 1) {
      const oppositeIndex = getOppositePitIndex(model, currentIndex);
      const oppositeCount = nextBoard[oppositeIndex];

      if (oppositeCount > 0) {
        captureCount = oppositeCount + nextBoard[currentIndex];
        nextBoard[ownStore] += captureCount;
        nextBoard[currentIndex] = 0;
        nextBoard[oppositeIndex] = 0;
      }
    }

    const extraTurn = currentIndex === ownStore;
    let gameOver = false;

    if (isTerminalCountBoard(nextBoard)) {
      const finalBoard = finalizeCountBoard(nextBoard);
      for (let index = 0; index < boardSize; index += 1) {
        nextBoard[index] = finalBoard[index];
      }
      gameOver = true;
    }

    return {
      board: nextBoard,
      nextPlayer: gameOver ? player : extraTurn ? player : otherPlayer(player),
      extraTurn,
      captureCount,
      lastIndex: currentIndex,
      gameOver,
    };
  }

  function getStoreDiff(countBoard, player) {
    return countBoard[getStore(player)] - countBoard[getStore(otherPlayer(player))];
  }

  function getSideStoneDiff(countBoard, player) {
    return getSideStoneTotal(countBoard, player) - getSideStoneTotal(countBoard, otherPlayer(player));
  }

  function countImmediateExtraTurns(countBoard, player) {
    let total = 0;

    for (const move of getLegalMovesForCountBoard(countBoard, player)) {
      const result = simulateCountMove(countBoard, player, move);
      if (result?.extraTurn) {
        total += 1;
      }
    }

    return total;
  }

  function getBestImmediateCapture(countBoard, player) {
    let best = 0;

    for (const move of getLegalMovesForCountBoard(countBoard, player)) {
      const result = simulateCountMove(countBoard, player, move);
      if (result && result.captureCount > best) {
        best = result.captureCount;
      }
    }

    return best;
  }

  function getEndgamePressure(countBoard, player) {
    const ownSide = getSideStoneTotal(countBoard, player);
    const opponentSide = getSideStoneTotal(countBoard, otherPlayer(player));
    const storeDiff = getStoreDiff(countBoard, player);

    if (ownSide <= profile.endgame.sideThreshold || opponentSide <= profile.endgame.sideThreshold) {
      return (
        storeDiff +
        (opponentSide === 0 ? profile.endgame.emptySideBonus : 0) -
        (ownSide === 0 ? profile.endgame.emptySideBonus : 0)
      );
    }

    return 0;
  }

  function evaluateCountBoard(countBoard, player) {
    const storeDiff = getStoreDiff(countBoard, player);
    const sideStoneDiff = getSideStoneDiff(countBoard, player);
    const ownExtraTurns = countImmediateExtraTurns(countBoard, player);
    const opponentExtraTurns = countImmediateExtraTurns(countBoard, otherPlayer(player));
    const ownCapturePotential = getBestImmediateCapture(countBoard, player);
    const opponentCaptureThreat = getBestImmediateCapture(countBoard, otherPlayer(player));
    const endgamePressure = getEndgamePressure(countBoard, player);

    return (
      storeDiff * profile.evaluationWeights.storeDiff +
      sideStoneDiff * profile.evaluationWeights.sideStoneDiff +
      ownExtraTurns * profile.evaluationWeights.ownExtraTurns -
      opponentExtraTurns * profile.evaluationWeights.opponentExtraTurns +
      ownCapturePotential * profile.evaluationWeights.ownCapturePotential -
      opponentCaptureThreat * profile.evaluationWeights.opponentCaptureThreat +
      endgamePressure * profile.evaluationWeights.endgamePressure
    );
  }

  function analyzeMove(countBoard, player, move) {
    const beforeStoreDiff = getStoreDiff(countBoard, player);
    const beforeStore = countBoard[getStore(player)];
    const result = simulateCountMove(countBoard, player, move);

    if (!result) {
      return null;
    }

    const immediateStoreGain = result.board[getStore(player)] - beforeStore;
    const storeDiffAfter = getStoreDiff(result.board, player);
    const opponentBestCapture = result.gameOver ? 0 : getBestImmediateCapture(result.board, result.nextPlayer);
    const opponentBestExtraTurn = result.gameOver ? 0 : countImmediateExtraTurns(result.board, result.nextPlayer);
    const evaluation = evaluateCountBoard(result.board, player);
    const greedyScore =
      immediateStoreGain * profile.greedyWeights.immediateStoreGain +
      result.captureCount * profile.greedyWeights.captureCount +
      (result.extraTurn ? profile.greedyWeights.extraTurn : 0) +
      storeDiffAfter * profile.greedyWeights.storeDiffAfter;
    const easyScore =
      immediateStoreGain * profile.easyWeights.immediateStoreGain +
      result.captureCount * profile.easyWeights.captureCount +
      (result.extraTurn ? profile.easyWeights.extraTurn : 0) +
      evaluation * profile.easyWeights.evaluationFactor -
      opponentBestCapture * profile.easyWeights.opponentBestCapture;
    const searchPriority =
      (result.extraTurn ? profile.searchPriorityWeights.extraTurn : 0) +
      result.captureCount * profile.searchPriorityWeights.captureCount +
      immediateStoreGain * profile.searchPriorityWeights.immediateStoreGain -
      opponentBestCapture * profile.searchPriorityWeights.opponentBestCapture -
      opponentBestExtraTurn * profile.searchPriorityWeights.opponentBestExtraTurn;
    const severeBlunder =
      !result.gameOver &&
      !result.extraTurn &&
      result.captureCount === 0 &&
      opponentBestCapture >= profile.risk.severeBlunderCaptureThreat &&
      storeDiffAfter <= beforeStoreDiff;

    return {
      move,
      result,
      evaluation,
      easyScore,
      greedyScore,
      searchPriority,
      immediateStoreGain,
      opponentBestCapture,
      opponentBestExtraTurn,
      severeBlunder,
    };
  }

  function analyzeMoves(countBoard, player) {
    return getLegalMovesForCountBoard(countBoard, player)
      .map((move) => analyzeMove(countBoard, player, move))
      .filter(Boolean);
  }

  function orderMovesForSearch(countBoard, player) {
    return analyzeMoves(countBoard, player)
      .sort((a, b) => b.searchPriority - a.searchPriority)
      .map((entry) => entry.move);
  }

  function searchCountBoard(countBoard, player, depth, alpha, beta, rootPlayer) {
    if (depth <= 0 || isTerminalCountBoard(countBoard)) {
      return evaluateCountBoard(countBoard, rootPlayer);
    }

    const moves = orderMovesForSearch(countBoard, player);
    if (moves.length === 0) {
      return evaluateCountBoard(countBoard, rootPlayer);
    }

    if (player === rootPlayer) {
      let best = -Infinity;

      for (const move of moves) {
        const result = simulateCountMove(countBoard, player, move);
        if (!result) {
          continue;
        }

        const nextDepth = result.extraTurn ? depth : depth - 1;
        const value = searchCountBoard(
          result.board,
          result.nextPlayer,
          nextDepth,
          alpha,
          beta,
          rootPlayer
        );

        best = Math.max(best, value);
        alpha = Math.max(alpha, best);

        if (beta <= alpha) {
          break;
        }
      }

      return best;
    }

    let best = Infinity;

    for (const move of moves) {
      const result = simulateCountMove(countBoard, player, move);
      if (!result) {
        continue;
      }

      const nextDepth = result.extraTurn ? depth : depth - 1;
      const value = searchCountBoard(
        result.board,
        result.nextPlayer,
        nextDepth,
        alpha,
        beta,
        rootPlayer
      );

      best = Math.min(best, value);
      beta = Math.min(beta, best);

      if (beta <= alpha) {
        break;
      }
    }

    return best;
  }

  function getMediumDepth(countBoard) {
    const remaining = getSideStoneTotal(countBoard, PLAYER_ONE) + getSideStoneTotal(countBoard, PLAYER_TWO);
    return pickDepthFromBands(remaining, profile.mediumDepthBands);
  }

  function getHardDepth(countBoard) {
    const remaining = getSideStoneTotal(countBoard, PLAYER_ONE) + getSideStoneTotal(countBoard, PLAYER_TWO);
    return pickDepthFromBands(remaining, profile.hardDepthBands);
  }

  function weightedChoice(items, getWeight) {
    let totalWeight = 0;
    const weighted = items.map((item) => {
      const weight = Math.max(0.01, getWeight(item));
      totalWeight += weight;
      return { item, weight };
    });

    let threshold = Math.random() * totalWeight;

    for (const entry of weighted) {
      threshold -= entry.weight;
      if (threshold <= 0) {
        return entry.item;
      }
    }

    return weighted[weighted.length - 1]?.item ?? null;
  }

  function clampPoolByScore(entries, key, margin) {
    if (entries.length === 0) {
      return entries;
    }

    const best = entries[0][key];
    return entries.filter((entry) => best - entry[key] <= margin);
  }

  function chooseEasyMove(countBoard, player) {
    const moves = analyzeMoves(countBoard, player).sort((a, b) => b.easyScore - a.easyScore);
    if (moves.length === 0) {
      return null;
    }

    const tacticalMoves = moves.filter(
      (entry) => entry.result.extraTurn || entry.result.captureCount > 0 || entry.immediateStoreGain >= 2
    );
    const preferredPool =
      tacticalMoves.length > 0
        ? clampPoolByScore(tacticalMoves, "easyScore", profile.easySelection.preferredMargin)
        : clampPoolByScore(moves, "easyScore", profile.easySelection.fallbackMargin).slice(0, Math.min(3, moves.length));

    const fallbackPool = moves.slice(0, Math.min(4, moves.length));

    if (Math.random() < profile.easySelection.preferredShare) {
      return (
        weightedChoice(preferredPool, (entry) => entry.easyScore + profile.easySelection.preferredWeightBase)?.move ??
        fallbackPool[0].move
      );
    }

    return (
      weightedChoice(fallbackPool, (entry) => entry.easyScore + profile.easySelection.fallbackWeightBase)?.move ??
      fallbackPool[0].move
    );
  }

  function scoreMoveWithSearch(countBoard, player, analysis, depth) {
    const nextDepth = analysis.result.extraTurn ? depth : depth - 1;
    return searchCountBoard(
      analysis.result.board,
      analysis.result.nextPlayer,
      Math.max(0, nextDepth),
      -Infinity,
      Infinity,
      player
    );
  }

  function filterMediumCandidates(analyses) {
    const safeCandidates = analyses.filter((entry) => !entry.severeBlunder);
    return safeCandidates.length > 0 ? safeCandidates : analyses;
  }

  function chooseMediumMove(countBoard, player) {
    const analyses = analyzeMoves(countBoard, player);
    if (analyses.length === 0) {
      return null;
    }

    const depth = getMediumDepth(countBoard);
    const filtered = filterMediumCandidates(analyses);
    const evaluated = filtered
      .map((entry) => ({
        ...entry,
        searchValue: scoreMoveWithSearch(countBoard, player, entry, depth),
      }))
      .sort((a, b) => b.searchValue - a.searchValue);

    const smartPool = clampPoolByScore(evaluated, "searchValue", profile.mediumSelection.smartMargin);
    const greedyPool = analyses
      .map((entry) => ({
        ...entry,
        searchValue: scoreMoveWithSearch(
          countBoard,
          player,
          entry,
          Math.max(profile.mediumSelection.minimumSearchDepth, depth - 1)
        ),
      }))
      .sort((a, b) => b.greedyScore - a.greedyScore);
    const greedyTop = clampPoolByScore(greedyPool, "greedyScore", profile.mediumSelection.greedyMargin);
    const sillyPool = [...greedyPool]
      .sort((a, b) => a.searchValue - b.searchValue)
      .slice(0, Math.max(1, Math.ceil(greedyPool.length / 2)));
    const roll = Math.random();

    if (roll < profile.mediumSelection.smartShare) {
      return (
        weightedChoice(smartPool, (entry) => entry.searchValue + profile.mediumSelection.smartWeightBase)?.move ??
        evaluated[0].move
      );
    }

    if (roll < profile.mediumSelection.smartShare + profile.mediumSelection.greedyShare) {
      return (
        weightedChoice(greedyTop, (entry) => entry.greedyScore + profile.mediumSelection.greedyWeightBase)?.move ??
        greedyPool[0].move
      );
    }

    return (
      weightedChoice(
        sillyPool,
        (entry) => Math.max(1, profile.mediumSelection.sillyWeightBase - entry.searchValue)
      )?.move ?? greedyPool[greedyPool.length - 1].move
    );
  }

  function chooseHardMove(countBoard, player) {
    const analyses = analyzeMoves(countBoard, player);
    if (analyses.length === 0) {
      return null;
    }

    const depth = getHardDepth(countBoard);
    const evaluated = analyses
      .map((entry) => ({
        ...entry,
        searchValue: scoreMoveWithSearch(countBoard, player, entry, depth),
      }))
      .sort((a, b) => b.searchValue - a.searchValue);
    const smartPool = clampPoolByScore(evaluated, "searchValue", profile.hardSelection.searchMargin);
    const smartSet = new Set(smartPool);
    const remainingPool = getDistinctEntries(evaluated, smartSet);
    const nextBestPool =
      clampPoolByScore(remainingPool, "searchValue", profile.hardSelection.nextBestMargin).slice(
        0,
        Math.max(1, Math.min(2, remainingPool.length))
      ) || [];
    const greedyPool = [...evaluated].sort((a, b) => b.greedyScore - a.greedyScore);
    const greedyTop = clampPoolByScore(greedyPool, "greedyScore", profile.hardSelection.greedyMargin);
    const roll = Math.random();

    if (roll < profile.hardSelection.smartShare) {
      return (
        weightedChoice(smartPool, (entry) => entry.searchValue + profile.hardSelection.smartWeightBase)?.move ??
        evaluated[0].move
      );
    }

    if (roll < profile.hardSelection.smartShare + profile.hardSelection.nextBestShare && nextBestPool.length > 0) {
      return (
        weightedChoice(nextBestPool, (entry) => entry.searchValue + profile.hardSelection.nextBestWeightBase)?.move ??
        nextBestPool[0].move
      );
    }

    return (
      weightedChoice(greedyTop, (entry) => entry.greedyScore + profile.hardSelection.greedyWeightBase)?.move ??
      greedyPool[0].move
    );
  }

  function chooseMove({ countBoard, stoneBoard, player, difficulty = "medium" }) {
    const board = countBoard ?? toCountBoard(stoneBoard);

    if (difficulty === "easy") {
      return chooseEasyMove(board, player);
    }

    if (difficulty === "hard") {
      return chooseHardMove(board, player);
    }

    return chooseMediumMove(board, player);
  }

  return Object.freeze({
    chooseMove,
    evaluateCountBoard,
    simulateCountMove,
    toCountBoard,
  });
}

export { createKalahAi, toCountBoard };
