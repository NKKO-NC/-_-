# Kalah Childhood Memories

&#31461;&#24180;&#22238;&#25014;_&#38750;&#27954;&#26827; / Kalah &#25773;&#26827; MVP

A simple browser-based Kalah / Mancala MVP built with plain HTML, CSS, and JavaScript.

## Play

[Play the game on GitHub Pages](https://nkko-nc.github.io/-_-/)

## Run

Run a local static server, then open the site in a browser:

```bash
node serve.mjs 8123
```

Then visit `http://127.0.0.1:8123/`.

## Features

- 6 pits per player
- 6 stones per pit at start
- Ruby and amethyst image stones
- Dark crystal board with gold line styling
- Animated sowing with random landing positions and light collision spacing
- Stones keep their original color after moving
- Coin toss rendered with local Three.js build and a transparent canvas overlay
- Capture, extra turn, end-game collection, and winner detection

## Files

- `index.html` - page shell
- `styles.css` - board and animation styling
- `script.js` - Kalah rules and rendering
- `serve.mjs` - tiny local static server for module-based offline use
- `vendor/three/` - local Three.js build files
- `assets/` - generated gemstone assets used by the game
