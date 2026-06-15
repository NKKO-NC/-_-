import { CoinTossScene } from "./coin/index.js?v=20260616f";
import { getDialogue, resetDialogueHistory } from "./dialoguePicker.js?v=20260616f";

const STARTING_STONES = 6;
const PLAYER_ONE_STORE = 6;
const PLAYER_TWO_STORE = 13;
const BOARD_SIZE = 14;
const RUBY_SRC = "assets/ruby-gem.png";
const AMETHYST_SRC = "assets/amethyst-gem.png";

const TEXT = {
  red: "\u7d05\u65b9",
  purple: "\u7d2b\u65b9",
  player: "\u73a9\u5bb6",
  ai: "AI",
  turn: "\u884c\u68cb",
  extra: "\u518d\u884c\u4e00\u624b",
  capture: "\u5403\u5b50",
  draw: "\u5e73\u5c40",
  win: "\u52dd",
  store: "\u91d1\u5eab",
  pit: "\u7a74",
  stones: "\u5b50",
  coinReady: "\u9ede\u64ca\u9280\u5e63\u6c7a\u5b9a\u5148\u624b",
  coinFlipping: "\u9280\u5e63\u7ffb\u8f49\u4e2d",
  coinFront: "\u6b63\u9762\u897f\u6d0b\u9f8d\uff0c\u7d05\u65b9\u5148\u624b",
  coinBack: "\u53cd\u9762\u76fe\u528d\uff0c\u7d2b\u65b9\u5148\u624b",
  result: "\u7d50\u7b97",
  newRound: "\u518d\u958b\u4e00\u5c40",
  pvpHint: "\u96d9\u4eba\u5c0d\u6230\uff1a\u540c\u6a5f\u8f2a\u6d41\u64cd\u4f5c",
  pveHint: "\u55ae\u4eba\u5c0d\u6230\uff1a\u73a9\u5bb6 = \u7d05\u65b9\uff0cAI = \u7d2b\u65b9",
  aiThinking: "AI \u601d\u8003\u4e2d...",
};

const DIFFICULTY_LABELS = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const mainMenu = document.querySelector("#mainMenu");
const gameScreen = document.querySelector("#gameScreen");
const startButton = document.querySelector("#startButton");
const resetButton = document.querySelector("#resetButton");
const menuButton = document.querySelector("#menuButton");
const playerOneScore = document.querySelector("#playerOneScore");
const playerTwoScore = document.querySelector("#playerTwoScore");
const playerOneLabel = playerOneScore.querySelector("span");
const playerTwoLabel = playerTwoScore.querySelector("span");
const turnIndicator = document.querySelector("#turnIndicator");
const turnEmblem = document.querySelector("#turnEmblem");
const modePvpButton = document.querySelector("#modePvpButton");
const modePveButton = document.querySelector("#modePveButton");
const difficultyField = document.querySelector("#difficultyField");
const difficultyEasyButton = document.querySelector("#difficultyEasyButton");
const difficultyMediumButton = document.querySelector("#difficultyMediumButton");
const difficultyHardButton = document.querySelector("#difficultyHardButton");
const controlHint = document.querySelector("#controlHint");
const aiDialogue = document.querySelector("#aiDialogue");
const aiDialogueSpeaker = document.querySelector("#aiDialogueSpeaker");
const aiDialogueLine = document.querySelector("#aiDialogueLine");
const rulesButton = document.querySelector("#rulesButton");
const settingsButton = document.querySelector("#settingsButton");
const rulesOverlay = document.querySelector("#rulesOverlay");
const settingsOverlay = document.querySelector("#settingsOverlay");
const rulesCloseButton = document.querySelector("#rulesCloseButton");
const settingsCloseButton = document.querySelector("#settingsCloseButton");
const pitRomanButton = document.querySelector("#pitRomanButton");
const pitArabicButton = document.querySelector("#pitArabicButton");
const coinTossOverlay = document.querySelector("#coinTossOverlay");
const coinTossButton = document.querySelector("#coinTossButton");
const coinCanvas = document.querySelector("#coinCanvas");
const coinTossStatus = document.querySelector("#coinTossStatus");
const resultOverlay = document.querySelector("#resultOverlay");
const resultPanel = document.querySelector("#resultPanel");
const resultKicker = document.querySelector("#resultKicker");
const resultTitle = document.querySelector("#resultTitle");
const resultScore = document.querySelector("#resultScore");
const resultResetButton = document.querySelector("#resultResetButton");
const resultMenuButton = document.querySelector("#resultMenuButton");
const particleField = document.querySelector("#particleField");
const ASSET_VERSION = "20260616f";

function setCoinFallbackVisual() {
  coinTossButton.classList.add("is-fallback");
  coinCanvas.setAttribute("aria-hidden", "true");
}

function createFallbackCoinScene() {
  setCoinFallbackVisual();

  return {
    async play() {
      return false;
    },
    reset() {},
  };
}

function createCoinScene() {
  try {
    const scene = new CoinTossScene({
      canvas: coinCanvas,
      coinSrc: `assets/Coin.png?v=${ASSET_VERSION}`,
      dragonSrc: `assets/Dragon.png?v=${ASSET_VERSION}`,
      shieldSrc: `assets/Shield.png?v=${ASSET_VERSION}`,
    });

    scene.ready = scene.ready.catch((error) => {
      console.warn("Coin scene initialization failed. Falling back to static coin.", error);
      setCoinFallbackVisual();
      return null;
    });

    return {
      async play(face) {
        try {
          return await scene.play(face);
        } catch (error) {
          console.warn("Coin scene animation failed. Falling back to static coin.", error);
          setCoinFallbackVisual();
          return false;
        }
      },
      reset() {
        try {
          scene.reset();
        } catch (error) {
          console.warn("Coin scene reset failed. Falling back to static coin.", error);
          setCoinFallbackVisual();
        }
      },
    };
  } catch (error) {
    console.warn("Coin scene setup failed. Falling back to static coin.", error);
    return createFallbackCoinScene();
  }
}

