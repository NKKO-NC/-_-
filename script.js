import { CoinTossScene } from "./coin/index.js?v=20260616g";
import { getDialogue, resetDialogueHistory } from "./dialoguePicker.js?v=20260616g";
import {
  KALAH_BOARD_MODEL,
  PLAYER_ONE,
  PLAYER_TWO,
  createCellLayoutSalt,
  createInitialObjectBoard,
  createLayoutSalt,
  getBoardSpaceOwner,
  getOpponentPlayer,
  getOpponentStoreIndex,
  getOppositePitIndex,
  getPlayerPitIndices,
  getStoreIndex,
  getVisiblePitNumber,
  isStoreIndex,
} from "./core/object-model.js?v=20260616g";
import {
  PARTICLE_PHYSICS,
  STONE_FLIGHT_PHYSICS,
  STONE_PLACEMENT_PHYSICS,
  selectCountCurveValue,
} from "./core/object-physics.js?v=20260616g";
import {
  getAssetUrl,
  getCoinFace,
  getNeutralSkin,
  getPlayerSkin,
} from "./core/object-pack-manifest.js?v=20260616g";
import { CRYSTAL_OBJECT_PACK } from "./object-packs/crystal.js?v=20260616g";

const BOARD_MODEL = KALAH_BOARD_MODEL;
const ACTIVE_OBJECT_PACK = CRYSTAL_OBJECT_PACK;
const PLAYER_ONE_STORE = getStoreIndex(BOARD_MODEL, PLAYER_ONE);
const PLAYER_TWO_STORE = getStoreIndex(BOARD_MODEL, PLAYER_TWO);
const BOARD_SIZE = BOARD_MODEL.boardSize;
const topPits = BOARD_MODEL.layout.topPits;
const bottomPits = getPlayerPitIndices(BOARD_MODEL, PLAYER_ONE);
const playerTwoPits = getPlayerPitIndices(BOARD_MODEL, PLAYER_TWO);

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
  store: "\u68cb\u5eab",
  pit: "\u68cb\u5751",
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
const rulesList = document.querySelector("#rulesList");
const rulesDemo = document.querySelector("#rulesDemo");
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

function getPackAssetUrl(assetId) {
  return getAssetUrl(ACTIVE_OBJECT_PACK, assetId);
}

function getPlayerStoneUrl(player) {
  return getPackAssetUrl(getPlayerSkin(ACTIVE_OBJECT_PACK, player).stoneAsset);
}

function getPlayerStoreSigilUrl(player) {
  return getPackAssetUrl(getPlayerSkin(ACTIVE_OBJECT_PACK, player).storeSigilAsset);
}

function getPlayerCssClass(player, className) {
  return getPlayerSkin(ACTIVE_OBJECT_PACK, player).classes[className];
}

function getTurnBodyClasses() {
  return Object.values(ACTIVE_OBJECT_PACK.players).map((player) => player.classes.bodyTurn);
}

function applyObjectPackSkin() {
  document.documentElement.dataset.objectPack = ACTIVE_OBJECT_PACK.id;

  for (const [name, value] of Object.entries(ACTIVE_OBJECT_PACK.cssVars)) {
    document.documentElement.style.setProperty(`--${name}`, value);
  }

  coinTossButton.style.setProperty(
    "--coin-fallback-image",
    `url("${getPackAssetUrl(ACTIVE_OBJECT_PACK.coin.fallbackAsset)}")`
  );
}

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
      coinSrc: getPackAssetUrl(ACTIVE_OBJECT_PACK.coin.bodyAsset),
      dragonSrc: getPackAssetUrl(getCoinFace(ACTIVE_OBJECT_PACK, "front").faceAsset),
      shieldSrc: getPackAssetUrl(getCoinFace(ACTIVE_OBJECT_PACK, "back").faceAsset),
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

applyObjectPackSkin();
const coinScene = createCoinScene();

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
  layoutSalt: createLayoutSalt(BOARD_MODEL),
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

