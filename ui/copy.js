const TEXT = Object.freeze({
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
  coinFront: "\u6b63\u9762\uff0c\u7d05\u65b9\u5148\u624b",
  coinBack: "\u53cd\u9762\uff0c\u7d2b\u65b9\u5148\u624b",
  result: "\u7d50\u7b97",
  newRound: "\u518d\u958b\u4e00\u5c40",
  pvpHint: "\u96d9\u4eba\u5c0d\u6230\uff1a\u540c\u6a5f\u8f2a\u6d41\u64cd\u4f5c",
  pveHint: "\u55ae\u4eba\u5c0d\u6230\uff1a\u73a9\u5bb6 = \u7d05\u65b9\uff0cAI = \u7d2b\u65b9",
  aiThinking: "AI \u601d\u8003\u4e2d...",
});

const DIFFICULTY_LABELS = Object.freeze({
  easy: "\u7c21\u55ae",
  medium: "\u666e\u901a",
  hard: "\u56f0\u96e3",
});

const NARRATOR = "\u65c1\u767d";

export { DIFFICULTY_LABELS, NARRATOR, TEXT };
