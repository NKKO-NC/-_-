import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.165.0/build/three.module.js";

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

  ctx.fillStyle = "rgba(255, 248, 221, 0.94)";
  ctx.font = "700 92px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, size / 2, size / 2 + 4);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
  return texture;
}

export class CoinTossScene {
  constructor({ canvas, dragonSrc, shieldSrc }) {
    if (!canvas) {
      throw new Error("CoinTossScene requires a canvas element.");
    }

    this.canvas = canvas;
    this.dragonSrc = dragonSrc;
    this.shieldSrc = shieldSrc;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 5.4);
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
    this.bodyThickness = 0.24;
    this.faceDepth = this.bodyThickness / 2 + 0.02;
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
    const [dragonTexture, shieldTexture] = await Promise.all([
      loadTexture(this.loader, this.dragonSrc, anisotropy).catch(() => createFallbackTexture("D", anisotropy)),
      loadTexture(this.loader, this.shieldSrc, anisotropy).catch(() => createFallbackTexture("S", anisotropy)),
    ]);

    this.dragonTexture = dragonTexture;
    this.shieldTexture = shieldTexture;
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

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xcda34e,
      metalness: 0.95,
      roughness: 0.34,
    });
    const faceMaterialOptions = {
      transparent: true,
      alphaTest: 0.02,
      metalness: 0.05,
      roughness: 0.72,
      side: THREE.FrontSide,
    };

    this.bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    this.bodyMesh.rotation.x = Math.PI / 2;
    this.bodyMesh.castShadow = false;
    this.bodyMesh.receiveShadow = false;
    this.group.add(this.bodyMesh);

    this.frontDisc = new THREE.Mesh(
      faceGeometry,
      new THREE.MeshStandardMaterial({
        ...faceMaterialOptions,
        map: this.dragonTexture,
      })
    );
    this.frontDisc.position.z = this.faceDepth;
    this.frontDisc.renderOrder = 2;
    this.group.add(this.frontDisc);

    this.backDisc = new THREE.Mesh(
      faceGeometry.clone(),
      new THREE.MeshStandardMaterial({
        ...faceMaterialOptions,
        map: this.shieldTexture,
      })
    );
    this.backDisc.position.z = -this.faceDepth;
    this.backDisc.rotation.y = Math.PI;
    this.backDisc.renderOrder = 2;
    this.group.add(this.backDisc);

    this.group.scale.setScalar(1);
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
      this.group.position.set(0, 0, 0);
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
    const spinTurns = randomRange(5.75, 7.25) * (Math.random() < 0.5 ? 1 : -1);
    const endY = targetY + spinTurns * TAU;
    const xTilt = randomRange(0.9, 1.28) * (Math.random() < 0.5 ? 1 : -1);
    const zTilt = randomRange(0.48, 0.82) * (Math.random() < 0.5 ? 1 : -1);
    const lift = randomRange(1.08, 1.34);
    const squash = randomRange(0.03, 0.055);
    const wobbleTurns = randomRange(8.5, 11.5);
    const duration = randomRange(1180, 1360);
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
        this.group.position.set(0, 0, 0);
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
    this.bodyMesh?.material.dispose();
    this.frontDisc?.geometry.dispose();
    this.frontDisc?.material.dispose();
    this.backDisc?.geometry.dispose();
    this.backDisc?.material.dispose();
    this.renderer.dispose();
  }
}