const RULE_DEMO_MODEL = {
  boardSize: 6,
  pits: {
    [PLAYER_ONE]: [0, 1],
    [PLAYER_TWO]: [3, 4],
  },
  stores: {
    [PLAYER_ONE]: 2,
    [PLAYER_TWO]: 5,
  },
  oppositePits: {
    0: 4,
    1: 3,
    3: 1,
    4: 0,
  },
};

const RULE_DEMOS = [
  {
    id: "setup",
    title: "開局",
    summary: "每個棋坑放 6 顆，棋庫先空。",
    action: "setup",
    initial: [0, 0, 0, 0, 0, 0],
    target: [3, 3, 0, 3, 3, 0],
    outcome: "正式棋盤每坑 6 顆；這裡用少量棋子示範。",
  },
  {
    id: "sow",
    title: "撒棋",
    summary: "選自己的棋坑，一格一顆逆時針放。",
    action: "sow",
    player: PLAYER_ONE,
    startIndex: 0,
    initial: [3, 0, 0, 0, 0, 0],
    outcome: "棋子依序落進下一格。",
  },
  {
    id: "store",
    title: "棋庫",
    summary: "會進自己的棋庫，會跳過對手棋庫。",
    action: "sow",
    player: PLAYER_ONE,
    startIndex: 0,
    initial: [5, 0, 0, 0, 0, 0],
    outcome: "自己的棋庫可得分，對手棋庫不放棋。",
  },
  {
    id: "extra",
    title: "再走",
    summary: "最後一顆進自己的棋庫，再行一手。",
    action: "sow",
    player: PLAYER_ONE,
    startIndex: 1,
    initial: [0, 1, 0, 0, 0, 0],
    outcome: "最後落點是棋庫，所以保留回合。",
  },
  {
    id: "capture",
    title: "吃子",
    summary: "最後落在自己的空棋坑，收走對面棋子。",
    action: "sow",
    player: PLAYER_ONE,
    startIndex: 0,
    initial: [1, 0, 0, 3, 0, 0],
    capture: true,
    outcome: "自己的最後一顆和對面棋子一起進棋庫。",
  },
  {
    id: "finish",
    title: "結算",
    summary: "一方棋坑清空，剩子全部進棋庫。",
    action: "sow",
    player: PLAYER_ONE,
    startIndex: 1,
    initial: [0, 1, 5, 2, 1, 4],
    collect: true,
    outcome: "清空後比棋庫數量，較多者勝。",
  },
];

const RULE_DEMO_CELLS = [
  { index: 5, label: "對手棋庫", type: "store", owner: PLAYER_TWO },
  { index: 4, label: "對手棋坑", type: "pit", owner: PLAYER_TWO },
  { index: 3, label: "對手棋坑", type: "pit", owner: PLAYER_TWO },
  { index: 0, label: "我的棋坑", type: "pit", owner: PLAYER_ONE },
  { index: 1, label: "我的棋坑", type: "pit", owner: PLAYER_ONE },
  { index: 2, label: "我的棋庫", type: "store", owner: PLAYER_ONE },
];

const ruleDemoState = {
  activeId: RULE_DEMOS[0].id,
  token: 0,
};

const NARRATOR = "\u65c1\u767d";
const LOW_SIDE_THRESHOLD = 8;

function createInitialBoard() {
  return createInitialObjectBoard(BOARD_MODEL);
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
  state.layoutSalt = createLayoutSalt(BOARD_MODEL);
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
  document.body.classList.remove(...getTurnBodyClasses());
  renderInterfaceState();
}

function otherPlayer(player) {
  return getOpponentPlayer(BOARD_MODEL, player);
}

function getOwner(index) {
  return getBoardSpaceOwner(BOARD_MODEL, index);
}

function isStore(index) {
  return isStoreIndex(BOARD_MODEL, index);
}

function getStore(player) {
  return getStoreIndex(BOARD_MODEL, player);
}

function getOpponentStore(player) {
  return getOpponentStoreIndex(BOARD_MODEL, player);
}

