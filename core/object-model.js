const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

function createBoardModel({ id, pitsPerSide = 6, startingStonesPerPit = 6 }) {
  const bottomPits = Array.from({ length: pitsPerSide }, (_, index) => index);
  const playerOneStore = pitsPerSide;
  const topPitsAscending = Array.from({ length: pitsPerSide }, (_, index) => pitsPerSide + 1 + index);
  const playerTwoStore = pitsPerSide * 2 + 1;

  return deepFreeze({
    id,
    players: [PLAYER_ONE, PLAYER_TWO],
    pitsPerSide,
    boardSize: pitsPerSide * 2 + 2,
    startingStonesPerPit,
    stores: {
      [PLAYER_ONE]: playerOneStore,
      [PLAYER_TWO]: playerTwoStore,
    },
    pits: {
      [PLAYER_ONE]: bottomPits,
      [PLAYER_TWO]: topPitsAscending,
    },
    layout: {
      topPits: [...topPitsAscending].reverse(),
      bottomPits,
    },
    oppositePitIndexSum: pitsPerSide * 2,
  });
}

const KALAH_BOARD_MODEL = createBoardModel({
  id: "kalah-standard-6x6",
  pitsPerSide: 6,
  startingStonesPerPit: 6,
});

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

function createInitialObjectBoard(model = KALAH_BOARD_MODEL) {
  return Array.from({ length: model.boardSize }, (_, index) => {
    const owner = getBoardSpaceOwner(model, index);
    if (!owner || isStoreIndex(model, index)) {
      return [];
    }

    return Array(model.startingStonesPerPit).fill(owner);
  });
}

function createLayoutSalt(model = KALAH_BOARD_MODEL, random = Math.random) {
  return Array.from({ length: model.boardSize }, () => createCellLayoutSalt(random));
}

function createCellLayoutSalt(random = Math.random) {
  return random() * 100000;
}

function getBoardSpaceOwner(model, index) {
  for (const player of model.players) {
    if (model.pits[player].includes(index) || model.stores[player] === index) {
      return player;
    }
  }

  return 0;
}

function isStoreIndex(model, index) {
  return Object.values(model.stores).includes(index);
}

function getStoreIndex(model, player) {
  return model.stores[player];
}

function getOpponentStoreIndex(model, player) {
  return getStoreIndex(model, getOpponentPlayer(model, player));
}

function getPlayerPitIndices(model, player) {
  return model.pits[player];
}

function getOpponentPlayer(model, player) {
  return model.players.find((candidate) => candidate !== player) || 0;
}

function getOppositePitIndex(model, index) {
  return model.oppositePitIndexSum - index;
}

function getVisiblePitNumber(model, index, owner) {
  const pits = getPlayerPitIndices(model, owner);
  const position = pits.indexOf(index);
  if (position < 0) {
    return 0;
  }

  return owner === PLAYER_ONE ? position + 1 : pits.length - position;
}

export {
  KALAH_BOARD_MODEL,
  PLAYER_ONE,
  PLAYER_TWO,
  createBoardModel,
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
};
