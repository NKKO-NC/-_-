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

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function createFallbackCanvas(kind, size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  if (!ctx) return canvas;

  ctx.clearRect(0, 0, size, size);

  if (kind === "base") {
    const gradient = ctx.createRadialGradient(size * 0.35, size * 0.28, size * 0.05, size * 0.5, size * 0.5, size * 0.62);
    gradient.addColorStop(0, "#fff1c0");
    gradient.addColorStop(0.35, "#e5bf6e");
    gradient.addColorStop(0.72, "#b27f2f");
    gradient.addColorStop(1, "#5f3f11");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.46, 0, TAU);
    ctx.fill();

    ctx.lineWidth = Math.max(6, size * 0.03);
    ctx.strokeStyle = "rgba(255, 246, 204, 0.9)";
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size * 0.38, 0, TAU);
    ctx.stroke();
    return canvas;
  }

  const accent = kind === "dragon" ? "#ff5b73" : "#c882ff";
  const glow = ctx.createRadialGradient(size * 0.5, size * 0.45, size * 0.06, size * 0.5, size * 0.5, size * 0.44);
  glow.addColorStop(0, accent);
  glow.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.28, 0, TAU);
  ctx.fill();

  ctx.strokeStyle = accent;
  ctx.lineWidth = Math.max(9, size * 0.035);
  ctx.beginPath();
  if (kind === "dragon") {
    ctx.moveTo(size * 0.34, size * 0.62);
    ctx.bezierCurveTo(size * 0.34, size * 0.38, size * 0.5, size * 0.28, size * 0.66, size * 0.37);
    ctx.bezierCurveTo(size * 0.57, size * 0.34, size * 0.54, size * 0.43, size * 0.6, size * 0.5);
    ctx.bezierCurveTo(size * 0.66, size * 0.59, size * 0.63, size * 0.72, size * 0.48, size * 0.73);
    ctx.bezierCurveTo(size * 0.38, size * 0.74, size * 0.31, size * 0.68, size * 0.34, size * 0.62);
  } else {
    ctx.moveTo(size * 0.5, size * 0.26);
    ctx.lineTo(size * 0.68, size * 0.36);
    ctx.lineTo(size * 0.68, size * 0.58);
    ctx.bezierCurveTo(size * 0.68, size * 0.71, size * 0.59, size * 0.8, size * 0.5, size * 0.84);
    ctx.bezierCurveTo(size * 0.41, size * 0.8, size * 0.32, size * 0.71, size * 0.32, size * 0.58);
    ctx.lineTo(size * 0.32, size * 0.36);
    ctx.closePath();
  }
  ctx.stroke();

  ctx.fillStyle = "rgba(255, 250, 232, 0.9)";
  ctx.font = "700 84px Segoe UI, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(kind === "dragon" ? "D" : "S", size / 2, size / 2 + 4);

  return canvas;
}

class CoinTossScene {
  constructor({ canvas, coinSrc, dragonSrc, shieldSrc }) {
    if (!canvas) {
      throw new Error("CoinTossScene requires a canvas element.");
    }

    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    if (!this.ctx) {
      throw new Error("CoinTossScene could not acquire a 2D canvas context.");
    }

    this.coinSrc = coinSrc;
    this.dragonSrc = dragonSrc;
    this.shieldSrc = shieldSrc;
    this.ready = this.init();
    this.resizeObserver = null;
    this.animationFrame = 0;
    this.animationToken = 0;
    this.pendingResolve = null;
    this.rotationY = 0;
    this.rotationX = 0;
    this.rotationZ = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.face = "front";
    this.handleResize = () => this.resize();
    window.addEventListener("resize", this.handleResize, { passive: true });

    const parent = this.canvas.parentElement;
    if (parent && "ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(parent);
    }
  }