function getPlayerPits(player) {
  return getPlayerPitIndices(BOARD_MODEL, player);
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

  return getPlayerSkin(ACTIVE_OBJECT_PACK, player)?.label ?? "";
}

function getSideName(player) {
  return getPlayerSkin(ACTIVE_OBJECT_PACK, player)?.sideLabel ?? "";
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

  return getPlayerSkin(ACTIVE_OBJECT_PACK, player)?.label ?? "";
}

function getDifficultyLabel() {
  return DIFFICULTY_LABELS[state.aiDifficulty] || DIFFICULTY_LABELS.medium;
}

function getModeSummary() {
  return state.mode === "pve" ? `\u55ae\u4eba\u5c0d\u6230 \u00b7 ${getDifficultyLabel()}` : "\u96d9\u4eba\u5c0d\u6230";
}

function getCoinResultText(result) {
  const face = getCoinFace(ACTIVE_OBJECT_PACK, result);
  return face?.resultText?.[state.mode] ?? face?.resultText?.pvp ?? "";
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
    const oppositeIndex = getOppositePitIndex(BOARD_MODEL, currentIndex);
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
  await sleep(STONE_FLIGHT_PHYSICS.preSowDelayMs);

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
    await sleep(
      STONE_FLIGHT_PHYSICS.postDropDelayMs.base +
        Math.random() * STONE_FLIGHT_PHYSICS.postDropDelayMs.random
    );
  }

  let captureCount = 0;
  const landedInOwnPit = !isStore(currentIndex) && getOwner(currentIndex) === movingPlayer;

  if (landedInOwnPit && getStoneCount(currentIndex) === 1) {
    const oppositeIndex = getOppositePitIndex(BOARD_MODEL, currentIndex);
    const oppositeCount = getStoneCount(oppositeIndex);

    if (oppositeCount > 0) {
      const capturedStones = [...state.board[currentIndex], ...state.board[oppositeIndex]];
      captureCount = capturedStones.length;
      await sleep(STONE_FLIGHT_PHYSICS.captureDelayMs);
      state.board[ownStore].push(...capturedStones);
      state.board[currentIndex] = [];
      state.board[oppositeIndex] = [];
      randomizeCell(ownStore);
      randomizeCell(currentIndex);
      randomizeCell(oppositeIndex);
      markDrop(ownStore);
      render();
      await sleep(STONE_FLIGHT_PHYSICS.postCaptureDelayMs);
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
  boardEl.appendChild(
    createStore(PLAYER_TWO_STORE, `${getPlayerName(PLAYER_TWO)}${TEXT.store}`, getPlayerCssClass(PLAYER_TWO, "store"))
  );

  topPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, PLAYER_TWO, position + 2, 1));
  });

  bottomPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, PLAYER_ONE, position + 2, 2));
  });

  boardEl.appendChild(
    createStore(PLAYER_ONE_STORE, `${getPlayerName(PLAYER_ONE)}${TEXT.store}`, getPlayerCssClass(PLAYER_ONE, "store"))
  );
  playerOneLabel.textContent = getScoreLabel(PLAYER_ONE);
  playerTwoLabel.textContent = getScoreLabel(PLAYER_TWO);
  playerOneScore.querySelector("strong").textContent = getStoneCount(PLAYER_ONE_STORE);
  playerTwoScore.querySelector("strong").textContent = getStoneCount(PLAYER_TWO_STORE);
  playerOneScore.classList.toggle("active", state.activePlayer === PLAYER_ONE && !state.gameOver);
  playerTwoScore.classList.toggle("active", state.activePlayer === PLAYER_TWO && !state.gameOver);
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

function initializeRulesPanel() {
  renderRulesList();

  const rule = getRuleDemo(ruleDemoState.activeId);
  renderRuleDemoBoard(rule, rule.target ?? rule.initial, { note: rule.summary });
}

