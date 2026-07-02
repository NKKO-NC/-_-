import { createBoardModel } from "./object-model.js?v=20260703a";
import { createStandardAiProfile } from "../game/ai-profile.js?v=20260703a";

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

function createGameModeDefinition({ id, label, shortLabel, description, startingStonesPerPit }) {
  const boardModel = createBoardModel({
    id: `kalah-standard-6x${startingStonesPerPit}`,
    pitsPerSide: 6,
    startingStonesPerPit,
  });

  return deepFreeze({
    id,
    label,
    shortLabel,
    description,
    boardModel,
    aiProfile: createStandardAiProfile({
      startingStonesPerPit,
      pitsPerSide: boardModel.pitsPerSide,
    }),
  });
}

const GAME_MODE_DEFINITIONS = deepFreeze({
  classic4: createGameModeDefinition({
    id: "classic4",
    label: "經典 4 子",
    shortLabel: "4 子",
    description: "節奏較快，適合作為目前主規格。",
    startingStonesPerPit: 4,
  }),
  variant6: createGameModeDefinition({
    id: "variant6",
    label: "6 子變體",
    shortLabel: "6 子變體",
    description: "保留傳統較長局節奏與資源密度。",
    startingStonesPerPit: 6,
  }),
});

const DEFAULT_GAME_MODE_ID = "classic4";

function getGameModeDefinition(gameModeId = DEFAULT_GAME_MODE_ID) {
  return GAME_MODE_DEFINITIONS[gameModeId] ?? GAME_MODE_DEFINITIONS[DEFAULT_GAME_MODE_ID];
}

export { DEFAULT_GAME_MODE_ID, GAME_MODE_DEFINITIONS, getGameModeDefinition };
