const PLAYER_ONE = 1;
const PLAYER_TWO = 2;

const KALAH_BOARD_MODEL = deepFreeze({
  id: "kalah-standard-6x6",
  players: [PLAYER_ONE, PLAYER_TWO],
  boardSize: 14,
  startingStonesPerPit: 6,
  stores: {
    [PLAYER_ONE]: 6,
    [PLAYER_TWO]: 13,
  },
  pits: {
    [PLAYER_ONE]: [0, 1, 2, 3, 4, 5],
    [PLAYER_TWO]: [7, 8, 9, 10, 11, 12],
  },
  layout: {
    topPits: [12, 11, 10, 9, 8, 7],
    bottomPits: [0, 1, 2, 3, 4, 5],
  },
  oppositePitIndexSum: 12,
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