const coinScene = createCoinScene();

const topPits = [12, 11, 10, 9, 8, 7];
const bottomPits = [0, 1, 2, 3, 4, 5];
const playerTwoPits = [7, 8, 9, 10, 11, 12];

const pitSlots = [
  [50, 50],
  [36, 38],
  [62, 37],
  [64, 60],
  [37, 63],
  [50, 29],
  [73, 49],
  [50, 74],
  [25, 49],
  [35, 25],
  [65, 25],
  [76, 66],
  [25, 67],
  [50, 18],
  [82, 41],
  [50, 84],
  [18, 42],
  [70, 78],
];

const storeSlots = [
  [50, 26],
  [38, 35],
  [62, 35],
  [50, 44],
  [37, 52],
  [63, 52],
  [50, 60],
  [36, 68],
  [64, 68],
  [50, 76],
  [29, 42],
  [71, 42],
  [28, 58],
  [72, 58],
  [50, 18],
  [40, 82],
  [60, 82],
  [27, 28],
  [73, 28],
  [26, 73],
  [74, 73],
  [50, 90],
];

const state = {
  board: createInitialBoard(),
  activePlayer: 1,
  gameOver: false,
  animating: false,
  awaitingCoinToss: true,
  coinTossing: false,
  coinResultHolding: false,
  coinResult: null,
  resultShown: false,
  animationToken: 0,
  lastDropIndex: null,
  lastDropKey: 0,
  message: "",
  layoutSalt: Array.from({ length: BOARD_SIZE }, () => Math.random() * 100000),
  screen: "menu",
  mode: "pve",
  aiDifficulty: "medium",
  humanPlayer: 1,
  aiPlayer: 2,
  aiThinking: false,
  aiThinkDelayMs: 520,
  pitNumberStyle: "roman",
  aiDialogue: {
    speaker: "\u65c1\u767d",
    line: "\u9078\u64c7\u6a21\u5f0f\u5f8c\uff0c\u95dc\u9375\u5c40\u9762\u6703\u5728\u9019\u88e1\u88dc\u4e0a\u53f0\u8a5e\u3002",
  },
};

const modeButtons = {
  pvp: modePvpButton,
  pve: modePveButton,
};

const difficultyButtons = {
  easy: difficultyEasyButton,
  medium: difficultyMediumButton,
  hard: difficultyHardButton,
};

const NARRATOR = "\u65c1\u767d";
const SIDE_LABELS = {
  1: "\u7d05\u5bf6\u77f3\u65b9",
  2: "\u7d2b\u6c34\u6676\u65b9",
};
const LOW_SIDE_THRESHOLD = 8;

function createInitialBoard() {
  return Array.from({ length: BOARD_SIZE }, (_, index) => {
    if (index >= 0 && index <= 5) {
      return Array(STARTING_STONES).fill(1);
    }

    if (index >= 7 && index <= 12) {
      return Array(STARTING_STONES).fill(2);
    }

    return [];
  });
}

function resetGame() {
  state.animationToken += 1;
  state.screen = "game";
  state.board = createInitialBoard();
  state.activePlayer = 1;
  state.gameOver = false;
  state.animating = false;
  state.awaitingCoinToss = true;
  state.coinTossing = false;
  state.coinResultHolding = false;
  state.coinResult = null;
  state.resultShown = false;
  state.lastDropIndex = null;
  state.lastDropKey = 0;
  state.aiThinking = false;
  state.layoutSalt = Array.from({ length: BOARD_SIZE }, () => Math.random() * 100000);
  state.message = TEXT.coinReady;
  resetDialogueHistory();
  setAiDialogue(NARRATOR, getDialogue("coin.beforeToss"));
  hideResultOverlay();
  resetCoinVisual();
  render();
}

function showMainMenu() {
  state.animationToken += 1;
  state.screen = "menu";
  state.gameOver = false;
  state.animating = false;
  state.awaitingCoinToss = false;
  state.coinTossing = false;
  state.coinResultHolding = false;
  state.aiThinking = false;
  state.resultShown = false;
  state.lastDropIndex = null;
  state.message = "";
  setAiDialogue("", "");
  hideResultOverlay();
  resetCoinVisual();
  coinTossOverlay.hidden = true;
  coinTossOverlay.classList.remove("is-visible");
  document.body.classList.remove("turn-red", "turn-purple");
  renderInterfaceState();
}

function otherPlayer(player) {
  return player === 1 ? 2 : 1;
}

function getOwner(index) {
  if (index >= 0 && index <= 5) return 1;
  if (index >= 7 && index <= 12) return 2;
  if (index === PLAYER_ONE_STORE) return 1;
  if (index === PLAYER_TWO_STORE) return 2;
  return 0;
}

function isStore(index) {
  return index === PLAYER_ONE_STORE || index === PLAYER_TWO_STORE;
}

function getStore(player) {
  return player === 1 ? PLAYER_ONE_STORE : PLAYER_TWO_STORE;
}

function getOpponentStore(player) {
  return player === 1 ? PLAYER_TWO_STORE : PLAYER_ONE_STORE;
}

function getPlayerPits(player) {
  return player === 1 ? bottomPits : playerTwoPits;
}

function getStoneCount(index) {
  return state.board[index].length;
}

function isAiEnabled() {
  return state.mode === "pve";
}

function isAiPlayer(player) {
  return isAiEnabled() && player === state.aiPlayer;
}

function isAiTurn() {
  return isAiPlayer(state.activePlayer);
}

function canSelect(index) {
  return (
    !state.gameOver &&
    !state.animating &&
    !state.aiThinking &&
    !state.awaitingCoinToss &&
    !isStore(index) &&
    getOwner(index) === state.activePlayer &&
    getStoneCount(index) > 0 &&
    !isAiTurn()
  );
}

function getPlayerName(player) {
  if (state.mode === "pve") {
    return player === 1 ? TEXT.player : TEXT.ai;
  }

  return player === 1 ? TEXT.red : TEXT.purple;
}

