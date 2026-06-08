const STARTING_STONES = 6;
const PLAYER_ONE_STORE = 6;
const PLAYER_TWO_STORE = 13;
const BOARD_SIZE = 14;
const RUBY_SRC = "assets/ruby-gem.png";
const AMETHYST_SRC = "assets/amethyst-gem.png";

const TEXT = {
  red: "\u7d05\u65b9",
  purple: "\u7d2b\u65b9",
  turn: "\u884c\u68cb",
  extra: "\u518d\u884c\u4e00\u624b",
  capture: "\u5403\u5b50",
  draw: "\u5e73\u5c40",
  win: "\u52dd",
  store: "\u91d1\u5eab",
  pit: "\u7a74",
  stones: "\u5b50",
};

const boardEl = document.querySelector("#board");
const statusEl = document.querySelector("#status");
const resetButton = document.querySelector("#resetButton");
const playerOneScore = document.querySelector("#playerOneScore");
const playerTwoScore = document.querySelector("#playerTwoScore");
const turnOrb = document.querySelector("#turnOrb");

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
  animationToken: 0,
  lastDropIndex: null,
  lastDropKey: 0,
  message: "",
  layoutSalt: Array.from({ length: BOARD_SIZE }, () => Math.random() * 100000),
};

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
  state.board = createInitialBoard();
  state.activePlayer = 1;
  state.gameOver = false;
  state.animating = false;
  state.lastDropIndex = null;
  state.lastDropKey = 0;
  state.layoutSalt = Array.from({ length: BOARD_SIZE }, () => Math.random() * 100000);
  state.message = `${TEXT.red}${TEXT.turn}`;
  render();
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

function getStoneCount(index) {
  return state.board[index].length;
}

function canSelect(index) {
  return (
    !state.gameOver &&
    !state.animating &&
    !isStore(index) &&
    getOwner(index) === state.activePlayer &&
    getStoneCount(index) > 0
  );
}

async function makeMove(startIndex) {
  if (!canSelect(startIndex)) return;

  const token = state.animationToken + 1;
  state.animationToken = token;
  state.animating = true;
  boardEl.classList.add("is-sowing");

  const movingPlayer = state.activePlayer;
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
    state.activePlayer = movingPlayer === 1 ? 2 : 1;
    state.message =
      captureCount > 0
        ? `${getPlayerName(movingPlayer)}${TEXT.capture} ${captureCount}\uff0c${getPlayerName(state.activePlayer)}${TEXT.turn}`
        : `${getPlayerName(state.activePlayer)}${TEXT.turn}`;
  }

  state.animating = false;
  boardEl.classList.remove("is-sowing");
  render();
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
    ? `${TEXT.red}${TEXT.win} ${redScore} : ${purpleScore}`
    : `${TEXT.purple}${TEXT.win} ${purpleScore} : ${redScore}`;
}

function getPlayerName(player) {
  return player === 1 ? TEXT.red : TEXT.purple;
}

function render() {
  boardEl.innerHTML = "";
  boardEl.classList.toggle("is-sowing", state.animating);
  boardEl.appendChild(createStore(PLAYER_TWO_STORE, `${TEXT.purple}${TEXT.store}`, "p2-store"));

  topPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, 2, position + 2, 1));
  });

  bottomPits.forEach((index, position) => {
    boardEl.appendChild(createPit(index, 1, position + 2, 2));
  });

  boardEl.appendChild(createStore(PLAYER_ONE_STORE, `${TEXT.red}${TEXT.store}`, "p1-store"));
  playerOneScore.querySelector("strong").textContent = getStoneCount(PLAYER_ONE_STORE);
  playerTwoScore.querySelector("strong").textContent = getStoneCount(PLAYER_TWO_STORE);
  playerOneScore.classList.toggle("active", state.activePlayer === 1 && !state.gameOver);
  playerTwoScore.classList.toggle("active", state.activePlayer === 2 && !state.gameOver);
  turnOrb.classList.toggle("purple", state.activePlayer === 2);
  statusEl.textContent = state.message;
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
    <span class="label">${visibleNumber}</span>
    <span class="stones">${createStones(index, state.board[index], owner, "pit")}</span>
    <span class="pit-count">${count}</span>
  `;

  return button;
}

function createStore(index, label, className) {
  const store = document.createElement("div");
  const owner = getOwner(index);
  const count = getStoneCount(index);

  store.className = `store cell ${className}${state.lastDropIndex === index ? " just-dropped" : ""}`;
  store.dataset.index = String(index);
  store.setAttribute("role", "group");
  store.setAttribute("aria-label", `${label}\uff0c${count} ${TEXT.stones}`);
  store.innerHTML = `
    <span class="label">${label}</span>
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
    const src = stoneOwner === 1 ? RUBY_SRC : AMETHYST_SRC;
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
  image.src = stoneOwner === 1 ? RUBY_SRC : AMETHYST_SRC;
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

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

boardEl.addEventListener("click", (event) => {
  const pit = event.target.closest(".pit");
  if (!pit) return;
  void makeMove(Number(pit.dataset.index));
});

resetButton.addEventListener("click", resetGame);

resetGame();
