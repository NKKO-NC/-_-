function queryRequired(selector, root = document) {
  const element = root.querySelector(selector);

  if (!element) {
    throw new Error(`Missing required DOM element: ${selector}`);
  }

  return element;
}

function getGameDomRefs(root = document) {
  const playerOneScore = queryRequired("#playerOneScore", root);
  const playerTwoScore = queryRequired("#playerTwoScore", root);

  return Object.freeze({
    boardEl: queryRequired("#board", root),
    statusEl: queryRequired("#status", root),
    mainMenu: queryRequired("#mainMenu", root),
    gameScreen: queryRequired("#gameScreen", root),
    startButton: queryRequired("#startButton", root),
    resetButton: queryRequired("#resetButton", root),
    menuButton: queryRequired("#menuButton", root),
    playerOneScore,
    playerTwoScore,
    playerOneLabel: queryRequired("span", playerOneScore),
    playerTwoLabel: queryRequired("span", playerTwoScore),
    turnIndicator: queryRequired("#turnIndicator", root),
    turnEmblem: queryRequired("#turnEmblem", root),
    modePvpButton: queryRequired("#modePvpButton", root),
    modePveButton: queryRequired("#modePveButton", root),
    difficultyField: queryRequired("#difficultyField", root),
    difficultyEasyButton: queryRequired("#difficultyEasyButton", root),
    difficultyMediumButton: queryRequired("#difficultyMediumButton", root),
    difficultyHardButton: queryRequired("#difficultyHardButton", root),
    controlHint: queryRequired("#controlHint", root),
    aiDialogue: queryRequired("#aiDialogue", root),
    aiDialogueSpeaker: queryRequired("#aiDialogueSpeaker", root),
    aiDialogueLine: queryRequired("#aiDialogueLine", root),
    rulesButton: queryRequired("#rulesButton", root),
    settingsButton: queryRequired("#settingsButton", root),
    rulesOverlay: queryRequired("#rulesOverlay", root),
    settingsOverlay: queryRequired("#settingsOverlay", root),
    rulesCloseButton: queryRequired("#rulesCloseButton", root),
    settingsCloseButton: queryRequired("#settingsCloseButton", root),
    rulesList: queryRequired("#rulesList", root),
    ruleDemoOverlay: queryRequired("#ruleDemoOverlay", root),
    ruleDemoTitle: queryRequired("#ruleDemoTitle", root),
    ruleDemoContent: queryRequired("#ruleDemoContent", root),
    ruleDemoCloseButton: queryRequired("#ruleDemoCloseButton", root),
    ruleDemoReplayButton: queryRequired("#ruleDemoReplayButton", root),
    ruleDemoControls: queryRequired("#ruleDemoControls", root),
    ruleAutoButton: queryRequired("#ruleAutoButton", root),
    ruleStepButton: queryRequired("#ruleStepButton", root),
    ruleStepControls: queryRequired("#ruleStepControls", root),
    rulePrevButton: queryRequired("#rulePrevButton", root),
    ruleNextButton: queryRequired("#ruleNextButton", root),
    ruleStepIndicator: queryRequired("#ruleStepIndicator", root),
    pitRomanButton: queryRequired("#pitRomanButton", root),
    pitArabicButton: queryRequired("#pitArabicButton", root),
    volumeSlider: queryRequired("#volumeSlider", root),
    volumeValue: queryRequired("#volumeValue", root),
    playerHintToggle: queryRequired("#playerHintToggle", root),
    coinTossOverlay: queryRequired("#coinTossOverlay", root),
    coinTossButton: queryRequired("#coinTossButton", root),
    coinCanvas: queryRequired("#coinCanvas", root),
    coinTossStatus: queryRequired("#coinTossStatus", root),
    resultOverlay: queryRequired("#resultOverlay", root),
    resultPanel: queryRequired("#resultPanel", root),
    resultKicker: queryRequired("#resultKicker", root),
    resultTitle: queryRequired("#resultTitle", root),
    resultScore: queryRequired("#resultScore", root),
    resultResetButton: queryRequired("#resultResetButton", root),
    resultMenuButton: queryRequired("#resultMenuButton", root),
    particleField: queryRequired("#particleField", root),
  });
}

export { getGameDomRefs, queryRequired };