function getSideName(player) {
  return SIDE_LABELS[player] ?? "";
}

function getSideStoneCount(board, player) {
  const pits = player === 1 ? bottomPits : playerTwoPits;
  return pits.reduce((total, index) => total + board[index].length, 0);
}

function getAdvantageBucket(diff) {
  const absDiff = Math.abs(diff);

  if (absDiff === 0) {
    return "tied";
  }

  if (absDiff <= 3) {
    return "slightLead";
  }

  if (absDiff <= 8) {
    return "comebackPossible";
  }

  return absDiff <= 12 ? "bigLead" : "desperate";
}

function getAdvantageDialogue(redScore, purpleScore) {
  const diff = redScore - purpleScore;
  const bucket = getAdvantageBucket(diff);

  if (bucket === "tied") {
    return getDialogue("advantage.tied");
  }

  const leader = diff > 0 ? getSideName(1) : getSideName(2);
  const trailer = diff > 0 ? getSideName(2) : getSideName(1);

  if (bucket === "slightLead") {
    return getDialogue("advantage.slightLead", { leader });
  }

  if (bucket === "comebackPossible") {
    return getDialogue("advantage.comebackPossible", { trailer });
  }

  return getDialogue(`advantage.${bucket}`, bucket === "bigLead" ? { leader } : { trailer });
}

function getEndDialogue() {
  const redScore = getStoneCount(PLAYER_ONE_STORE);
  const purpleScore = getStoneCount(PLAYER_TWO_STORE);

  if (redScore === purpleScore) {
    return getDialogue("endgame.draw");
  }

  return redScore > purpleScore ? getDialogue("endgame.redWins") : getDialogue("endgame.purpleWins");
}

function getPostMoveDialogue({
  movingPlayer,
  ended,
  landedInStore,
  captureCount,
  preRedScore,
  prePurpleScore,
  preRedSide,
  prePurpleSide,
}) {
  if (ended) {
    return getEndDialogue();
  }

  if (captureCount > 0) {
    return getDialogue("move.capture");
  }

  if (landedInStore) {
    return getDialogue("move.extraTurn");
  }

  const postRedScore = getStoneCount(PLAYER_ONE_STORE);
  const postPurpleScore = getStoneCount(PLAYER_TWO_STORE);
  const movingScoreGain =
    (movingPlayer === 1 ? postRedScore - preRedScore : postPurpleScore - prePurpleScore);

  if (movingScoreGain >= 3) {
    return getDialogue("move.bigStoreGain");
  }

  const preBucket = getAdvantageBucket(preRedScore - prePurpleScore);
  const postBucket = getAdvantageBucket(postRedScore - postPurpleScore);
  if (preBucket !== postBucket) {
    return getAdvantageDialogue(postRedScore, postPurpleScore);
  }

  const postRedSide = getSideStoneCount(state.board, 1);
  const postPurpleSide = getSideStoneCount(state.board, 2);
  if (preRedSide > LOW_SIDE_THRESHOLD && postRedSide <= LOW_SIDE_THRESHOLD) {
    return getDialogue("boardState.redSideLow");
  }

  if (prePurpleSide > LOW_SIDE_THRESHOLD && postPurpleSide <= LOW_SIDE_THRESHOLD) {
    return getDialogue("boardState.purpleSideLow");
  }

  return "";
}

function getScoreLabel(player) {
  if (state.mode === "pve") {
    return player === 1 ? `${TEXT.player}` : `${TEXT.ai}`;
  }

  return player === 1 ? TEXT.red : TEXT.purple;
}

function getDifficultyLabel() {
  return DIFFICULTY_LABELS[state.aiDifficulty] || DIFFICULTY_LABELS.medium;
}

function getModeSummary() {
  return state.mode === "pve" ? `\u55ae\u4eba\u5c0d\u6230 \u00b7 ${getDifficultyLabel()}` : "\u96d9\u4eba\u5c0d\u6230";
}

function getCoinResultText(result) {
  if (state.mode !== "pve") {
    return result === "front" ? TEXT.coinFront : TEXT.coinBack;
  }

  return result === "front"
    ? "\u6b63\u9762\u897f\u6d0b\u9f8d\uff0c\u73a9\u5bb6\u5148\u624b"
    : "\u53cd\u9762\u76fe\u528d\uff0cAI \u5148\u624b";
}

function toCountBoard(stoneBoard) {
  return stoneBoard.map((cell) => cell.length);
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
  return getSideStoneTotal(countBoard, 1) === 0 || getSideStoneTotal(countBoard, 2) === 0;
}

