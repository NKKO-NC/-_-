import * as THREE from "../vendor/three/build/three.module.js?v=20260617c";

const TAU = Math.PI * 2;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}

function easeOutBack(value) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const shifted = value - 1;
  return 1 + c3 * shifted * shifted * shifted + c1 * shifted * shifted;
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function loadTexture(loader, url, anisotropy) {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = anisotropy;
        texture.needsUpdate = true;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

function createFallbackTexture(label, anisotropy) {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = anisotropy;
    return texture;
  }

  const gradient = ctx.createRadialGradient(size * 0.35, size * 0.28, size * 0.06, size * 0.5, size * 0.5, size * 0.6);
  gradient.addColorStop(0, "#f9e4aa");
  gradient.addColorStop(0.38, "#d8ad52");
  gradient.addColorStop(0.75, "#8b6526");
  gradient.addColorStop(1, "#422d0d");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.46, 0, TAU);
  ctx.fill();

  ctx.lineWidth = 8;
  ctx.strokeStyle = "rgba(255, 238, 190, 0.86)";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.38, 0, TAU);
  ctx.stroke();

  if (label === "dragon") {
    ctx.strokeStyle = "rgba(255, 248, 221, 0.9)";
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(size * 0.34, size * 0.62);
    ctx.bezierCurveTo(size * 0.3, size * 0.38, size * 0.55, size * 0.3, size * 0.61, size * 0.48);
    ctx.bezierCurveTo(size * 0.68, size * 0.7, size * 0.42, size * 0.76, size * 0.4, size * 0.56);
    ctx.stroke();
    ctx.fillStyle = "rgba(255, 248, 221, 0.94)";
    ctx.beginPath();
    ctx.arc(size * 0.66, size * 0.4, 7, 0, TAU);
    ctx.fill();
  } else if (label === "shield") {
    ctx.fillStyle = "rgba(255, 248, 221, 0.9)";
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.28);
    ctx.lineTo(size * 0.68, size * 0.38);
    ctx.lineTo(size * 0.62, size * 0.66);
    ctx.lineTo(size * 0.5, size * 0.76);
    ctx.lineTo(size * 0.38, size * 0.66);
    ctx.lineTo(size * 0.32, size * 0.38);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = "rgba(255, 248, 221, 0.94)";
    ctx.font = "700 92px Segoe UI, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(label, size / 2, size / 2 + 4);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createFaceOverlayTexture(sourceTexture, anisotropy, { scale = 0.72, offsetX = 0, offsetY = 0 } = {}) {
  const size = 1024;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx || !sourceTexture?.image) {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = anisotropy;
    return texture;
  }

  const { image } = sourceTexture;
  const imageAspect = image.width / image.height || 1;
  const maxSize = size * scale;
  const drawWidth = imageAspect >= 1 ? maxSize : maxSize * imageAspect;
  const drawHeight = imageAspect >= 1 ? maxSize / imageAspect : maxSize;
  const x = (size - drawWidth) / 2 + offsetX * size;
  const y = (size - drawHeight) / 2 + offsetY * size;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(image, x, y, drawWidth, drawHeight);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

function createCoinEdgeTexture(anisotropy) {
  const width = 512;
  const height = 96;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    texture.anisotropy = anisotropy;
    return texture;
  }

  const gradient = ctx.createLinearGradient(0, 0, width, 0);
  gradient.addColorStop(0, "#55514b");
  gradient.addColorStop(0.18, "#9d978f");
  gradient.addColorStop(0.5, "#d9d3ca");
  gradient.addColorStop(0.82, "#8d877f");
  gradient.addColorStop(1, "#4f4b45");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  for (let x = 0; x < width; x += 14) {
    const alpha = x % 28 === 0 ? 0.24 : 0.12;
    ctx.fillStyle = `rgba(56, 52, 48, ${alpha})`;
    ctx.fillRect(x, 8, 2, height - 16);
  }

  ctx.strokeStyle = "rgba(255, 252, 242, 0.18)";
  ctx.lineWidth = 2;
  for (const y of [10, height - 10]) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(46, 44, 42, 0.4)";
  ctx.lineWidth = 1.5;
  for (let x = 8; x < width; x += 18) {
    const notchHeight = 16 + Math.random() * 16;
    const y = (height - notchHeight) / 2 + (Math.random() * 6 - 3);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 3, y + notchHeight);
    ctx.stroke();
  }

  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  for (let i = 0; i < 36; i += 1) {
    const x = Math.random() * width;
    const w = 8 + Math.random() * 12;
    const h = 10 + Math.random() * 22;
    const y = Math.random() * (height - h);
    ctx.fillRect(x, y, w, h);
  }
  ctx.globalCompositeOperation = "source-over";

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.repeat.set(3.5, 1);
  texture.needsUpdate = true;
  return texture;
}

