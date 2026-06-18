function createSoundPackRuntime({ manifestUrl }) {
  let manifest = null;
  let context = null;
  let masterGain = null;
  let masterVolume = 1;
  const buffers = new Map();
  const activeLoops = new Map();
  const lastPlayedAt = new Map();

  const ready = loadManifest().catch((error) => {
    console.warn("Sound pack failed to load.", error);
    return null;
  });

  async function loadManifest() {
    const response = await fetch(manifestUrl);
    if (!response.ok) {
      throw new Error(`Unable to load sound pack manifest: ${response.status}`);
    }

    manifest = await response.json();
    return manifest;
  }

  function ensureContext() {
    if (context) return context;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio is not available in this browser.");
      return null;
    }

    context = new AudioContextClass();
    masterGain = context.createGain();
    masterGain.gain.value = masterVolume;
    masterGain.connect(context.destination);
    return context;
  }

  function setMasterVolume(value) {
    masterVolume = clamp(Number(value), 0, 1);

    if (masterGain && context) {
      masterGain.gain.setValueAtTime(masterVolume, context.currentTime);
    }
  }

  async function unlock() {
    const audioContext = ensureContext();
    if (!audioContext) return false;

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext.state === "running";
  }

  function getEvent(eventName) {
    return manifest?.events?.[eventName] || null;
  }

  function chooseVariant(event) {
    const variants = event?.variants || [];
    if (!variants.length) return "";

    if (event.randomizeVariant) {
      return variants[Math.floor(Math.random() * variants.length)];
    }

    return variants[0];
  }

  async function getBuffer(assetId) {
    if (buffers.has(assetId)) {
      return buffers.get(assetId);
    }

    const asset = manifest?.assets?.[assetId];
    if (!asset) {
      throw new Error(`Sound asset not found: ${assetId}`);
    }

    const audioContext = ensureContext();
    if (!audioContext) return null;

    const baseUrl = new URL(manifest.baseUrl || "./", new URL(manifestUrl, document.baseURI));
    const response = await fetch(new URL(asset.src, baseUrl));
    if (!response.ok) {
      throw new Error(`Unable to load sound asset: ${asset.src}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const decoded = await audioContext.decodeAudioData(arrayBuffer);
    buffers.set(assetId, decoded);
    return decoded;
  }

  function getPitch(event) {
    const [min = 1, max = 1] = event.pitchRange || [1, 1];
    if (min === max) return min;

    return min + Math.random() * (max - min);
  }

  async function playEvent(eventName, options = {}) {
    const audioContext = ensureContext();
    if (!audioContext) return null;

    try {
      await unlock();
      await ready;

      const event = getEvent(eventName);
      if (!event) return null;

      const nowMs = performance.now();
      const lastTime = lastPlayedAt.get(eventName) || 0;
      if (event.cooldownMs && nowMs - lastTime < event.cooldownMs) {
        return null;
      }
      lastPlayedAt.set(eventName, nowMs);

      if (event.loop && activeLoops.has(eventName)) {
        return activeLoops.get(eventName);
      }

      const assetId = chooseVariant(event);
      const buffer = await getBuffer(assetId);
      if (!buffer) return null;

      const source = audioContext.createBufferSource();
      const gain = audioContext.createGain();
      const bus = manifest?.buses?.[event.bus] || {};
      const volume = (options.volume ?? event.volume ?? 1) * (bus.volume ?? 1);

      source.buffer = buffer;
      source.loop = Boolean(options.loop ?? event.loop);
      source.playbackRate.value = options.pitch ?? getPitch(event);
      gain.gain.value = volume;
      source.connect(gain);
      gain.connect(masterGain);
      source.start();

      const handle = { source, gain, eventName };
      if (source.loop) {
        activeLoops.set(eventName, handle);
      }

      source.onended = () => {
        if (activeLoops.get(eventName) === handle) {
          activeLoops.delete(eventName);
        }
      };

      return handle;
    } catch (error) {
      console.warn(`Sound event failed: ${eventName}`, error);
      return null;
    }
  }

  function stopEvent(eventName, fadeMs = 0) {
    const handle = activeLoops.get(eventName);
    if (!handle || !context) return;

    activeLoops.delete(eventName);

    if (fadeMs > 0) {
      const now = context.currentTime;
      handle.gain.gain.cancelScheduledValues(now);
      handle.gain.gain.setValueAtTime(handle.gain.gain.value, now);
      handle.gain.gain.linearRampToValueAtTime(0, now + fadeMs / 1000);
      window.setTimeout(() => handle.source.stop(), fadeMs + 32);
      return;
    }

    handle.source.stop();
  }

  function stopAll(fadeMs = 0) {
    for (const eventName of [...activeLoops.keys()]) {
      stopEvent(eventName, fadeMs);
    }
  }

  function clamp(value, min, max) {
    if (!Number.isFinite(value)) return max;
    return Math.min(max, Math.max(min, value));
  }

  return Object.freeze({
    ready,
    unlock,
    playEvent,
    stopEvent,
    stopAll,
    setMasterVolume,
    getMasterVolume() {
      return masterVolume;
    },
    get manifest() {
      return manifest;
    },
  });
}

export { createSoundPackRuntime };