function finalizeCountBoard(countBoard) {
  const nextBoard = cloneCountBoard(countBoard);
  const playerOneRemaining = getSideStoneTotal(nextBoard, 1);
  const playerTwoRemaining = getSideStoneTotal(nextBoard, 2);

  nextBoard[PLAYER_ONE_STORE] += playerOneRemaining;
  nextBoard[PLAYER_TWO_STORE] += playerTwoRemaining;

  for (const index of [...bottomPits, ...playerTwoPits]) {
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
    currentIndex = (currentIndex + 1) % BOARD_SIZE;
    if (currentIndex === opponentStore) {
      continue;
    }

    nextBoard[currentIndex] += 1;
    stones -= 1;
  }

  let captureCount = 0;
  const landedInOwnPit = !isStore(currentIndex) && getOwner(currentIndex) === player;

  if (landedInOwnPit && nextBoard[currentIndex] === 1) {
    const oppositeIndex = 12 - currentIndex;
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
    for (let index = 0; index < BOARD_SIZE; index += 1) {
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

  if (ownSide <= 6 || opponentSide <= 6) {
    return storeDiff + (opponentSide === 0 ? 6 : 0) - (ownSide === 0 ? 6 : 0);
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
    storeDiff * 12 +
    sideStoneDiff * 2 +
    ownExtraTurns * 7 -
    opponentExtraTurns * 5 +
    ownCapturePotential * 5 -
    opponentCaptureThreat * 6 +
    endgamePressure * 8
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
    immediateStoreGain * 10 +
    result.captureCount * 7 +
    (result.extraTurn ? 9 : 0) +
    storeDiffAfter * 2;
  const easyScore =
    immediateStoreGain * 6 +
    result.captureCount * 8 +
    (result.extraTurn ? 12 : 0) +
    evaluation * 0.35 -
    opponentBestCapture * 4;
  const searchPriority =
    (result.extraTurn ? 100 : 0) +
    result.captureCount * 18 +
    immediateStoreGain * 7 -
    opponentBestCapture * 4 -
    opponentBestExtraTurn * 6;
  const severeBlunder =
    !result.gameOver &&
    !result.extraTurn &&
    result.captureCount === 0 &&
    opponentBestCapture >= 4 &&
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
  const remaining = getSideStoneTotal(countBoard, 1) + getSideStoneTotal(countBoard, 2);
  return remaining <= 18 ? 4 : 3;
}

function getHardDepth(countBoard) {
  const remaining = getSideStoneTotal(countBoard, 1) + getSideStoneTotal(countBoard, 2);

  if (remaining <= 14) return 8;
  if (remaining <= 24) return 7;
  return 6;
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
      ? clampPoolByScore(tacticalMoves, "easyScore", 10)
      : clampPoolByScore(moves, "easyScore", 8).slice(0, Math.min(3, moves.length));

  const fallbackPool = moves.slice(0, Math.min(4, moves.length));
  const roll = Math.random();

  if (roll < 0.82) {
    return weightedChoice(preferredPool, (entry) => entry.easyScore + 24)?.move ?? fallbackPool[0].move;
  }

  return weightedChoice(fallbackPool, (entry) => entry.easyScore + 8)?.move ?? fallbackPool[0].move;
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

  const smartPool = clampPoolByScore(evaluated, "searchValue", 6);
  const greedyPool = analyses
    .map((entry) => ({
      ...entry,
      searchValue: scoreMoveWithSearch(countBoard, player, entry, Math.max(2, depth - 1)),
    }))
    .sort((a, b) => b.greedyScore - a.greedyScore);
  const greedyTop = clampPoolByScore(greedyPool, "greedyScore", 8);
  const sillyPool = [...greedyPool].sort((a, b) => a.searchValue - b.searchValue).slice(0, Math.max(1, Math.ceil(greedyPool.length / 2)));
  const roll = Math.random();

  if (roll < 0.7) {
    return weightedChoice(smartPool, (entry) => entry.searchValue + 48)?.move ?? evaluated[0].move;
  }

  if (roll < 0.99) {
    return weightedChoice(greedyTop, (entry) => entry.greedyScore + 20)?.move ?? greedyPool[0].move;
  }

  return weightedChoice(sillyPool, (entry) => Math.max(1, 24 - entry.searchValue))?.move ?? greedyPool[greedyPool.length - 1].move;
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
  const topMoves = clampPoolByScore(evaluated, "searchValue", 2);

  return weightedChoice(topMoves, (entry) => entry.searchValue + 64)?.move ?? evaluated[0].move;
}

function chooseAiMove() {
  const countBoard = toCountBoard(state.board);

  if (state.aiDifficulty === "easy") {
    return chooseEasyMove(countBoard, state.aiPlayer);
  }

  if (state.aiDifficulty === "hard") {
    return chooseHardMove(countBoard, state.aiPlayer);
  }

  return chooseMediumMove(countBoard, state.aiPlayer);
}

function setAiDialogue(speaker, line) {
  state.aiDialogue = { speaker, line };
}

async function maybeRunAiTurn() {
  if (!isAiEnabled() || state.gameOver || state.awaitingCoinToss || state.animating || state.aiThinking) {
    return;
  }

  if (state.activePlayer !== state.aiPlayer) {
    return;
  }

  const token = state.animationToken;
  state.aiThinking = true;
  state.message = TEXT.aiThinking;
  render();

  await sleep(state.aiThinkDelayMs);

  if (token !== state.animationToken || !isAiTurn() || state.gameOver) {
    state.aiThinking = false;
    render();
    return;
  }

  const move = chooseAiMove();
  state.aiThinking = false;

  if (move == null) {
    render();
    return;
  }

  render();
  await makeMove(move);
}

async function makeMove(startIndex) {
  if (!canSelect(startIndex) && !(isAiTurn() && !state.aiThinking && getOwner(startIndex) === state.activePlayer)) {
    return;
  }

  const token = state.animationToken + 1;
  state.animationToken = token;
  state.animating = true;
  boardEl.classList.add("is-sowing");

  const movingPlayer = state.activePlayer;
  const preRedScore = getStoneCount(PLAYER_ONE_STORE);
  const prePurpleScore = getStoneCount(PLAYER_TWO_STORE);
  const preRedSide = getSideStoneCount(state.board, 1);
  const prePurpleSide = getSideStoneCount(state.board, 2);
  const ownStore = getStore(movingPlayer);
  const opponentStore = getOpponentStore(movingPlayer);
  const stones = state.board[startIndex].splice(0);
  let currentIndex = startIndex;
  let flightOrigin = startIndex;

  randomizeCell(startIndex);
  state.lastDropIndex = null;
  state.message = `${getPlayerName(movingPlayer)}${TEXT.turn}`;
  render();
  await sleep(90);

  while (stones.length > 0) {
    if (token !== state.animationToken) return;

    currentIndex = (currentIndex + 1) % BOARD_SIZE;
    if (currentIndex === opponentStore) continue;

    const stoneOwner = stones.shift();
    await animateStoneBetween(flightOrigin, currentIndex, stoneOwner, token);
    if (token !== state.animationToken) return;

    state.board[currentIndex].push(stoneOwner);
    flightOrigin = currentIndex;
    markDrop(currentIndex);
    randomizeCell(currentIndex);
    render();
    await sleep(72 + Math.random() * 44);
  }

  let captureCount = 0;
  const landedInOwnPit = !isStore(currentIndex) && getOwner(currentIndex) === movingPlayer;

  if (landedInOwnPit && getStoneCount(currentIndex) === 1) {
    const oppositeIndex = 12 - currentIndex;
    const oppositeCount = getStoneCount(oppositeIndex);

    if (oppositeCount > 0) {
      const capturedStones = [...state.board[currentIndex], ...state.board[oppositeIndex]];
      captureCount = capturedStones.length;
      await sleep(130);
      state.board[ownStore].push(...capturedStones);
      state.board[currentIndex] = [];
      state.board[oppositeIndex] = [];
      randomizeCell(ownStore);
      randomizeCell(currentIndex);
      randomizeCell(oppositeIndex);
      markDrop(ownStore);
      render();
      await sleep(170);
    }
  }

  const ended = maybeEndGame();

  if (ended) {
    state.message = getEndMessage();
  } else if (currentIndex === ownStore) {
    state.message = `${getPlayerName(movingPlayer)}${TEXT.extra}`;
  } else {
    state.activePlayer = otherPlayer(movingPlayer);
    state.message =
      captureCount > 0
        ? `${getPlayerName(movingPlayer)}${TEXT.capture} ${captureCount}\uff0c${getPlayerName(state.activePlayer)}${TEXT.turn}`
        : `${getPlayerName(state.activePlayer)}${TEXT.turn}`;
  }

  const dialogueLine = getPostMoveDialogue({
    movingPlayer,
    ended,
    landedInStore: currentIndex === ownStore,
    captureCount,
    preRedScore,
    prePurpleScore,
    preRedSide,
    prePurpleSide,
  });

  if (dialogueLine) {
    setAiDialogue(NARRATOR, dialogueLine);
  }

  state.animating = false;
  boardEl.classList.remove("is-sowing");
  render();

  if (ended) {
    showResultOverlay();
    return;
  }

  await maybeRunAiTurn();
}

function maybeEndGame() {
  const playerOneEmpty = bottomPits.every((index) => getStoneCount(index) === 0);
  const playerTwoEmpty = playerTwoPits.every((index) => getStoneCount(index) === 0);

  if (!playerOneEmpty && !playerTwoEmpty) return false;

  const playerOneRemainder = bottomPits.flatMap((index) => state.board[index]);
  const playerTwoRemainder = playerTwoPits.flatMap((index) => state.board[index]);

  state.board[PLAYER_ONE_STORE].push(...playerOneRemainder);
  state.board[PLAYER_TWO_STORE].push(...playerTwoRemainder);

  for (const index of [...bottomPits, ...playerTwoPits]) {
    state.board[index] = [];
    randomizeCell(index);
  }

  randomizeCell(PLAYER_ONE_STORE);
  randomizeCell(PLAYER_TWO_STORE);
  state.gameOver = true;
  return true;
}

function getEndMessage() {
  const redScore = getStoneCount(PLAYER_ONE_STORE);
  const purpleScore = getStoneCount(PLAYER_TWO_STORE);

  if (redScore === purpleScore) return `${TEXT.draw} ${redScore} : ${purpleScore}`;
  return redScore > purpleScore
    ? `${getPlayerName(1)}${TEXT.win} ${redScore} : ${purpleScore}`
    : `${getPlayerName(2)}${TEXT.win} ${purpleScore} : ${redScore}`;
}

function render() {
  if (state.screen !== "game") {
    renderInterfaceState();
    return;
  }

  boardEl.innerHTML = "";
  boardEl.classList.toggle("is-sowing", state.animating);
  boardEl.classList.toggle("is-locked", state.awaitingCoinToss || state.aiThinking || isAiTurn());
  boardEl.appendChild(createStore(PLAYER_TWO_STORE, `${getPlayerName(2)}${TEXT.store}`, "p2-store"));

  topPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, 2, position + 2, 1));
  });

  bottomPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, 1, position + 2, 2));
  });

  boardEl.appendChild(createStore(PLAYER_ONE_STORE, `${getPlayerName(1)}${TEXT.store}`, "p1-store"));
  playerOneLabel.textContent = getScoreLabel(1);
  playerTwoLabel.textContent = getScoreLabel(2);
  playerOneScore.querySelector("strong").textContent = getStoneCount(PLAYER_ONE_STORE);
  playerTwoScore.querySelector("strong").textContent = getStoneCount(PLAYER_TWO_STORE);
  playerOneScore.classList.toggle("active", state.activePlayer === 1 && !state.gameOver);
  playerTwoScore.classList.toggle("active", state.activePlayer === 2 && !state.gameOver);
  renderTurnIndicator();
  renderInterfaceState();
  statusEl.textContent = state.message;
  renderCoinOverlay();
}