function disposeMaterial(material) {
  if (Array.isArray(material)) {
    for (const item of material) {
      item?.dispose?.();
    }
    return;
  }

  material?.dispose?.();
}

class CoinTossScene {
  constructor({ canvas, coinSrc, dragonSrc, shieldSrc }) {
    if (!canvas) {
      throw new Error("CoinTossScene requires a canvas element.");
    }

    this.canvas = canvas;
    this.coinSrc = coinSrc;
    this.dragonSrc = dragonSrc;
    this.shieldSrc = shieldSrc;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    this.camera.position.set(0, 0, 5.7);
    this.loader = new THREE.TextureLoader();
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
    });

    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.group = new THREE.Group();
    this.group.rotation.order = "YXZ";
    this.scene.add(this.group);

    const ambient = new THREE.AmbientLight(0xffffff, 1.45);
    const key = new THREE.DirectionalLight(0xfff2d0, 2.55);
    key.position.set(-2.8, 4.2, 4.8);
    const fill = new THREE.DirectionalLight(0x8ae4dc, 0.68);
    fill.position.set(3.4, -1.8, 3.2);
    const rim = new THREE.PointLight(0xffd189, 1.05, 24);
    rim.position.set(0, 0, -5);

    this.scene.add(ambient, key, fill, rim);

    this.faceRadius = 1.02;
    this.bodyRadius = 1.06;
    this.bodyThickness = 0.09;
    this.faceDepth = this.bodyThickness / 2 + 0.015;
    this.restPositionY = -0.18;
    this.activeFace = "front";
    this.animationFrame = 0;
    this.animationToken = 0;
    this.resizeObserver = null;
    this.pendingResolve = null;

    this.ready = this.init();

    this.handleResize = () => this.resize();
    window.addEventListener("resize", this.handleResize, { passive: true });

    const parent = this.canvas.parentElement;
    if (parent && "ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(parent);
    }
  }

  async init() {
    const anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    const [coinTexture, dragonTexture, shieldTexture] = await Promise.all([
      loadTexture(this.loader, this.coinSrc, anisotropy).catch((error) => {
        console.warn("Coin body texture failed to load.", this.coinSrc, error);
        return createFallbackTexture("C", anisotropy);
      }),
      loadTexture(this.loader, this.dragonSrc, anisotropy).catch((error) => {
        console.warn("Dragon coin texture failed to load.", this.dragonSrc, error);
        return createFallbackTexture("dragon", anisotropy);
      }),
      loadTexture(this.loader, this.shieldSrc, anisotropy).catch((error) => {
        console.warn("Shield coin texture failed to load.", this.shieldSrc, error);
        return createFallbackTexture("shield", anisotropy);
      }),
    ]);

    this.coinTexture = coinTexture;
    this.dragonTexture = dragonTexture;
    this.shieldTexture = shieldTexture;
    this.dragonFaceTexture = createFaceOverlayTexture(dragonTexture, anisotropy, {
      scale: 0.76,
      offsetY: -0.01,
    });
    this.shieldFaceTexture = createFaceOverlayTexture(shieldTexture, anisotropy, {
      scale: 0.42,
      offsetY: 0.02,
    });
    this.edgeTexture = createCoinEdgeTexture(anisotropy);
    this.buildCoin();
    this.resize();
    this.setFace("front");
  }

  buildCoin() {
    const bodyGeometry = new THREE.CylinderGeometry(
      this.bodyRadius,
      this.bodyRadius,
      this.bodyThickness,
      64,
      1,
      false
    );
    const faceGeometry = new THREE.CircleGeometry(this.faceRadius, 64);

    const capMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1ece3,
      map: this.coinTexture,
      metalness: 0.94,
      roughness: 0.42,
    });
    const faceMaterialOptions = {
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.05,
      roughness: 0.72,
      side: THREE.FrontSide,
    };
    const edgeMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8c1b7,
      metalness: 0.9,
      roughness: 0.4,
      map: this.edgeTexture,
    });

    this.bodyMesh = new THREE.Mesh(bodyGeometry, [edgeMaterial, capMaterial, capMaterial.clone()]);
    this.bodyMesh.rotation.x = Math.PI / 2;
    this.group.add(this.bodyMesh);

    this.frontDisc = new THREE.Mesh(
      faceGeometry,
      new THREE.MeshStandardMaterial({
        ...faceMaterialOptions,
        map: this.dragonFaceTexture,
      })
    );
    this.frontDisc.position.z = this.faceDepth;
    this.frontDisc.renderOrder = 2;
    this.group.add(this.frontDisc);

    this.backDisc = new THREE.Mesh(
      faceGeometry.clone(),
      new THREE.MeshStandardMaterial({
        ...faceMaterialOptions,
        map: this.shieldFaceTexture,
      })
    );
    this.backDisc.position.z = -this.faceDepth;
    this.backDisc.rotation.y = Math.PI;
    this.backDisc.renderOrder = 2;
    this.group.add(this.backDisc);
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  render() {
    this.renderer.render(this.scene, this.camera);
  }

  setFace(face, immediate = true) {
    this.activeFace = face;
    const targetY = face === "back" ? Math.PI : 0;

    if (immediate) {
      this.group.rotation.set(0, targetY, 0);
      this.group.position.set(0, this.restPositionY, 0);
      this.group.scale.setScalar(1);
      this.render();
      return;
    }

    this.group.rotation.y = targetY;
    this.render();
  }

  stop() {
    this.animationToken += 1;

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }

    if (this.pendingResolve) {
      const resolve = this.pendingResolve;
      this.pendingResolve = null;
      resolve(false);
    }
  }

  reset() {
    this.stop();
    this.setFace("front");
  }

  async play(face) {
    await this.ready;
    this.stop();

    const token = this.animationToken + 1;
    this.animationToken = token;

    const startRotationY = this.group.rotation.y;
    const startRotationX = this.group.rotation.x;
    const startRotationZ = this.group.rotation.z;
    const startPositionY = this.group.position.y;
    const targetY = face === "back" ? Math.PI : 0;
    const spinTurns = randomRange(4.9, 6.1) * (Math.random() < 0.5 ? 1 : -1);
    const endY = targetY + spinTurns * TAU;
    const xTilt = randomRange(0.9, 1.28) * (Math.random() < 0.5 ? 1 : -1);
    const zTilt = randomRange(0.48, 0.82) * (Math.random() < 0.5 ? 1 : -1);
    const lift = randomRange(0.72, 0.86);
    const squash = randomRange(0.025, 0.045);
    const wobbleTurns = randomRange(8.5, 11.5);
    const duration = randomRange(1300, 1480);
    const settleStart = 0.78;
    const settleDuration = 0.22;

    return new Promise((resolve) => {
      this.pendingResolve = resolve;
      const startTime = performance.now();
      const step = (now) => {
        if (token !== this.animationToken) {
          this.pendingResolve = null;
          resolve(false);
          return;
        }

        const elapsed = (now - startTime) / duration;
        const t = clamp(elapsed, 0, 1);
        const spin = easeOutCubic(t);
        const settle = clamp((t - settleStart) / settleDuration, 0, 1);
        const settleEase = easeOutBack(settle);
        const wobbleFade = Math.pow(1 - t, 1.5);
        const liftArc = Math.sin(Math.PI * t);
        const bounce = Math.sin(Math.PI * settle);

        this.group.rotation.x =
          lerp(startRotationX, 0, Math.min(1, t * 1.18)) +
          xTilt * wobbleFade * Math.sin(t * TAU * 2.3) * 0.36;
        this.group.rotation.z =
          lerp(startRotationZ, 0, Math.min(1, t * 1.05)) +
          zTilt * wobbleFade * Math.cos(t * TAU * 2.1) * 0.32;
        this.group.rotation.y = lerp(startRotationY, endY, spin) + Math.sin(t * TAU * wobbleTurns) * wobbleFade * 0.16;

        this.group.position.y =
          startPositionY +
          liftArc * lift -
          bounce * squash +
          Math.sin(t * TAU * 3.5) * wobbleFade * 0.08;
        this.group.scale.setScalar(1 + liftArc * 0.04 + settleEase * 0.02);

        this.render();

        if (t < 1) {
          this.animationFrame = requestAnimationFrame(step);
          return;
        }

        this.group.rotation.set(0, targetY, 0);
        this.group.position.set(0, this.restPositionY, 0);
        this.group.scale.setScalar(1);
        this.activeFace = face;
        this.animationFrame = 0;
        this.pendingResolve = null;
        this.render();
        resolve(true);
      };

      this.animationFrame = requestAnimationFrame(step);
    });
  }

  dispose() {
    this.stop();
    this.resizeObserver?.disconnect();
    window.removeEventListener("resize", this.handleResize);

    this.bodyMesh?.geometry.dispose();
    disposeMaterial(this.bodyMesh?.material);
    this.frontDisc?.geometry.dispose();
    disposeMaterial(this.frontDisc?.material);
    this.backDisc?.geometry.dispose();
    disposeMaterial(this.backDisc?.material);
    this.edgeTexture?.dispose?.();
    this.coinTexture?.dispose?.();
    this.dragonTexture?.dispose?.();
    this.dragonFaceTexture?.dispose?.();
    this.shieldTexture?.dispose?.();
    this.shieldFaceTexture?.dispose?.();
    this.renderer.dispose();
  }
}

export { CoinTossScene };