function renderRulesList() {
  if (!rulesList) return;

  rulesList.innerHTML = "";

  for (const rule of RULE_DEMOS) {
    const button = document.createElement("button");
    const isActive = rule.id === ruleDemoState.activeId;

    button.type = "button";
    button.className = `rule-item${isActive ? " is-active" : ""}`;
    button.setAttribute("role", "listitem");
    button.setAttribute("aria-pressed", String(isActive));
    button.innerHTML = `
      <span class="rule-title">${rule.title}</span>
      <span class="rule-summary">${rule.summary}</span>
    `;
    button.addEventListener("click", () => {
      void playRuleDemo(rule.id);
    });

    rulesList.appendChild(button);
  }
}

function getRuleDemo(ruleId) {
  return RULE_DEMOS.find((rule) => rule.id === ruleId) ?? RULE_DEMOS[0];
}

async function playRuleDemo(ruleId = ruleDemoState.activeId) {
  const rule = getRuleDemo(ruleId);
  const token = ruleDemoState.token + 1;

  ruleDemoState.activeId = rule.id;
  ruleDemoState.token = token;
  renderRulesList();

  if (rule.action === "setup") {
    await runRuleSetupDemo(rule, token);
  } else {
    await runRuleSowDemo(rule, token);
  }
}

async function runRuleSetupDemo(rule, token) {
  const board = rule.initial.slice();
  const target = rule.target.slice();
  const pitIndices = [...RULE_DEMO_MODEL.pits[PLAYER_TWO], ...RULE_DEMO_MODEL.pits[PLAYER_ONE]];

  renderRuleDemoBoard(rule, board, { note: "棋庫先空。" });
  await sleep(180);

  const maxCount = Math.max(...target);
  for (let count = 1; count <= maxCount; count += 1) {
    for (const index of pitIndices) {
      if (!isRuleDemoCurrent(token)) return;
      if (target[index] < count) continue;

      board[index] = count;
      renderRuleDemoBoard(rule, board, {
        activeIndices: [index],
        note: "棋子先放進棋坑。",
      });
      await sleep(120);
    }
  }

  if (!isRuleDemoCurrent(token)) return;
  renderRuleDemoBoard(rule, board, { note: rule.outcome });
}

async function runRuleSowDemo(rule, token) {
  const board = rule.initial.slice();
  const player = rule.player;
  const ownStore = RULE_DEMO_MODEL.stores[player];
  const opponentStore = getRuleDemoOpponentStore(player);
  let currentIndex = rule.startIndex;
  let stones = board[rule.startIndex];

  renderRuleDemoBoard(rule, board, {
    activeIndices: [rule.startIndex],
    note: "選這個棋坑。",
  });
  await sleep(260);

  if (!isRuleDemoCurrent(token)) return;
  board[rule.startIndex] = 0;
  renderRuleDemoBoard(rule, board, {
    activeIndices: [rule.startIndex],
    note: "拿起棋子，開始撒棋。",
  });
  await sleep(240);

  while (stones > 0) {
    if (!isRuleDemoCurrent(token)) return;

    const nextIndex = (currentIndex + 1) % RULE_DEMO_MODEL.boardSize;
    currentIndex = nextIndex;

    if (nextIndex === opponentStore) {
      renderRuleDemoBoard(rule, board, {
        skippedIndex: nextIndex,
        note: "跳過對手棋庫。",
      });
      await sleep(260);
      continue;
    }

    board[nextIndex] += 1;
    stones -= 1;
    renderRuleDemoBoard(rule, board, {
      activeIndices: [nextIndex],
      note: getRuleDemoDropNote(nextIndex, player),
    });
    await sleep(340);
  }

  if (rule.capture) {
    await maybeRunRuleCapture(rule, board, currentIndex, token);
  }

  if (rule.collect) {
    await maybeCollectRuleDemoRemainder(rule, board, token);
  }

  if (!isRuleDemoCurrent(token)) return;
  renderRuleDemoBoard(rule, board, {
    activeIndices: currentIndex === ownStore ? [ownStore] : [],
    note: rule.outcome,
  });
}