function renderInterfaceState() {
  mainMenu.hidden = state.screen !== "menu";
  gameScreen.hidden = state.screen !== "game";

  for (const [mode, button] of Object.entries(modeButtons)) {
    button.classList.toggle("is-active", state.mode === mode);
    button.setAttribute("aria-pressed", String(state.mode === mode));
  }

  difficultyField.hidden = state.mode !== "pve";

  for (const [difficulty, button] of Object.entries(difficultyButtons)) {
    button.classList.toggle("is-active", state.aiDifficulty === difficulty);
    button.setAttribute("aria-pressed", String(state.aiDifficulty === difficulty));
  }

  controlHint.textContent =
    state.mode === "pve" ? `${TEXT.pveHint} \u00b7 ${getDifficultyLabel()}` : TEXT.pvpHint;
  aiDialogue.hidden = state.screen !== "game";
  aiDialogueSpeaker.textContent = state.aiDialogue.speaker;
  aiDialogueLine.textContent = state.aiDialogue.line;
  renderSettingsState();
}

function renderSettingsState() {
  const isRoman = state.pitNumberStyle === "roman";

  pitRomanButton.classList.toggle("is-active", isRoman);
  pitArabicButton.classList.toggle("is-active", !isRoman);
  pitRomanButton.setAttribute("aria-pressed", String(isRoman));
  pitArabicButton.setAttribute("aria-pressed", String(!isRoman));
}

