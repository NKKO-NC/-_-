const STONE_PLACEMENT_PHYSICS = Object.freeze({
  pit: {
    slots: freezeSlots([
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
    ]),
    jitter: 6.8,
    placementBounds: {
      left: [12, 88],
      top: [14, 90],
    },
    collisionBounds: {
      left: [10, 90],
      top: [13, 91],
    },
    collisionPasses: 8,
    collisionDistances: [
      { above: 14, value: 9.2 },
      { above: 9, value: 11.5 },
      { above: 5, value: 14.2 },
      { value: 17 },
    ],
    scales: [
      { above: 14, value: 0.56 },
      { above: 9, value: 0.68 },
      { above: 5, value: 0.84 },
      { value: 1 },
    ],
  },
  store: {
    slots: freezeSlots([
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
    ]),
    jitter: 4.8,
    placementBounds: {
      left: [12, 88],
      top: [14, 90],
    },
    collisionBounds: {
      left: [10, 90],
      top: [13, 91],
    },
    collisionPasses: 8,
    collisionDistances: [
      { above: 24, value: 7.8 },
      { above: 16, value: 9.4 },
      { above: 9, value: 11.4 },
      { value: 13.2 },
    ],
    scales: [
      { above: 24, value: 0.54 },
      { above: 16, value: 0.64 },
      { above: 9, value: 0.78 },
      { value: 0.94 },
    ],
  },
});

const STONE_FLIGHT_PHYSICS = Object.freeze({
  preSowDelayMs: 90,
  missingCellDelayMs: 120,
  postDropDelayMs: {
    base: 72,
    random: 44,
  },
  captureDelayMs: 130,
  postCaptureDelayMs: 170,
  arc: {
    min: 38,
    max: 96,
    distanceFactor: 0.22,
  },
  durationMs: {
    base: 230,
    random: 120,
  },
  rollDegrees: {
    min: 210,
    max: 340,
  },
  size: {
    cellFactor: 0.33,
    min: 30,
    max: 58,
  },
});

const PARTICLE_PHYSICS = Object.freeze({
  coinTossCount: 24,
  resultCounts: {
    draw: 18,
    winner: 34,
  },
  angleJitter: 0.34,
  distance: {
    min: 58,
    max: 170,
  },
  size: {
    min: 5,
    max: 12,
  },
  spinDegrees: {
    min: -220,
    max: 220,
  },
  lifetimeMs: 920,
});

function freezeSlots(slots) {
  return Object.freeze(slots.map((slot) => Object.freeze(slot)));
}

function selectCountCurveValue(curve, count) {
  const entry = curve.find((candidate) => candidate.above == null || count > candidate.above);
  return entry?.value;
}

export {
  PARTICLE_PHYSICS,
  STONE_FLIGHT_PHYSICS,
  STONE_PLACEMENT_PHYSICS,
  selectCountCurveValue,
};