async function maybeRunRuleCapture(rule, board, landingIndex, token) {
  const player = rule.player;
  const ownStore = RULE_DEMO_MODEL.stores[player];
  const oppositeIndex = RULE_DEMO_MODEL.oppositePits[landingIndex];

  if (
    oppositeIndex == null ||
    !isRuleDemoPit(landingIndex, player) ||
    board[landingIndex] !== 1 ||
    board[oppositeIndex] <= 0
  ) {
    return;
  }

  await sleep(220);
  if (!isRuleDemoCurrent(token)) return;

  renderRuleDemoBoard(rule, board, {
    activeIndices: [landingIndex, oppositeIndex],
    note: "最後一顆落在自己的空棋坑。",
  });
  await sleep(420);

  if (!isRuleDemoCurrent(token)) return;
  board[ownStore] += board[landingIndex] + board[oppositeIndex];
  board[landingIndex] = 0;
  board[oppositeIndex] = 0;
  renderRuleDemoBoard(rule, board, {
    activeIndices: [ownStore],
    note: "兩邊棋子收進棋庫。",
  });
  await sleep(380);
}

async function maybeCollectRuleDemoRemainder(rule, board, token) {
  const playerOneEmpty = RULE_DEMO_MODEL.pits[PLAYER_ONE].every((index) => board[index] === 0);
  const playerTwoEmpty = RULE_DEMO_MODEL.pits[PLAYER_TWO].every((index) => board[index] === 0);

  if (!playerOneEmpty && !playerTwoEmpty) return;

  const collectingPlayer = playerOneEmpty ? PLAYER_TWO : PLAYER_ONE;
  const collectingStore = RULE_DEMO_MODEL.stores[collectingPlayer];

  await sleep(260);

  for (const pitIndex of RULE_DEMO_MODEL.pits[collectingPlayer]) {
    if (!isRuleDemoCurrent(token)) return;
    if (board[pitIndex] <= 0) continue;

    board[collectingStore] += board[pitIndex];
    board[pitIndex] = 0;
    renderRuleDemoBoard(rule, board, {
      activeIndices: [pitIndex, collectingStore],
      note: "剩下棋子進自己的棋庫。",
    });
    await sleep(360);
  }
}

function renderRuleDemoBoard(rule, board, options = {}) {
  if (!rulesDemo) return;

  const activeIndices = new Set(options.activeIndices ?? []);
  const skippedIndex = options.skippedIndex;
  const note = options.note ?? rule.summary;

  rulesDemo.innerHTML = `
    <div class="rules-demo-copy">
      <strong>${rule.title}</strong>
      <span>${note}</span>
    </div>
    <div class="rule-demo-board" aria-label="簡式規則示範棋盤">
      ${RULE_DEMO_CELLS.map((cell) => createRuleDemoCell(cell, board, activeIndices, skippedIndex)).join("")}
    </div>
  `;
}

