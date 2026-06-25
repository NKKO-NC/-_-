import { CoinTossScene } from "./coin/index.js?v=20260619a";
import { getDialogue, resetDialogueHistory } from "./dialoguePicker.js?v=20260619a";
import { createKalahAi } from "./game/ai.js?v=20260619a";
import { DIFFICULTY_LABELS, NARRATOR, TEXT } from "./ui/copy.js?v=20260620b";
import { getGameDomRefs } from "./ui/dom.js?v=20260627a";
import { RULE_DEMO_CELLS, RULE_DEMOS } from "./ui/rule-demo-data.js?v=20260627a";
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
} from "./core/object-model.js?v=20260619a";
import {
  PARTICLE_PHYSICS,
  STONE_FLIGHT_PHYSICS,
  STONE_PLACEMENT_PHYSICS,
  selectCountCurveValue,
} from "./core/object-physics.js?v=20260619a";
import { createObjectPackRuntime } from "./core/object-pack-runtime.js?v=20260619a";
import { createVisualPackRuntime } from "./core/visual-pack-runtime.js?v=20260621a";
import { OBSIDIAN_OBJECT_PACK } from "./object-packs/obsidian.js?v=20260627a";
import { ARTIFACT_OBJECT_PACK } from "./object-packs/artifact.js?v=20260621a";
import { ZEN_OBJECT_PACK } from "./object-packs/zen.js?v=20260621b";
import { createSoundPackRuntime } from "./sound/sound-pack-runtime.js?v=20260619b";

const BOARD_MODEL = KALAH_BOARD_MODEL;
const THEME_DEFINITIONS = Object.freeze({
  classic: Object.freeze({
    id: "classic",
    label: "\u7d93\u5178",
    objectPack: OBSIDIAN_OBJECT_PACK,
    visualManifestUrl: "./visual-packs/obsidian-childhood/manifest.json",
  }),
  zen: Object.freeze({
    id: "zen",
    label: "\u79aa\u98a8",
    objectPack: ZEN_OBJECT_PACK,
    visualManifestUrl: "./visual-packs/zen-childhood/manifest.json",
  }),
  artifact: Object.freeze({
    id: "artifact",
    label: "\u8cb4\u5668",
    objectPack: ARTIFACT_OBJECT_PACK,
    visualManifestUrl: "./visual-packs/artifact-childhood/manifest.json",
  }),
});
const AVAILABLE_THEME_IDS = Object.freeze(["classic", "zen"]);
const DEFAULT_THEME_ID = "classic";
let activeThemeId = DEFAULT_THEME_ID;
let objectPack = createObjectPackRuntime(THEME_DEFINITIONS[DEFAULT_THEME_ID].objectPack);
let visualPack = createThemeVisualPack(THEME_DEFINITIONS[DEFAULT_THEME_ID]);
const sound = createSoundPackRuntime({
  manifestUrl: "./sound-packs/procedural-crystal/manifest.json",
});
const ai = createKalahAi(BOARD_MODEL);
const PLAYER_ONE_STORE = getStoreIndex(BOARD_MODEL, PLAYER_ONE);
const PLAYER_TWO_STORE = getStoreIndex(BOARD_MODEL, PLAYER_TWO);
const BOARD_SIZE = BOARD_MODEL.boardSize;
const topPits = BOARD_MODEL.layout.topPits;
const bottomPits = getPlayerPitIndices(BOARD_MODEL, PLAYER_ONE);
const playerTwoPits = getPlayerPitIndices(BOARD_MODEL, PLAYER_TWO);
const COMPACT_LANDSCAPE_MAX_HEIGHT = 560;
const COMPACT_LANDSCAPE_MAX_WIDTH = 980;
const urlParams = new URLSearchParams(window.location.search);
const ENTRY_FRIENDLY_MODE =
  urlParams.has("entryFriendly") || window.location.pathname.toLowerCase().includes("entry-friendly");