function setPitNumberStyle(style) {
  if (state.pitNumberStyle === style) return;

  state.pitNumberStyle = style;
  render();
}

function openFloatingCard(overlay) {
  overlay.hidden = false;
  requestAnimationFrame(() => {
    overlay.classList.add("is-visible");
  });
}

function closeFloatingCard(overlay) {
  overlay.classList.remove("is-visible");
  window.setTimeout(() => {
    if (!overlay.classList.contains("is-visible")) {
      overlay.hidden = true;
    }
  }, 180);
}

function closeOpenFloatingCards() {
  for (const overlay of [rulesOverlay, settingsOverlay]) {
    if (!overlay.hidden) {
      closeFloatingCard(overlay);
    }
  }
}

function renderTurnIndicator() {
  const showingTurn = !state.awaitingCoinToss && !state.gameOver;
  const activePlayer = showingTurn ? state.activePlayer : 0;

  document.body.classList.toggle("turn-red", activePlayer === 1);
  document.body.classList.toggle("turn-purple", activePlayer === 2);
  turnIndicator.classList.toggle("red", activePlayer === 1);
  turnIndicator.classList.toggle("purple", activePlayer === 2);
  turnIndicator.classList.toggle("pending", !showingTurn);

  if (activePlayer === 2) {
    turnEmblem.src = `assets/Shield.png?v=${ASSET_VERSION}`;
    turnIndicator.setAttribute("aria-label", `${getPlayerName(2)}${TEXT.turn}`);
  } else if (activePlayer === 1) {
    turnEmblem.src = `assets/Dragon.png?v=${ASSET_VERSION}`;
    turnIndicator.setAttribute("aria-label", `${getPlayerName(1)}${TEXT.turn}`);
  } else {
    turnEmblem.src = `assets/Coin.png?v=${ASSET_VERSION}`;
    turnIndicator.setAttribute("aria-label", state.gameOver ? getEndMessage() : TEXT.coinReady);
  }
}

async function tossCoin() {
  if (!state.awaitingCoinToss || state.coinTossing) return;

  const token = state.animationToken;
  const result = Math.random() < 0.5 ? "front" : "back";
  const firstPlayer = result === "front" ? 1 : 2;

  state.coinTossing = true;
  state.coinResult = result;
  state.message = TEXT.coinFlipping;
  setAiDialogue(NARRATOR, getDialogue("coin.flipping"));
  render();

  await coinScene.play(result);
  if (token !== state.animationToken) return;

  state.activePlayer = firstPlayer;
  state.coinTossing = false;
  state.coinResultHolding = true;
  state.message = `${getPlayerName(firstPlayer)}${TEXT.turn}`;
  setAiDialogue(NARRATOR, getDialogue(result === "front" ? "coin.redFirst" : "coin.purpleFirst"));
  coinTossStatus.textContent = getCoinResultText(result);
  launchParticles(coinTossOverlay, 24, firstPlayer);
  render();

  await sleep(1000);
  if (token !== state.animationToken) return;

  state.coinResultHolding = false;
  state.awaitingCoinToss = false;
  render();
  await maybeRunAiTurn();
}

function renderCoinOverlay() {
  const isVisible = state.awaitingCoinToss || state.coinTossing || state.coinResultHolding;

  coinTossOverlay.hidden = !isVisible;
  coinTossOverlay.classList.toggle("is-visible", isVisible);
  coinTossButton.disabled = !state.awaitingCoinToss || state.coinTossing || state.coinResultHolding;

  if (state.coinTossing) {
    coinTossStatus.textContent = TEXT.coinFlipping;
  } else if (state.coinResultHolding && state.coinResult) {
    coinTossStatus.textContent = getCoinResultText(state.coinResult);
  } else if (state.awaitingCoinToss) {
    coinTossStatus.textContent = TEXT.coinReady;
  }
}

function resetCoinVisual() {
  coinScene.reset();
  coinTossStatus.textContent = TEXT.coinReady;
}

function showResultOverlay() {
  const redScore = getStoneCount(PLAYER_ONE_STORE);
  const purpleScore = getStoneCount(PLAYER_TWO_STORE);
  const winner = redScore === purpleScore ? 0 : redScore > purpleScore ? 1 : 2;

  state.resultShown = true;
  resultOverlay.hidden = false;
  resultPanel.classList.remove("winner-red", "winner-purple", "winner-draw", "is-visible");
  resultPanel.classList.add(winner === 1 ? "winner-red" : winner === 2 ? "winner-purple" : "winner-draw");
  playerOneScore.classList.toggle("winner-pop", winner === 1);
  playerTwoScore.classList.toggle("winner-pop", winner === 2);
  resultKicker.textContent = `${TEXT.result} \u00b7 ${getModeSummary()}`;
  resultTitle.textContent = winner === 0 ? TEXT.draw : `${getPlayerName(winner)}${TEXT.win}`;
  resultScore.textContent = `${getPlayerName(1)} ${redScore} : ${purpleScore} ${getPlayerName(2)}`;

  requestAnimationFrame(() => {
    resultPanel.classList.add("is-visible");
    launchParticles(resultPanel, winner === 0 ? 18 : 34, winner);
  });
}

function hideResultOverlay() {
  resultOverlay.hidden = true;
  resultPanel.classList.remove("winner-red", "winner-purple", "winner-draw", "is-visible");
  playerOneScore.classList.remove("winner-pop");
  playerTwoScore.classList.remove("winner-pop");
  particleField.innerHTML = "";
}

function launchParticles(anchor, count, player) {
  const host = anchor === resultPanel ? particleField : coinTossOverlay;
  const hostRect = host.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const originX = anchorRect.left + anchorRect.width / 2 - hostRect.left;
  const originY = anchorRect.top + anchorRect.height / 2 - hostRect.top;
  const colorClass = player === 1 ? "red" : player === 2 ? "purple" : "gold";

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * 0.34;
    const distance = randomBetween(Math.random() * 1000, 58, 170);
    const size = randomBetween(Math.random() * 1000, 5, 12);

    particle.className = `particle ${colorClass}`;
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--spin", `${randomBetween(Math.random() * 1000, -220, 220)}deg`);
    host.appendChild(particle);

    window.setTimeout(() => particle.remove(), 920);
  }
}