function createRuleDemoCell(cell, board, activeIndices, skippedIndex) {
  const count = board[cell.index] ?? 0;
  const classes = [
    "rule-demo-cell",
    cell.type,
    cell.owner === PLAYER_ONE ? "player-one-demo" : "player-two-demo",
    activeIndices.has(cell.index) ? "is-active" : "",
    skippedIndex === cell.index ? "is-skipped" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <div class="${classes}" data-index="${cell.index}" role="group" aria-label="${cell.label}，${count} 顆棋子">
      <span class="rule-demo-label">${cell.label}</span>
      <span class="rule-demo-stones" aria-hidden="true">${createRuleDemoStones(count, cell.owner)}</span>
      <span class="rule-demo-count">${count}</span>
    </div>
  `;
}

function createRuleDemoStones(count, owner) {
  let html = "";
  const visibleCount = Math.min(count, 8);
  const ownerClass = owner === PLAYER_ONE ? "red" : "purple";

  for (let i = 0; i < visibleCount; i += 1) {
    html += `<span class="rule-demo-stone ${ownerClass}"></span>`;
  }

  return html;
}

function getRuleDemoDropNote(index, player) {
  if (index === RULE_DEMO_MODEL.stores[player]) {
    return "放進自己的棋庫。";
  }

  if (isRuleDemoPit(index, player)) {
    return "落在自己的棋坑。";
  }

  return "落在對手棋坑。";
}

function isRuleDemoPit(index, player) {
  return RULE_DEMO_MODEL.pits[player].includes(index);
}

function getRuleDemoOpponentStore(player) {
  return RULE_DEMO_MODEL.stores[otherPlayer(player)];
}

function isRuleDemoCurrent(token) {
  return token === ruleDemoState.token;
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

function closeRulesCard() {
  ruleDemoState.token += 1;
  closeFloatingCard(rulesOverlay);
}

function closeOpenFloatingCards() {
  for (const overlay of [rulesOverlay, settingsOverlay]) {
    if (!overlay.hidden) {
      if (overlay === rulesOverlay) {
        ruleDemoState.token += 1;
      }
      closeFloatingCard(overlay);
    }
  }
}

function renderTurnIndicator() {
  const showingTurn = !state.awaitingCoinToss && !state.gameOver;
  const activePlayer = showingTurn ? state.activePlayer : 0;
  const neutralSkin = getNeutralSkin(ACTIVE_OBJECT_PACK);

  for (const player of BOARD_MODEL.players) {
    document.body.classList.toggle(getPlayerCssClass(player, "bodyTurn"), activePlayer === player);
    turnIndicator.classList.toggle(getPlayerCssClass(player, "turnIndicator"), activePlayer === player);
  }

  turnIndicator.classList.toggle(neutralSkin.turnIndicatorClass, !showingTurn);

  if (activePlayer) {
    turnEmblem.src = getPlayerStoreSigilUrl(activePlayer);
    turnIndicator.setAttribute("aria-label", `${getPlayerName(activePlayer)}${TEXT.turn}`);
  } else {
    turnEmblem.src = getPackAssetUrl(neutralSkin.turnAsset);
    turnIndicator.setAttribute("aria-label", state.gameOver ? getEndMessage() : TEXT.coinReady);
  }
}

async function tossCoin() {
  if (!state.awaitingCoinToss || state.coinTossing) return;

  const token = state.animationToken;
  const result = Math.random() < 0.5 ? "front" : "back";
  const face = getCoinFace(ACTIVE_OBJECT_PACK, result);
  const firstPlayer = face.player;

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
  setAiDialogue(NARRATOR, getDialogue(face.dialogueKey));
  coinTossStatus.textContent = getCoinResultText(result);
  launchParticles(coinTossOverlay, PARTICLE_PHYSICS.coinTossCount, firstPlayer);
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
    launchParticles(
      resultPanel,
      winner === 0 ? PARTICLE_PHYSICS.resultCounts.draw : PARTICLE_PHYSICS.resultCounts.winner,
      winner
    );
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
  const colorClass = player
    ? getPlayerCssClass(player, "particle")
    : getNeutralSkin(ACTIVE_OBJECT_PACK).particleClass;

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * PARTICLE_PHYSICS.angleJitter;
    const distance = randomBetween(Math.random() * 1000, PARTICLE_PHYSICS.distance.min, PARTICLE_PHYSICS.distance.max);
    const size = randomBetween(Math.random() * 1000, PARTICLE_PHYSICS.size.min, PARTICLE_PHYSICS.size.max);

    particle.className = `particle ${colorClass}`;
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.setProperty("--tx", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--ty", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty(
      "--spin",
      `${randomBetween(Math.random() * 1000, PARTICLE_PHYSICS.spinDegrees.min, PARTICLE_PHYSICS.spinDegrees.max)}deg`
    );
    host.appendChild(particle);

    window.setTimeout(() => particle.remove(), PARTICLE_PHYSICS.lifetimeMs);
  }
}

function createPit(index, owner, column, row) {
  const button = document.createElement("button");
  const count = getStoneCount(index);
  const visibleNumber = getVisiblePitNumber(BOARD_MODEL, index, owner);

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
  const sigil = getPlayerStoreSigilUrl(owner);

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
    const src = getPlayerStoneUrl(stoneOwner);
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
  const physics = STONE_PLACEMENT_PHYSICS[type];
  const slots = physics.slots;
  const visibleCount = Math.min(count, slots.length);
  const scale = getStoneScale(count, type);
  const jitter = physics.jitter;
  const minDistance = getCollisionDistance(count, type);
  const salt = state.layoutSalt[index] || 1;
  const layouts = [];
  const [leftMin, leftMax] = physics.placementBounds.left;
  const [topMin, topMax] = physics.placementBounds.top;

  for (let i = 0; i < visibleCount; i += 1) {
    const [slotLeft, slotTop] = slots[i];
    const seed = salt + owner * 113 + i * 37 + count * 19;
    const left = clamp(slotLeft + randomBetween(seed, -jitter, jitter), leftMin, leftMax);
    const top = clamp(slotTop + randomBetween(seed + 17, -jitter, jitter), topMin, topMax);

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

  relaxStoneCollisions(layouts, minDistance, physics);
  return layouts;
}

function relaxStoneCollisions(layouts, minDistance, physics) {
  const [leftMin, leftMax] = physics.collisionBounds.left;
  const [topMin, topMax] = physics.collisionBounds.top;

  for (let pass = 0; pass < physics.collisionPasses; pass += 1) {
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

        first.left = clamp(first.left - nx * push, leftMin, leftMax);
        first.top = clamp(first.top - ny * push, topMin, topMax);
        second.left = clamp(second.left + nx * push, leftMin, leftMax);
        second.top = clamp(second.top + ny * push, topMin, topMax);
      }
    }
  }
}

function getCollisionDistance(count, type) {
  return selectCountCurveValue(STONE_PLACEMENT_PHYSICS[type].collisionDistances, count);
}

function getStoneScale(count, type) {
  return selectCountCurveValue(STONE_PLACEMENT_PHYSICS[type].scales, count);
}

async function animateStoneBetween(fromIndex, toIndex, stoneOwner, token) {
  const fromCell = getCell(fromIndex);
  const toCell = getCell(toIndex);
  if (!fromCell || !toCell) {
    await sleep(STONE_FLIGHT_PHYSICS.missingCellDelayMs);
    return;
  }

  const from = getCellCenter(fromCell);
  const to = getCellCenter(toCell);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  const arc = Math.min(
    STONE_FLIGHT_PHYSICS.arc.max,
    Math.max(STONE_FLIGHT_PHYSICS.arc.min, distance * STONE_FLIGHT_PHYSICS.arc.distanceFactor)
  );
  const duration = STONE_FLIGHT_PHYSICS.durationMs.base + Math.random() * STONE_FLIGHT_PHYSICS.durationMs.random;
  const image = document.createElement("img");
  const rollDirection = stoneOwner === PLAYER_ONE ? 1 : -1;
  const roll =
    rollDirection *
    randomBetween(Math.random() * 1000, STONE_FLIGHT_PHYSICS.rollDegrees.min, STONE_FLIGHT_PHYSICS.rollDegrees.max);
  const size = clamp(
    Math.min(from.width, from.height) * STONE_FLIGHT_PHYSICS.size.cellFactor,
    STONE_FLIGHT_PHYSICS.size.min,
    STONE_FLIGHT_PHYSICS.size.max
  );

  image.className = "flying-stone";
  image.src = getPlayerStoneUrl(stoneOwner);
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
  state.layoutSalt[index] = createCellLayoutSalt();
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
  void playRuleDemo(ruleDemoState.activeId);
});

settingsButton.addEventListener("click", () => {
  openFloatingCard(settingsOverlay);
});

rulesCloseButton.addEventListener("click", () => {
  closeRulesCard();
});

settingsCloseButton.addEventListener("click", () => {
  closeFloatingCard(settingsOverlay);
});

rulesOverlay.addEventListener("click", (event) => {
  if (event.target === rulesOverlay) {
    closeRulesCard();
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

initializeRulesPanel();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOpenFloatingCards();
  }
});

showMainMenu();
