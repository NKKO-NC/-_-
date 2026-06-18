const VISUAL_CSS_BINDINGS = Object.freeze({
  "background.landscape.idle": "--visual-background-landscape",
  "background.portrait.idle": "--visual-background-portrait",
  "board.landscape.base": "--visual-board-landscape-base",
  "board.landscape.rim": "--visual-board-landscape-rim",
  "board.landscape.shadow": "--visual-board-landscape-shadow",
  "board.portrait.base": "--visual-board-portrait-base",
  "board.portrait.rim": "--visual-board-portrait-rim",
  "board.portrait.shadow": "--visual-board-portrait-shadow",
  "ui.score.panel": "--visual-ui-score-panel",
  "ui.dialogue.panel": "--visual-ui-dialogue-panel",
  "ui.modal.panel": "--visual-ui-modal-panel",
  "ui.result.panel": "--visual-ui-result-panel",
  "ui.button.primary": "--visual-ui-button-primary",
  "ui.button.secondary": "--visual-ui-button-secondary",
  "ui.icon.frame": "--visual-ui-icon-frame",
  "ui.turn.badge": "--visual-ui-turn-badge",
});

function createVisualPackRuntime({ manifestUrl }) {
  const particleUrls = new Map();
  const assetUrls = new Map();
  let manifest = null;

  const ready = loadManifest().catch((error) => {
    console.warn("Visual pack failed to load.", error);
    return null;
  });

  async function loadManifest() {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Unable to load visual pack manifest: ${response.status}`);
    }

    manifest = await response.json();
    applyManifest();
    return manifest;
  }

  function applyManifest(root = document.documentElement) {
    if (!manifest || !root) return;

    const baseUrl = new URL(manifest.baseUrl || "./", new URL(manifestUrl, document.baseURI));

    for (const [assetId, asset] of Object.entries(manifest.assets || {})) {
      const assetUrl = new URL(asset.src, baseUrl).href;
      assetUrls.set(assetId, assetUrl);

      const cssName = VISUAL_CSS_BINDINGS[assetId] || `--visual-${assetId.replaceAll(".", "-")}`;
      root.style.setProperty(cssName, `url("${assetUrl}")`);

      const particleMatch = assetId.match(/^particle\.(ruby|amethyst|gold)\.\d+$/);
      if (particleMatch) {
        const group = particleMatch[1];
        const urls = particleUrls.get(group) || [];
        urls.push(assetUrl);
        particleUrls.set(group, urls);
      }
    }

    root.dataset.visualPack = manifest.id;
  }

  function getAssetUrl(assetId) {
    return assetUrls.get(assetId) || "";
  }

  function getParticleUrl(kind, random = Math.random) {
    const urls = particleUrls.get(kind);
    if (!urls?.length) return "";

    return urls[Math.floor(random() * urls.length)];
  }

  return Object.freeze({
    ready,
    get manifest() {
      return manifest;
    },
    getAssetUrl,
    getParticleUrl,
  });
}

export { createVisualPackRuntime };