function createPit(index, owner, column, row) {
  const button = document.createElement("button");
  const count = getStoneCount(index);
  const pitNumber = owner === 1 ? index + 1 : index - 6;
  const visibleNumber = owner === 1 ? pitNumber : 7 - pitNumber;

  button.type = "button";
  button.className = `pit cell${state.lastDropIndex === index ? " just-dropped" : ""}`;
  button.dataset.index = String(index);
  button.style.gridColumn = String(column);
  button.style.gridRow = String(row);
  button.disabled = !canSelect(index);
  button.setAttribute(
    "aria-label",
    `${getPlayerName(owner)}${TEXT.pit} ${visibleNumber}\uff0c${count} ${TEXT.stones}`
  );

  if (canSelect(index)) {
    button.classList.add("selectable");
  }

  button.innerHTML = `
    <span class="stones">${createStones(index, state.board[index], owner, "pit")}</span>
    <span class="pit-count">${formatPitCount(count)}</span>
  `;

  return button;
}

function createStore(index, label, className) {
  const store = document.createElement("div");
  const owner = getOwner(index);
  const count = getStoneCount(index);
  const sigil =
    owner === 1 ? `assets/Dragon.png?v=${ASSET_VERSION}` : `assets/Shield.png?v=${ASSET_VERSION}`;

  store.className = `store cell ${className}${state.lastDropIndex === index ? " just-dropped" : ""}`;
  store.dataset.index = String(index);
  store.setAttribute("role", "group");
  store.setAttribute("aria-label", `${label}\uff0c${count} ${TEXT.stones}`);
  store.innerHTML = `
    <img class="store-sigil" src="${sigil}" alt="" aria-hidden="true" />
    <span class="stones">${createStones(index, state.board[index], owner, "store")}</span>
    <span class="store-count">${count}</span>
  `;

  return store;
}

function createStones(index, stones, owner, type) {
  const layouts = getStoneLayouts(index, stones.length, owner, type);
  const visibleStones = stones.length > layouts.length ? stones.slice(stones.length - layouts.length) : stones;
  const newStoneIndex = state.lastDropIndex === index ? layouts.length - 1 : -1;
  let html = "";

  layouts.forEach((layout, i) => {
    const stoneOwner = visibleStones[i] || owner;
    const src =
      stoneOwner === 1
        ? `${RUBY_SRC}?v=${ASSET_VERSION}`
        : `${AMETHYST_SRC}?v=${ASSET_VERSION}`;
    const entering = i === newStoneIndex ? " entering" : "";

    html += `
      <img
        class="stone${entering}"
        src="${src}"
        alt=""
        aria-hidden="true"
        style="left: ${layout.left}%; top: ${layout.top}%; --rotation: ${layout.rotation}deg; --landing-roll: ${layout.landingRoll}deg; --scale: ${layout.scale}; --shadow-x: ${layout.shadowX}px; --shadow-y: ${layout.shadowY}px;"
      />
    `;
  });

  return html;
}

function getStoneLayouts(index, count, owner, type) {
  const slots = type === "store" ? storeSlots : pitSlots;
  const visibleCount = Math.min(count, slots.length);
  const scale = getStoneScale(count, type);
  const jitter = type === "store" ? 4.8 : 6.8;
  const minDistance = getCollisionDistance(count, type);
  const salt = state.layoutSalt[index] || 1;
  const layouts = [];

  for (let i = 0; i < visibleCount; i += 1) {
    const [slotLeft, slotTop] = slots[i];
    const seed = salt + owner * 113 + i * 37 + count * 19;
    const left = clamp(slotLeft + randomBetween(seed, -jitter, jitter), 12, 88);
    const top = clamp(slotTop + randomBetween(seed + 17, -jitter, jitter), 14, 90);

    layouts.push({
      left,
      top,
      rotation: randomBetween(seed + 29, -38, 38),
      landingRoll: randomBetween(seed + 43, 28, 72),
      scale,
      shadowX: randomBetween(seed + 61, -2.5, 2.5),
      shadowY: randomBetween(seed + 73, 6, 12),
    });
  }

  relaxStoneCollisions(layouts, minDistance);
  return layouts;
}

function relaxStoneCollisions(layouts, minDistance) {
  for (let pass = 0; pass < 8; pass += 1) {
    for (let i = 0; i < layouts.length; i += 1) {
      for (let j = i + 1; j < layouts.length; j += 1) {
        const first = layouts[i];
        const second = layouts[j];
        let dx = second.left - first.left;
        let dy = second.top - first.top;
        let distance = Math.hypot(dx, dy);

        if (distance >= minDistance) continue;

        if (distance < 0.001) {
          dx = 0.5;
          dy = 0.5;
          distance = Math.hypot(dx, dy);
        }

        const push = (minDistance - distance) / 2;
        const nx = dx / distance;
        const ny = dy / distance;

        first.left = clamp(first.left - nx * push, 10, 90);
        first.top = clamp(first.top - ny * push, 13, 91);
        second.left = clamp(second.left + nx * push, 10, 90);
        second.top = clamp(second.top + ny * push, 13, 91);
      }
    }
  }
}

function getCollisionDistance(count, type) {
  if (type === "store") {
    if (count > 24) return 7.8;
    if (count > 16) return 9.4;
    if (count > 9) return 11.4;
    return 13.2;
  }

  if (count > 14) return 9.2;
  if (count > 9) return 11.5;
  if (count > 5) return 14.2;
  return 17;
}

function getStoneScale(count, type) {
  if (type === "store") {
    if (count > 24) return 0.54;
    if (count > 16) return 0.64;
    if (count > 9) return 0.78;
    return 0.94;
  }

  if (count > 14) return 0.56;
  if (count > 9) return 0.68;
  if (count > 5) return 0.84;
  return 1;
}