const DEFAULT_AI_DIFFICULTY = "easy";
const DEFAULT_PIT_NUMBER_STYLE = "arabic";
const DEFAULT_PLAYER_HINTS_ENABLED = true;
const {
  boardEl,
  statusEl,
  mainMenu,
  gameScreen,
  startButton,
  menuRulesButton,
  resetButton,
  menuButton,
  playerOneScore,
  playerTwoScore,
  playerOneLabel,
  playerTwoLabel,
  turnIndicator,
  turnEmblem,
  modePvpButton,
  modePveButton,
  difficultyField,
  difficultyEasyButton,
  difficultyMediumButton,
  difficultyHardButton,
  controlHint,
  aiDialogue,
  aiDialogueSpeaker,
  aiDialogueLine,
  rulesButton,
  settingsButton,
  rulesOverlay,
  settingsOverlay,
  rulesCloseButton,
  settingsCloseButton,
  rulesList,
  ruleDemoOverlay,
  ruleDemoTitle,
  ruleDemoContent,
  ruleDemoCloseButton,
  ruleDemoReplayButton,
  ruleDemoControls,
  ruleAutoButton,
  ruleStepButton,
  ruleStepControls,
  rulePrevButton,
  ruleNextButton,
  ruleStepIndicator,
  themeSelect,
  pitRomanButton,
  pitArabicButton,
  volumeSlider,
  volumeValue,
  playerHintToggle,
  coinTossOverlay,
  coinTossButton,
  coinCanvas,
  coinTossStatus,
  resultOverlay,
  resultPanel,
  resultKicker,
  resultTitle,
  resultScore,
  resultResetButton,
  resultMenuButton,
  particleField,
} = getGameDomRefs();

function getThemeDefinition(themeId) {
  if (AVAILABLE_THEME_IDS.includes(themeId) && THEME_DEFINITIONS[themeId]) {
    return THEME_DEFINITIONS[themeId];
  }

  return THEME_DEFINITIONS[DEFAULT_THEME_ID];
}

function createThemeVisualPack(theme) {
  return createVisualPackRuntime({
    manifestUrl: theme.visualManifestUrl,
    shouldApply: () => activeThemeId === theme.id,
  });
}

function getThemePlayerClassNames(className) {
  return Object.values(THEME_DEFINITIONS)
    .flatMap((theme) => Object.values(theme.objectPack.players).map((player) => player.classes[className]))
    .filter(Boolean);
}

function getThemeNeutralClassNames(className) {
  return Object.values(THEME_DEFINITIONS)
    .map((theme) => theme.objectPack.neutral[className])
    .filter(Boolean);
}

function clearThemeStateClasses() {
  document.body.classList.remove(...getThemePlayerClassNames("bodyTurn"));
  turnIndicator.classList.remove(
    ...getThemePlayerClassNames("turnIndicator"),
    ...getThemeNeutralClassNames("turnIndicatorClass")
  );
}

function getPackAssetUrl(assetId) {
  return objectPack.getAssetUrl(assetId);
}

function getCoinFace(face) {
  return objectPack.getCoinFace(face);
}

function getNeutralSkin() {
  return objectPack.getNeutralSkin();
}

function getPlayerCssClass(player, className) {
  return objectPack.getPlayerCssClass(player, className);
}

function getPlayerSkin(player) {
  return objectPack.getPlayerSkin(player);
}

function getPlayerStoneUrl(player) {
  return objectPack.getPlayerStoneUrl(player);
}

function getPlayerStoreSigilUrl(player) {
  return objectPack.getPlayerStoreSigilUrl(player);
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
    setFace() {},
    dispose() {},
  };
}