  async init() {
    const [coinImage, dragonImage, shieldImage] = await Promise.all([
      loadImage(this.coinSrc).catch(() => createFallbackCanvas("base")),
      loadImage(this.dragonSrc).catch(() => createFallbackCanvas("dragon")),
      loadImage(this.shieldSrc).catch(() => createFallbackCanvas("shield")),
    ]);

    this.coinImage = coinImage;
    this.dragonImage = dragonImage;
    this.shieldImage = shieldImage;
    this.resize();
    this.setFace("front");
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, Math.round(rect.width));
    this.height = Math.max(1, Math.round(rect.height));
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
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
    this.rotationX = 0;
    this.rotationY = 0;
    this.rotationZ = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.face = "front";
    this.render();
  }

  setFace(face) {
    this.face = face;
    this.rotationX = 0;
    this.rotationY = face === "back" ? Math.PI : 0;
    this.rotationZ = 0;
    this.offsetY = 0;
    this.scale = 1;
    this.render();
  }

  async play(face) {
    await this.ready;
    this.stop();

    const token = this.animationToken + 1;
    this.animationToken = token;

    const targetY = face === "back" ? Math.PI : 0;
    const startY = this.rotationY;
    const startX = this.rotationX;
    const startZ = this.rotationZ;
    const startOffsetY = this.offsetY;
    const startScale = this.scale;
    const spinTurns = randomRange(5.75, 7.25) * (Math.random() < 0.5 ? 1 : -1);
    const endY = targetY + spinTurns * TAU;
    const xTilt = randomRange(0.9, 1.28) * (Math.random() < 0.5 ? 1 : -1);
    const zTilt = randomRange(0.48, 0.82) * (Math.random() < 0.5 ? 1 : -1);
    const lift = randomRange(0.7, 1.05);
    const squash = randomRange(0.02, 0.05);
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

        this.rotationY = lerp(startY, endY, spin) + Math.sin(t * TAU * wobbleTurns) * wobbleFade * 0.16;
        this.rotationX = lerp(startX, 0, Math.min(1, t * 1.18)) + xTilt * wobbleFade * Math.sin(t * TAU * 2.3) * 0.36;
        this.rotationZ = lerp(startZ, 0, Math.min(1, t * 1.05)) + zTilt * wobbleFade * Math.cos(t * TAU * 2.1) * 0.32;
        this.offsetY = startOffsetY + liftArc * lift - bounce * squash + Math.sin(t * TAU * 3.5) * wobbleFade * 0.08;
        this.scale = startScale + liftArc * 0.04 + settleEase * 0.02;

        this.render();

        if (t < 1) {
          this.animationFrame = requestAnimationFrame(step);
          return;
        }

        this.rotationX = 0;
        this.rotationY = targetY;
        this.rotationZ = 0;
        this.offsetY = 0;
        this.scale = 1;
        this.face = face;
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
  }

  render() {
    const ctx = this.ctx;
    const width = this.width || 1;
    const height = this.height || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const centerX = width / 2;
    const centerY = height / 2 + this.offsetY * height * 0.12;
    const size = Math.min(width, height);
    const coinRadius = size * 0.34 * this.scale;
    const bodyThickness = coinRadius * 0.22;
    const yaw = this.rotationY;
    const pitch = this.rotationX;
    const roll = this.rotationZ;
    const faceMix = Math.cos(yaw);
    const faceWidth = Math.max(coinRadius * 0.1, coinRadius * Math.abs(faceMix));
    const edgeWidth = Math.max(bodyThickness * 1.15, bodyThickness * Math.abs(Math.sin(yaw)));
    const squashX = 1 - Math.min(Math.abs(pitch) * 0.06, 0.12);
    const squashY = 1 - Math.min(Math.abs(pitch) * 0.02, 0.04);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(roll);
    ctx.scale(squashX, squashY);

    if (!this.coinImage || !this.dragonImage || !this.shieldImage) {
      this.drawLoadingCoin(ctx, coinRadius, bodyThickness, yaw, faceWidth);
      ctx.restore();
      return;
    }

    this.drawShadow(ctx, coinRadius, bodyThickness, yaw);
    this.drawEdge(ctx, coinRadius, bodyThickness, edgeWidth, yaw);
    this.drawFace(ctx, this.coinImage, this.dragonImage, coinRadius, faceWidth, Math.max(0, faceMix), "front");
    this.drawFace(ctx, this.coinImage, this.shieldImage, coinRadius, faceWidth, Math.max(0, -faceMix), "back");

    ctx.restore();
  }

  drawLoadingCoin(ctx, coinRadius, bodyThickness, yaw, faceWidth) {
    const edgeAlpha = 0.55 + Math.sin(Math.abs(yaw)) * 0.18;
    const fill = ctx.createRadialGradient(-coinRadius * 0.2, -coinRadius * 0.25, coinRadius * 0.08, 0, 0, coinRadius * 1.12);
    fill.addColorStop(0, "#fff0c0");
    fill.addColorStop(0.35, "#e0b45f");
    fill.addColorStop(0.72, "#9e7028");
    fill.addColorStop(1, "#5c3d10");

    ctx.save();
    ctx.globalAlpha = edgeAlpha;
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(faceWidth, coinRadius * 0.12), coinRadius, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = 0.75;
    ctx.lineWidth = Math.max(3, bodyThickness * 0.18);
    ctx.strokeStyle = "rgba(255, 244, 214, 0.82)";
    ctx.beginPath();
    ctx.ellipse(0, 0, coinRadius * 0.34, coinRadius * 0.34, 0, 0, TAU);
    ctx.stroke();
    ctx.restore();
  }

  drawShadow(ctx, coinRadius, bodyThickness, yaw) {
    const shadowAlpha = 0.28 + Math.abs(Math.sin(yaw)) * 0.12;
    ctx.save();
    ctx.translate(0, coinRadius * 0.42);
    ctx.scale(1.02, 0.34);
    const shadow = ctx.createRadialGradient(0, 0, coinRadius * 0.12, 0, 0, coinRadius * 1.08);
    shadow.addColorStop(0, `rgba(0, 0, 0, ${shadowAlpha})`);
    shadow.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = shadow;
    ctx.beginPath();
    ctx.ellipse(0, 0, coinRadius * 0.95, coinRadius * 0.42, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  drawEdge(ctx, coinRadius, bodyThickness, edgeWidth, yaw) {
    const edgeAlpha = 0.45 + Math.sin(Math.abs(yaw)) * 0.2;
    const edgeRadiusX = Math.max(coinRadius * 0.08, edgeWidth);
    const edgeRadiusY = bodyThickness * 0.55;
    const x = 0;
    const y = 0;
    const gradient = ctx.createLinearGradient(-edgeRadiusX, 0, edgeRadiusX, 0);
    gradient.addColorStop(0, "#7d5a21");
    gradient.addColorStop(0.25, "#f5e0a5");
    gradient.addColorStop(0.5, "#8a6529");
    gradient.addColorStop(0.75, "#f9e7b8");
    gradient.addColorStop(1, "#6a4918");

    ctx.save();
    ctx.translate(0, 0);
    ctx.fillStyle = gradient;
    ctx.globalAlpha = edgeAlpha;
    ctx.beginPath();
    ctx.ellipse(x, y, edgeRadiusX, edgeRadiusY, 0, 0, TAU);
    ctx.fill();

    ctx.globalAlpha = edgeAlpha * 0.8;
    ctx.strokeStyle = "rgba(255, 236, 188, 0.42)";
    ctx.lineWidth = 1.2;
    for (let i = -3; i <= 3; i += 1) {
      const t = i / 3;
      ctx.beginPath();
      ctx.moveTo(-edgeRadiusX * 0.82, t * edgeRadiusY * 1.6);
      ctx.lineTo(edgeRadiusX * 0.82, t * edgeRadiusY * 1.6);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawFace(ctx, baseImage, emblemImage, coinRadius, faceWidth, alpha, faceKind) {
    if (alpha <= 0.02) return;

    const width = Math.max(coinRadius * 0.1, faceWidth);
    const height = coinRadius;
    const sideOffset = faceKind === "front" ? this.rotationY : this.rotationY + Math.PI;
    const highlightShift = Math.sin(sideOffset) * coinRadius * 0.02;

    ctx.save();
    ctx.globalAlpha = clamp(alpha, 0, 1);
    ctx.translate(0, highlightShift);
    ctx.beginPath();
    ctx.ellipse(0, 0, width, height, 0, 0, TAU);
    ctx.clip();

    ctx.fillStyle = "#b8872e";
    ctx.fillRect(-width, -height, width * 2, height * 2);

    this.drawImageCover(ctx, baseImage, -width, -height, width * 2, height * 2);

    const emblemScale = faceKind === "front" ? 0.58 : 0.64;
    const emblemWidth = width * emblemScale;
    const emblemHeight = height * emblemScale;
    ctx.shadowColor = faceKind === "front" ? "rgba(255, 75, 94, 0.22)" : "rgba(194, 126, 255, 0.24)";
    ctx.shadowBlur = coinRadius * 0.08;
    this.drawImageContain(
      ctx,
      emblemImage,
      -emblemWidth,
      -emblemHeight,
      emblemWidth * 2,
      emblemHeight * 2
    );

    ctx.restore();
  }

  drawImageCover(ctx, image, x, y, width, height) {
    const iw = image.width || image.naturalWidth || 1;
    const ih = image.height || image.naturalHeight || 1;
    const scale = Math.max(width / iw, height / ih);
    const drawWidth = iw * scale;
    const drawHeight = ih * scale;
    const dx = x + (width - drawWidth) / 2;
    const dy = y + (height - drawHeight) / 2;
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  }

  drawImageContain(ctx, image, x, y, width, height) {
    const iw = image.width || image.naturalWidth || 1;
    const ih = image.height || image.naturalHeight || 1;
    const scale = Math.min(width / iw, height / ih);
    const drawWidth = iw * scale;
    const drawHeight = ih * scale;
    const dx = x + (width - drawWidth) / 2;
    const dy = y + (height - drawHeight) / 2;
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  }
}

globalThis.CoinTossScene = CoinTossScene;
