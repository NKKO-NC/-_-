# Object Pack Architecture

This refactor splits game objects into three layers:

1. Base model: `core/object-model.js`
   - Board size, pit/store indices, player ids, starting stone counts, and state factories.
   - This layer must not know about images, colors, CSS classes, or animation tuning.

2. Physical tuning: `core/object-physics.js`
   - Stone slots, jitter, collision spacing, scale curves, flight timing, and particle counts.
   - This layer describes how objects behave or occupy space, not what they look like.

3. Object pack skin: `object-packs/*.js`
   - Asset ids, player labels, side labels, CSS class names, coin face mapping, and CSS custom properties.
   - New themes should start by copying `object-packs/crystal.js` and changing only skin-level values.

The expected object-pack contract lives in `core/object-pack-manifest.js`. `defineObjectPack()` validates required fields at module load time, so an incomplete theme fails early instead of breaking mid-game.

Current runtime wiring:

- `script.js` imports `KALAH_BOARD_MODEL` for rules/state and `STONE_*_PHYSICS` for layout/animation.
- `core/object-pack-runtime.js` wraps the active object pack and exposes asset, player, coin-face, class, and CSS variable accessors.
- `game/ai.js` owns count-board simulation and Easy / Medium / Hard move selection, so AI search no longer lives inside the main UI controller.
- `ui/copy.js`, `ui/dom.js`, and `ui/rule-demo-data.js` keep shared copy, DOM references, and tutorial data out of `script.js`.
- CSS still owns the detailed selectors for the current crystal skin, but values that are likely to theme-swap are exposed as CSS custom properties by the active pack.
- `service-worker.js` precaches the split core, game, UI, and object-pack modules.