function createCoinScene() {
  try {
    const scene = new CoinTossScene({
      canvas: coinCanvas,
      coinSrc: getPackAssetUrl(objectPack.pack.coin.bodyAsset),
      dragonSrc: getPackAssetUrl(getCoinFace("front").faceAsset),
      shieldSrc: getPackAssetUrl(getCoinFace("back").faceAsset),
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
      setFace(face) {
        void scene.ready
          .then(() => {
            scene.setFace(face);
          })
          .catch((error) => {
            console.warn("Coin scene face sync failed. Falling back to static coin.", error);
            setCoinFallbackVisual();
          });
      },
      dispose() {
        scene.dispose();
      },
    };
  } catch (error) {
    console.warn("Coin scene setup failed. Falling back to static coin.", error);
    return createFallbackCoinScene();
  }
}

objectPack.applySkin({ coinTossButton });
let coinScene = createCoinScene();

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
  aiDifficulty: DEFAULT_AI_DIFFICULTY,
  themeId: DEFAULT_THEME_ID,
  humanPlayer: 1,
  aiPlayer: 2,
  aiThinking: false,
  aiThinkDelayMs: 520,
  pitNumberStyle: DEFAULT_PIT_NUMBER_STYLE,
  volumePercent: 100,
  playerHintsEnabled: DEFAULT_PLAYER_HINTS_ENABLED,
  moveHint: null,
  gameExplanationAutoOpened: false,
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

const RULE_AUTO_START_DELAY_MS = 320;
const RULE_FRAME_HOLD_MS = 1700;
const RULE_NOTE_FADE_MS = 420;

const ruleDemoState = {
  activeId: RULE_DEMOS[0].id,
  token: 0,
  mode: "auto",
  frameIndex: 0,
  completed: false,
  notePhase: "in",
  setupInfoId: "player-pits",
};

const LOW_SIDE_THRESHOLD = 8;

if (ENTRY_FRIENDLY_MODE) {
  document.documentElement.dataset.entryFriendly = "true";
}

function updateBoardLayoutMode() {
  const viewport = window.visualViewport;
  const width = Math.round(viewport?.width ?? window.innerWidth);
  const height = Math.round(viewport?.height ?? window.innerHeight);
  const isPortrait = height >= width && width <= 760;
  const isCompactLandscape =
    width > height && (height <= COMPACT_LANDSCAPE_MAX_HEIGHT || width <= COMPACT_LANDSCAPE_MAX_WIDTH);
  const layoutMode = isPortrait ? "portrait" : isCompactLandscape ? "compact-landscape" : "landscape";

  document.documentElement.dataset.boardLayout = layoutMode;
}

function createInitialBoard() {
  return createInitialObjectBoard(BOARD_MODEL);
}

function resetGame() {
  void sound.unlock();
  void sound.playEvent("music.game");
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
  state.moveHint = null;
  state.message = TEXT.coinReady;
  resetDialogueHistory();
  setAiDialogue(NARRATOR, getDialogue("coin.beforeToss"));
  hideResultOverlay();
  resetCoinVisual();
  render();
}

function showMainMenu() {
  sound.stopEvent("music.game", 700);
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
  state.moveHint = null;
  state.message = "";
  setAiDialogue("", "");
  hideResultOverlay();
  resetCoinVisual();
  coinTossOverlay.hidden = true;
  coinTossOverlay.classList.remove("is-visible");
  clearThemeStateClasses();
  renderInterfaceState();
  maybeOpenEntryFriendlyExplanation();
}

function maybeOpenEntryFriendlyExplanation() {
  if (!ENTRY_FRIENDLY_MODE || state.gameExplanationAutoOpened) return;

  state.gameExplanationAutoOpened = true;
  window.setTimeout(() => {
    if (state.screen === "menu") {
      openFloatingCard(rulesOverlay);
    }
  }, 260);
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

function canPreviewMove(index) {
  return state.playerHintsEnabled && canSelect(index);
}

function showMoveHint(startIndex) {
  state.moveHint = createMoveHint(startIndex, state.activePlayer);
  state.message = "\u9810\u89bd\u8def\u5f91\uff1a\u518d\u9ede\u540c\u4e00\u500b\u68cb\u5751\u78ba\u8a8d\u884c\u68cb";
  setAiDialogue(NARRATOR, "\u4eae\u5708\u662f\u68cb\u5b50\u6703\u7d93\u904e\u7684\u4f4d\u7f6e\uff1b\u6700\u4eae\u7684\u662f\u6700\u5f8c\u843d\u9ede\u3002");
  render();
}

function clearMoveHint() {
  if (!state.moveHint) return;

  state.moveHint = null;
  render();
}

function createMoveHint(startIndex, player) {
  const opponentStore = getOpponentStore(player);
  const cells = new Map();
  const drops = [];
  let currentIndex = startIndex;

  for (let i = 0; i < getStoneCount(startIndex); i += 1) {
    currentIndex = (currentIndex + 1) % BOARD_SIZE;
    if (currentIndex === opponentStore) {
      currentIndex = (currentIndex + 1) % BOARD_SIZE;
    }

    const visit = (cells.get(currentIndex)?.visits ?? 0) + 1;
    const entry = {
      index: currentIndex,
      visits: visit,
      order: drops.length + 1,
      landing: false,
    };
    cells.set(currentIndex, entry);
    drops.push(entry);
  }

  if (drops.length) {
    drops[drops.length - 1].landing = true;
    cells.set(drops[drops.length - 1].index, drops[drops.length - 1]);
  }

  return { startIndex, player, cells };
}

function getMoveHintCell(index) {
  return state.moveHint?.cells?.get(index) ?? null;
}

function createMoveHintRings(index) {
  const hint = getMoveHintCell(index);
  if (!hint) return "";

  const ringCount = Math.min(hint.visits, 6);
  let html = `<span class="move-hint-rings" aria-hidden="true">`;
  for (let i = 0; i < ringCount; i += 1) {
    html += `<span class="move-hint-ring" style="--ring-index: ${i};"></span>`;
  }
  html += `</span>`;
  return html;
}

function getMoveHintClasses(index) {
  const hint = getMoveHintCell(index);
  if (!hint) return "";

  const playerClass = hint.landing
    ? " hint-landing"
    : state.moveHint.player === PLAYER_ONE
      ? " hint-player-one"
      : " hint-player-two";
  return ` move-hint-cell${playerClass}`;
}

function getPlayerName(player) {
  if (state.mode === "pve") {
    return player === 1 ? TEXT.player : TEXT.ai;
  }

  return getPlayerSkin(player)?.label ?? "";
}

function getSideName(player) {
  return getPlayerSkin(player)?.sideLabel ?? "";
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

  return getPlayerSkin(player)?.label ?? "";
}

function getDifficultyLabel() {
  return DIFFICULTY_LABELS[state.aiDifficulty] || DIFFICULTY_LABELS.medium;
}

function getModeSummary() {
  return state.mode === "pve" ? `\u55ae\u4eba\u5c0d\u6230 \u00b7 ${getDifficultyLabel()}` : "\u96d9\u4eba\u5c0d\u6230";
}

function getCoinResultText(result) {
  const face = getCoinFace(result);
  return face?.resultText?.[state.mode] ?? face?.resultText?.pvp ?? "";
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

  const move = ai.chooseMove({
    stoneBoard: state.board,
    player: state.aiPlayer,
    difficulty: state.aiDifficulty,
  });
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
    void sound.playEvent("ui.invalid");
    return;
  }

  void sound.playEvent("stone.pickup");

  const token = state.animationToken + 1;
  state.animationToken = token;
  state.animating = true;
  state.moveHint = null;
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
    void sound.playEvent(isStore(currentIndex) ? "stone.drop.store" : "stone.drop.pit");
    if (!isStore(currentIndex) && Math.random() < 0.32) {
      void sound.playEvent("stone.collision");
    }
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
      void sound.playEvent("stone.capture");
      render();
      await sleep(STONE_FLIGHT_PHYSICS.postCaptureDelayMs);
    }
  }

  const ended = maybeEndGame();

  if (ended) {
    state.message = getEndMessage();
  } else if (currentIndex === ownStore) {
    state.message = `${getPlayerName(movingPlayer)}${TEXT.extra}`;
    void sound.playEvent("turn.extra");
  } else {
    state.activePlayer = otherPlayer(movingPlayer);
    void sound.playEvent("turn.change");
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

  if (
    ENTRY_FRIENDLY_MODE &&
    !ended &&
    state.mode === "pve" &&
    state.activePlayer === state.humanPlayer &&
    !state.gameOver
  ) {
    state.message = "\u8f2a\u5230\u4f60\uff1a\u9ede\u4e0b\u6392\u7d05\u65b9\u68cb\u5751";
    if (movingPlayer === state.aiPlayer) {
      setAiDialogue(NARRATOR, "AI \u8d70\u5b8c\u4e86\u3002\u4e0b\u6392\u6709\u4eae\u8d77\u7684\u7d05\u65b9\u68cb\u5751\u90fd\u53ef\u4ee5\u9ede\u3002");
    }
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
  modePveButton.setAttribute("aria-expanded", String(state.mode === "pve"));

  for (const [difficulty, button] of Object.entries(difficultyButtons)) {
    button.classList.toggle("is-active", state.aiDifficulty === difficulty);
    button.setAttribute("aria-pressed", String(state.aiDifficulty === difficulty));
  }

  controlHint.textContent =
    state.mode === "pve"
      ? "\u7b2c\u4e00\u6b21\u5efa\u8b70\uff1a\u7c21\u55ae\u96e3\u5ea6\u3001\u963f\u62c9\u4f2f\u6578\u5b57\u3001\u8def\u5f91\u63d0\u793a\u5df2\u958b\u555f\u3002"
      : TEXT.pvpHint;
  aiDialogue.hidden = state.screen !== "game";
  aiDialogueSpeaker.textContent = state.aiDialogue.speaker;
  aiDialogueLine.textContent = state.aiDialogue.line;
  renderSettingsState();
}

function renderSettingsState() {
  const isRoman = state.pitNumberStyle === "roman";

  themeSelect.value = AVAILABLE_THEME_IDS.includes(state.themeId) ? state.themeId : DEFAULT_THEME_ID;
  pitRomanButton.classList.toggle("is-active", isRoman);
  pitArabicButton.classList.toggle("is-active", !isRoman);
  pitRomanButton.setAttribute("aria-pressed", String(isRoman));
  pitArabicButton.setAttribute("aria-pressed", String(!isRoman));
  volumeSlider.value = String(state.volumePercent);
  volumeValue.textContent = `${state.volumePercent}%`;
  playerHintToggle.checked = state.playerHintsEnabled;
}

function syncCoinSceneFace() {
  coinTossButton.classList.remove("is-fallback");
  coinScene.setFace(state.coinResult || "front");
}

function setTheme(themeId) {
  const nextTheme = getThemeDefinition(themeId);
  if (state.themeId === nextTheme.id) {
    renderSettingsState();
    return;
  }

  state.themeId = nextTheme.id;
  activeThemeId = nextTheme.id;
  clearThemeStateClasses();
  objectPack = createObjectPackRuntime(nextTheme.objectPack);
  visualPack = createThemeVisualPack(nextTheme);
  objectPack.applySkin({ coinTossButton });
  coinScene.dispose();
  coinScene = createCoinScene();
  syncCoinSceneFace();
  render();

  void visualPack.ready.then(() => {
    if (state.themeId === nextTheme.id) {
      render();
    }
  });
}

function setPitNumberStyle(style) {
  if (state.pitNumberStyle === style) return;

  state.pitNumberStyle = style;
  render();
}

function setVolumePercent(value) {
  state.volumePercent = Math.round(clamp(Number(value), 0, 100));
  sound.setMasterVolume(state.volumePercent / 100);
  renderSettingsState();
}

function setPlayerHintsEnabled(enabled) {
  state.playerHintsEnabled = Boolean(enabled);
  if (!state.playerHintsEnabled) {
    state.moveHint = null;
  }
  render();
}

function initializeRulesPanel() {
  renderRulesList();
}

function renderRulesList() {
  if (!rulesList) return;

  rulesList.innerHTML = "";

  for (const rule of RULE_DEMOS) {
    const item = document.createElement("button");
    const isActive = rule.id === ruleDemoState.activeId;

    item.type = "button";
    item.className = `rule-item${isActive ? " is-active" : ""}`;
    item.setAttribute("role", "listitem");
    item.innerHTML = `
      <span class="rule-title">${rule.title}</span>
      <span class="rule-summary">${rule.summary}</span>
    `;
    item.addEventListener("click", () => {
      openRuleDemoCard(rule.id);
    });

    rulesList.appendChild(item);
  }
}

function getRuleDemo(ruleId) {
  return RULE_DEMOS.find((rule) => rule.id === ruleId) ?? RULE_DEMOS[0];
}

function openRuleDemoCard(ruleId = ruleDemoState.activeId) {
  const rule = getRuleDemo(ruleId);

  ruleDemoState.activeId = rule.id;
  ruleDemoState.token += 1;
  ruleDemoState.mode = isAnimatedRule(rule) ? "auto" : rule.type;
  ruleDemoState.frameIndex = 0;
  ruleDemoState.completed = !isAnimatedRule(rule);
  ruleDemoState.notePhase = "in";
  ruleDemoState.setupInfoId = rule.setupInfo?.[0]?.id ?? ruleDemoState.setupInfoId;

  renderRulesList();
  renderRuleDemoCard();
  openFloatingCard(ruleDemoOverlay);

  if (isAnimatedRule(rule)) {
    void playRuleDemoAuto(ruleDemoState.token, true);
  }
}

async function playRuleDemoAuto(token = ruleDemoState.token, initialFrameRendered = false) {
  const rule = getRuleDemo(ruleDemoState.activeId);
  const frames = getRuleFrames(rule);

  if (!frames.length) return;

  ruleDemoState.mode = "auto";
  ruleDemoState.completed = false;
  ruleDemoState.frameIndex = 0;
  ruleDemoState.notePhase = "in";
  if (!initialFrameRendered) {
    renderRuleDemoCard();
  }
  await sleep(RULE_AUTO_START_DELAY_MS);

  for (let index = 0; index < frames.length; index += 1) {
    if (!isRuleDemoCurrent(token) || ruleDemoState.mode !== "auto") return;
    ruleDemoState.frameIndex = index;
    ruleDemoState.notePhase = "in";
    if (!initialFrameRendered || index > 0) {
      renderRuleDemoCard();
    }
    await sleep(RULE_FRAME_HOLD_MS);

    if (index < frames.length - 1) {
      if (!isRuleDemoCurrent(token) || ruleDemoState.mode !== "auto") return;
      ruleDemoState.notePhase = "out";
      renderRuleDemoCard();
      await sleep(RULE_NOTE_FADE_MS);
    }
  }

  if (!isRuleDemoCurrent(token) || ruleDemoState.mode !== "auto") return;
  ruleDemoState.completed = true;
  ruleDemoState.notePhase = "in";
  renderRuleDemoCard();
}

function replayRuleDemoAuto() {
  const rule = getRuleDemo(ruleDemoState.activeId);
  if (!isAnimatedRule(rule)) return;

  ruleDemoState.token += 1;
  void playRuleDemoAuto(ruleDemoState.token);
}

function setRuleDemoMode(mode) {
  const rule = getRuleDemo(ruleDemoState.activeId);
  if (!isAnimatedRule(rule)) return;

  ruleDemoState.token += 1;
  ruleDemoState.mode = mode;
  ruleDemoState.frameIndex = 0;
  ruleDemoState.completed = false;
  ruleDemoState.notePhase = "in";
  renderRuleDemoCard();

  if (mode === "auto") {
    void playRuleDemoAuto(ruleDemoState.token, true);
  }
}

function moveRuleDemoStep(delta) {
  const rule = getRuleDemo(ruleDemoState.activeId);
  const frames = getRuleFrames(rule);
  if (ruleDemoState.mode !== "step" || !frames.length) return;

  ruleDemoState.frameIndex = clamp(ruleDemoState.frameIndex + delta, 0, frames.length - 1);
  ruleDemoState.completed = ruleDemoState.frameIndex === frames.length - 1;
  ruleDemoState.notePhase = "in";
  renderRuleDemoCard();
}

function closeRuleDemoCard() {
  ruleDemoState.token += 1;
  closeFloatingCard(ruleDemoOverlay);
}

function renderRuleDemoCard() {
  const rule = getRuleDemo(ruleDemoState.activeId);
  if (!ruleDemoTitle || !ruleDemoContent) return;

  ruleDemoTitle.textContent = rule.title;
  ruleDemoContent.innerHTML = createRuleDemoContent(rule);
  renderRuleDemoControls(rule);
}

function renderRuleDemoControls(rule) {
  const isAnimation = isAnimatedRule(rule);
  const frames = getRuleFrames(rule);
  const isStep = ruleDemoState.mode === "step";

  if (ruleDemoControls) {
    ruleDemoControls.hidden = !isAnimation;
  }

  if (ruleDemoReplayButton) {
    ruleDemoReplayButton.hidden = !isAnimation || !ruleDemoState.completed;
  }

  ruleAutoButton?.classList.toggle("is-active", isAnimation && ruleDemoState.mode === "auto");
  ruleStepButton?.classList.toggle("is-active", isAnimation && isStep);
  ruleAutoButton?.setAttribute("aria-pressed", String(isAnimation && ruleDemoState.mode === "auto"));
  ruleStepButton?.setAttribute("aria-pressed", String(isAnimation && isStep));

  if (ruleStepControls) {
    ruleStepControls.hidden = !isAnimation || !isStep;
  }

  if (rulePrevButton) {
    rulePrevButton.disabled = !isStep || ruleDemoState.frameIndex <= 0;
  }

  if (ruleNextButton) {
    ruleNextButton.disabled = !isStep || ruleDemoState.frameIndex >= frames.length - 1;
  }

  if (ruleStepIndicator) {
    ruleStepIndicator.textContent = frames.length
      ? `${ruleDemoState.frameIndex + 1} / ${frames.length}`
      : "";
  }
}

function createRuleDemoContent(rule) {
  if (rule.type === "setup") return createRuleSetupCard(rule);
  if (isAnimatedRule(rule)) return createRuleAnimationCard(rule);
  return createRuleTextCard(rule);
}

function isAnimatedRule(rule) {
  return rule.type === "animation";
}

function createRuleSetupCard(rule) {
  const activeInfo = getActiveSetupInfo(rule);

  return `
    <div class="rule-demo-guidance">
      <p class="rule-demo-primary">&#36938;&#25138;&#29256;&#38754;&#35469;&#35672;</p>
      <p class="rule-demo-secondary">&#27491;&#24335;&#26827;&#30436;&#27599;&#20491;&#26827;&#22353;&#25918; 6 &#38982;&#65307;&#36889;&#35041;&#29992;&#23569;&#37327;&#26827;&#23376;&#31034;&#31684;&#12290;</p>
    </div>
    <div class="rule-setup-layout">
      <div class="rule-demo-board setup-board" aria-label="&#36938;&#25138;&#21021;&#22987;&#35373;&#32622;&#31034;&#31684;">
        ${RULE_DEMO_CELLS.map((cell) =>
          createRuleDemoCell(cell, rule.board, { activeIndices: activeInfo?.indices ?? [] })
        ).join("")}
        ${rule.setupInfo.map((info) => createSetupSideFrame(info)).join("")}
      </div>
      <div class="rule-setup-info" aria-live="polite">
        <strong>${activeInfo?.label ?? "\u7248\u9762"}</strong>
        <p>${activeInfo?.description ?? ""}</p>
      </div>
    </div>
  `;
}

function createSetupSideFrame(info) {
  const isActive = ruleDemoState.setupInfoId === info.id;
  const frameClass = info.frameClass ?? info.id;

  return `
    <button
      class="setup-side-frame ${frameClass}${isActive ? " is-active" : ""}"
      type="button"
      data-info-id="${info.id}"
      aria-label="${escapeHtml(`${info.label}\u8aaa\u660e`)}"
    >
      <span>${info.label}</span>
      <b aria-hidden="true">!</b>
    </button>
  `;
}

function createRuleTextCard(rule) {
  return `
    <div class="rule-demo-guidance rule-text-card">
      <p class="rule-demo-primary">${escapeHtml(rule.header ?? rule.summary)}</p>
      <div class="rule-text-grid">
        ${(rule.sections ?? [])
          .map(
            (section) => `
              <section class="rule-text-item">
                <strong>${escapeHtml(section.label)}</strong>
                ${
                  Array.isArray(section.items) && section.items.length
                    ? `<ul class="rule-text-list">${section.items
                        .map((item) => `<li>${escapeHtml(item)}</li>`)
                        .join("")}</ul>`
                    : `<p>${escapeHtml(section.text)}</p>`
                }
              </section>
            `
          )
          .join("")}
      </div>
    </div>
  `;
}

function createRuleAnimationCard(rule) {
  const frames = getRuleFrames(rule);
  const frame = frames[ruleDemoState.frameIndex] ?? frames[0];
  const legend = rule.legend?.length
    ? `<div class="rule-demo-legend">${rule.legend.map((item) => `<span>${item}</span>`).join("")}</div>`
    : "";

  return `
    <div class="rule-demo-guidance">
      <p class="rule-demo-primary">${rule.header ?? rule.summary}</p>
      ${legend}
    </div>
    <div class="rule-demo-board" aria-label="&#35215;&#21063;&#31034;&#31684;&#26827;&#30436;">
      ${RULE_DEMO_CELLS.map((cell) => createRuleDemoCell(cell, frame.board, frame)).join("")}
    </div>
    <p class="rule-demo-note ${ruleDemoState.notePhase === "out" ? "is-fading-out" : "is-visible"}">${createRuleNoteText(frame.note)}</p>
  `;
}

function createRuleDemoCell(cell, board, options = {}) {
  const activeIndices = new Set(options.activeIndices ?? []);
  const skippedIndex = options.skippedIndex;
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
    <div class="${classes}" data-index="${cell.index}" role="group" aria-label="${escapeHtml(`${cell.label}\uff0c${count} \u9846\u68cb\u5b50`)}">
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

function getRuleFrames(rule) {
  return rule.frames ?? [];
}

function createRuleNoteText(text = "") {
  return Array.from(text)
    .map((char, index) => {
      const safeChar = char === " " ? "&nbsp;" : escapeHtml(char);
      return `<span class="rule-note-char" style="--char-index:${index};">${safeChar}</span>`;
    })
    .join("");
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getActiveSetupInfo(rule) {
  return rule.setupInfo?.find((info) => info.id === ruleDemoState.setupInfoId) ?? rule.setupInfo?.[0];
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
  closeFloatingCard(ruleDemoOverlay);
  closeFloatingCard(rulesOverlay);
}

function closeOpenFloatingCards() {
  for (const overlay of [ruleDemoOverlay, rulesOverlay, settingsOverlay]) {
    if (!overlay.hidden) {
      if (overlay === ruleDemoOverlay || overlay === rulesOverlay) {
        ruleDemoState.token += 1;
      }
      closeFloatingCard(overlay);
    }
  }
}

function renderTurnIndicator() {
  const showingTurn = !state.awaitingCoinToss && !state.gameOver;
  const activePlayer = showingTurn ? state.activePlayer : 0;
  const neutralSkin = getNeutralSkin();

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
  const result = ENTRY_FRIENDLY_MODE && state.mode === "pve" ? "front" : Math.random() < 0.5 ? "front" : "back";
  const face = getCoinFace(result);
  const firstPlayer = face.player;

  void sound.playEvent("coin.toss");
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
  if (ENTRY_FRIENDLY_MODE && state.mode === "pve" && state.activePlayer === state.humanPlayer) {
    state.message = "\u8f2a\u5230\u4f60\uff1a\u9ede\u4e0b\u6392\u7d05\u65b9\u68cb\u5751";
    setAiDialogue(NARRATOR, "\u8f2a\u5230\u4f60\u4e86\u3002\u7b2c\u4e00\u6b21\u9ede\u68cb\u5751\u6703\u5148\u770b\u8def\u5f91\uff0c\u518d\u9ede\u540c\u4e00\u5751\u624d\u6703\u771f\u6b63\u884c\u68cb\u3002");
  }
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
  const resultSound =
    winner === 0 ? "result.draw" : state.mode === "pve" && winner !== state.humanPlayer ? "result.defeat" : "result.victory";

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
    void sound.playEvent(resultSound);
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
    : getNeutralSkin().particleClass;
  const particleKind = player === PLAYER_ONE ? "ruby" : player === PLAYER_TWO ? "amethyst" : "gold";

  for (let i = 0; i < count; i += 1) {
    const particle = document.createElement("span");
    const angle = (Math.PI * 2 * i) / count + Math.random() * PARTICLE_PHYSICS.angleJitter;
    const distance = randomBetween(Math.random() * 1000, PARTICLE_PHYSICS.distance.min, PARTICLE_PHYSICS.distance.max);
    const size = randomBetween(Math.random() * 1000, PARTICLE_PHYSICS.size.min, PARTICLE_PHYSICS.size.max);

    particle.className = `particle ${colorClass}`;
    const particleUrl = visualPack.getParticleUrl(particleKind);
    if (particleUrl) {
      particle.classList.add("has-sprite");
      particle.style.backgroundImage = `url("${particleUrl}")`;
    }
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
  button.className = `pit cell${state.lastDropIndex === index ? " just-dropped" : ""}${getMoveHintClasses(index)}`;
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
    ${createMoveHintRings(index)}
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

  store.className = `store cell ${className}${state.lastDropIndex === index ? " just-dropped" : ""}${getMoveHintClasses(index)}`;
  store.dataset.index = String(index);
  store.setAttribute("role", "group");
  store.setAttribute("aria-label", `${label}\uff0c${count} ${TEXT.stones}`);
  store.innerHTML = `
    ${createMoveHintRings(index)}
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

modePveButton.addEventListener("click", () => {
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

updateBoardLayoutMode();
window.addEventListener("resize", updateBoardLayoutMode, { passive: true });
window.addEventListener("orientationchange", updateBoardLayoutMode, { passive: true });
window.visualViewport?.addEventListener("resize", updateBoardLayoutMode, { passive: true });

window.addEventListener(
  "pointerdown",
  () => {
    void sound.unlock();
  },
  { once: true, passive: true }
);

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button || button.matches(".pit, #coinTossButton")) return;

  void sound.playEvent("ui.button");
});

rulesButton.addEventListener("click", () => {
  openFloatingCard(rulesOverlay);
});

menuRulesButton.addEventListener("click", () => {
  openFloatingCard(rulesOverlay);
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

ruleDemoCloseButton.addEventListener("click", closeRuleDemoCard);

ruleDemoReplayButton.addEventListener("click", replayRuleDemoAuto);

ruleAutoButton.addEventListener("click", () => {
  setRuleDemoMode("auto");
});

ruleStepButton.addEventListener("click", () => {
  setRuleDemoMode("step");
});

rulePrevButton.addEventListener("click", () => {
  moveRuleDemoStep(-1);
});

ruleNextButton.addEventListener("click", () => {
  moveRuleDemoStep(1);
});

ruleDemoContent.addEventListener("click", (event) => {
  const infoButton = event.target.closest(".setup-side-frame");
  if (!infoButton) return;

  ruleDemoState.setupInfoId = infoButton.dataset.infoId;
  renderRuleDemoCard();
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

ruleDemoOverlay.addEventListener("click", (event) => {
  if (event.target === ruleDemoOverlay) {
    closeRuleDemoCard();
  }
});

themeSelect.addEventListener("change", () => {
  setTheme(themeSelect.value);
});

pitRomanButton.addEventListener("click", () => {
  setPitNumberStyle("roman");
});

pitArabicButton.addEventListener("click", () => {
  setPitNumberStyle("arabic");
});

volumeSlider.addEventListener("input", () => {
  setVolumePercent(volumeSlider.value);
});

playerHintToggle.addEventListener("change", () => {
  setPlayerHintsEnabled(playerHintToggle.checked);
});

boardEl.addEventListener("click", (event) => {
  const pit = event.target.closest(".pit");
  if (!pit) return;

  const index = Number(pit.dataset.index);
  if (canPreviewMove(index)) {
    if (state.moveHint?.startIndex !== index) {
      showMoveHint(index);
      void sound.playEvent("ui.button");
      return;
    }

    state.moveHint = null;
  }

  void makeMove(index);
});

coinTossButton.addEventListener("click", tossCoin);

initializeRulesPanel();

window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeOpenFloatingCards();
  }
});

showMainMenu();