async function animateStoneBetween(fromIndex, toIndex, stoneOwner, token) {
  const fromCell = getCell(fromIndex);
  const toCell = getCell(toIndex);
  if (!fromCell || !toCell) {
    await sleep(120);
    return;
  }

  const from = getCellCenter(fromCell);
  const to = getCellCenter(toCell);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const arc = Math.min(96, Math.max(38, distance * 0.22));
  const duration = 230 + Math.random() * 120;
  const image = document.createElement("img");
  const roll = (stoneOwner === 1 ? 1 : -1) * randomBetween(Math.random() * 1000, 210, 340);
  const size = clamp(Math.min(from.width, from.height) * 0.33, 30, 58);

  image.className = "flying-stone";
  image.src =
    stoneOwner === 1
      ? `${RUBY_SRC}?v=${ASSET_VERSION}`
      : `${AMETHYST_SRC}?v=${ASSET_VERSION}`;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.style.left = `${from.x}px`;
  image.style.top = `${from.y}px`;
  image.style.width = `${size}px`;
  document.body.appendChild(image);

  if (!image.animate) {
    await sleep(120);
    image.remove();
    return;
  }

  const animation = image.animate(
    [
      {
        transform: "translate(-50%, -50%) translate(0, 0) scale(0.72) rotate(0deg)",
        filter: "drop-shadow(0 7px 8px rgba(0, 0, 0, 0.42))",
        opacity: 0.88,
      },
      {
        transform: `translate(-50%, -50%) translate(${dx * 0.48}px, ${dy * 0.48 - arc}px) scale(0.98) rotate(${roll * 0.48}deg)`,
        filter: "drop-shadow(0 22px 20px rgba(0, 0, 0, 0.34))",
        opacity: 1,
      },
      {
        transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(0.78) rotate(${roll}deg)`,
        filter: "drop-shadow(0 5px 7px rgba(0, 0, 0, 0.56))",
        opacity: 0.95,
      },
    ],
    {
      duration,
      easing: "cubic-bezier(0.2, 0.72, 0.25, 1)",
      fill: "forwards",
    }
  );

  try {
    await animation.finished;
  } catch {
    await sleep(duration);
  }

  image.remove();

  if (token !== state.animationToken) {
    return;
  }
}

function getCell(index) {
  return boardEl.querySelector(`.cell[data-index="${index}"]`);
}

function getCellCenter(cell) {
  const rect = cell.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2 + randomBetween(Math.random() * 1000, -rect.width * 0.08, rect.width * 0.08),
    y: rect.top + rect.height / 2 + randomBetween(Math.random() * 1000, -rect.height * 0.08, rect.height * 0.08),
    width: rect.width,
    height: rect.height,
  };
}

function markDrop(index) {
  state.lastDropIndex = index;
  state.lastDropKey += 1;
}

function randomizeCell(index) {
  state.layoutSalt[index] = Math.random() * 100000;
}

function randomBetween(seed, min, max) {
  return min + seededRandom(seed) * (max - min);
}

function seededRandom(seed) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatPitCount(value) {
  return state.pitNumberStyle === "arabic" ? String(value) : formatRomanCount(value);
}

function formatRomanCount(value) {
  if (value <= 0) return "N";

  const numerals = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let remainder = value;
  let roman = "";

  for (const [amount, symbol] of numerals) {
    while (remainder >= amount) {
      roman += symbol;
      remainder -= amount;
    }
  }

  return roman;
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function selectMode(mode) {
  state.mode = mode;
  renderInterfaceState();
}

modePvpButton.addEventListener("click", () => {
  selectMode("pvp");
});

modePvpButton.addEventListener("mouseenter", () => {
  selectMode("pvp");
});

modePvpButton.addEventListener("focus", () => {
  selectMode("pvp");
});

modePveButton.addEventListener("click", () => {
  selectMode("pve");
});

modePveButton.addEventListener("mouseenter", () => {
  selectMode("pve");
});

modePveButton.addEventListener("focus", () => {
  selectMode("pve");
});

difficultyEasyButton.addEventListener("click", () => {
  state.aiDifficulty = "easy";
  renderInterfaceState();
});

difficultyMediumButton.addEventListener("click", () => {
  state.aiDifficulty = "medium";
  renderInterfaceState();
});

difficultyHardButton.addEventListener("click", () => {
  state.aiDifficulty = "hard";
  renderInterfaceState();
});

startButton.addEventListener("click", resetGame);
resetButton.addEventListener("click", resetGame);
menuButton.addEventListener("click", showMainMenu);
resultResetButton.addEventListener("click", resetGame);
resultMenuButton.addEventListener("click", showMainMenu);

rulesButton.addEventListener("click", () => {
  openFloatingCard(rulesOverlay);
});

settingsButton.addEventListener("click", () => {
  openFloatingCard(settingsOverlay);
});

rulesCloseButton.addEventListener("click", () => {
  closeFloatingCard(rulesOverlay);
});

settingsCloseButton.addEventListener("click", () => {
  closeFloatingCard(settingsOverlay);
});

rulesOverlay.addEventListener("click", (event) => {
  if (event.target === rulesOverlay) {
    closeFloatingCard(rulesOverlay);
  }
});

settingsOverlay.addEventListener("click", (event) => {
  if (event.target === settingsOverlay) {
    closeFloatingCard(settingsOverlay);
  }
});

pitRomanButton.addEventListener("click", () => {
  setPitNumberStyle("roman");
});

pitArabicButton.addEventListener("click", () => {
  setPitNumberStyle("arabic");
});

boardEl.addEventListener("click", (event) => {
  const pit = event.target.closest(".pit");
  if (!pit) return;
  void makeMove(Number(pit.dataset.index));
});

coinTossButton.addEventListener("click", tossCoin);

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOpenFloatingCards();
  }
});

showMainMenu();
