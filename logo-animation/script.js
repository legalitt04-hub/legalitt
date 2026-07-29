/**
 * LEGALITT LUXURY LOGO REVEAL ENGINE (NO YELLOW BARS)
 * High-performance 60 FPS HTML5 Canvas animation engine
 */

(function () {
  'use strict';

  // Canvas & Context Setup
  const canvas = document.getElementById('revealCanvas');
  const ctx = canvas.getContext('2d');

  // DOM Controls
  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const pauseIcon = document.getElementById('pauseIcon');
  const playText = document.getElementById('playText');
  const btnReplay = document.getElementById('btnReplay');
  const timelineScrubber = document.getElementById('timelineScrubber');
  const currentTimeDisplay = document.getElementById('currentTime');
  const totalTimeDisplay = document.getElementById('totalTime');
  const phaseBadge = document.getElementById('phaseBadge');
  const fpsCounter = document.getElementById('fpsCounter');
  const glowSlider = document.getElementById('glowSlider');
  const particleSlider = document.getElementById('particleSlider');
  const btnAudio = document.getElementById('btnAudio');
  const btnExport = document.getElementById('btnExport');
  const speedBtns = document.querySelectorAll('.speed-btn');

  // Load Official Logo Image Asset
  const logoImage = new Image();
  logoImage.src = 'assets/logo-transparent.png';
  let isLogoLoaded = false;

  logoImage.onload = () => {
    isLogoLoaded = true;
    requestAnimationFrame(renderFrame);
  };

  // Animation State
  const TOTAL_DURATION = 3.5; // Seconds
  let currentTime = 0.0;
  let isPlaying = true;
  let playbackSpeed = 1.0;
  let lastTimestamp = 0;
  let frameCount = 0;
  let lastFpsCalc = 0;
  let currentFps = 60;

  // Visual Effects Controls
  let glowIntensity = 0.7; // 0 to 1

  // Particle Engine
  class Particle {
    constructor(w, h) {
      this.reset(w, h, true);
    }

    reset(w, h, randomY = false) {
      this.x = Math.random() * w;
      this.y = randomY ? Math.random() * h : h + 10;
      this.radius = Math.random() * 2.5 + 0.8;
      this.speedY = Math.random() * -0.4 - 0.15;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseFactor = Math.random() * Math.PI * 2;
    }

    update(w, h) {
      this.x += this.speedX;
      this.y += this.speedY;
      this.pulseFactor += this.pulseSpeed;

      if (this.y < -20 || this.x < -20 || this.x > w + 20) {
        this.reset(w, h, false);
      }
    }

    draw(context) {
      const currentOpacity = Math.max(0.1, this.opacity + Math.sin(this.pulseFactor) * 0.25);
      context.save();
      context.beginPath();
      context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 215, 120, ${currentOpacity})`;
      context.shadowBlur = 8;
      context.shadowColor = 'rgba(255, 215, 0, 0.8)';
      context.fill();
      context.restore();
    }
  }

  let particles = [];
  function initParticles() {
    particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }
  }
  initParticles();

  // Main Render Loop
  function renderFrame(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000.0;
    lastTimestamp = timestamp;

    // FPS Calculation
    frameCount++;
    if (timestamp - lastFpsCalc >= 1000) {
      currentFps = Math.round((frameCount * 1000) / (timestamp - lastFpsCalc));
      fpsCounter.textContent = `${currentFps} FPS`;
      frameCount = 0;
      lastFpsCalc = timestamp;
    }

    // Playhead Advance
    if (isPlaying) {
      currentTime += delta * playbackSpeed;
      if (currentTime >= TOTAL_DURATION) {
        currentTime = TOTAL_DURATION;
        isPlaying = false;
        updatePlayPauseUI();
      }
      timelineScrubber.value = currentTime;
    } else {
      currentTime = parseFloat(timelineScrubber.value);
    }

    updateStatusUI();

    // Clear Canvas - Matte Black Luxury Vignette
    drawBackground();

    // Draw Ambient Golden Glow
    drawAmbientGlow();

    // Draw Golden Particles
    drawParticles();

    // Render Logo Animation Stages
    if (isLogoLoaded) {
      drawLogoRevealSequence(currentTime);
    }

    requestAnimationFrame(renderFrame);
  }

  // 1. Background Renderer (Matte Black with radial vignette)
  function drawBackground() {
    const w = canvas.width;
    const h = canvas.height;

    ctx.fillStyle = '#060709';
    ctx.fillRect(0, 0, w, h);

    const gradient = ctx.createRadialGradient(w / 2, h / 2, h * 0.2, w / 2, h / 2, w * 0.7);
    gradient.addColorStop(0, 'rgba(12, 16, 24, 0.4)');
    gradient.addColorStop(1, 'rgba(3, 4, 6, 0.95)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);
  }

  // 2. Ambient Warm Golden Backlight Glow
  function drawAmbientGlow() {
    if (glowIntensity <= 0) return;
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    const glowRadius = Math.min(w, h) * 0.4;
    const radialGlow = ctx.createRadialGradient(w / 2, h / 2, 10, w / 2, h / 2, glowRadius);

    let stageGlow = glowIntensity;
    if (currentTime < 0.5) {
      stageGlow *= (currentTime / 0.5) * 0.5;
    } else if (currentTime <= 2.5) {
      stageGlow *= 0.5 + 0.5 * ((currentTime - 0.5) / 2.0);
    } else {
      stageGlow *= 1.0;
    }

    radialGlow.addColorStop(0, `rgba(229, 178, 93, ${0.25 * stageGlow})`);
    radialGlow.addColorStop(0.4, `rgba(180, 120, 40, ${0.12 * stageGlow})`);
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = radialGlow;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }

  // 3. Floating Golden Particle System
  function drawParticles() {
    const activeCount = Math.floor((particleSlider.value / 100) * particles.length);
    for (let i = 0; i < activeCount; i++) {
      particles[i].update(canvas.width, canvas.height);
      particles[i].draw(ctx);
    }
  }

  // 4. LOGO REVEAL SEQUENCE (Progressive Mask - No Yellow Bars)
  function drawLogoRevealSequence(t) {
    const cw = canvas.width;
    const ch = canvas.height;

    const maxLogoWidth = cw * 0.55;
    const maxLogoHeight = ch * 0.45;
    const logoScale = Math.min(maxLogoWidth / logoImage.width, maxLogoHeight / logoImage.height);

    const logoW = logoImage.width * logoScale;
    const logoH = logoImage.height * logoScale;
    const logoX = (cw - logoW) / 2;
    const logoY = (ch - logoH) / 2;

    const cameraScale = 1.0 + (t / TOTAL_DURATION) * 0.015;

    ctx.save();
    ctx.translate(cw / 2, ch / 2);
    ctx.scale(cameraScale, cameraScale);
    ctx.translate(-cw / 2, -ch / 2);

    // Progressive Mask Reveal (0.5s - 2.5s)
    const T_START = 0.5;
    const T_END = 2.5;

    let progress = 0.0;
    if (t < T_START) {
      progress = 0.0;
    } else if (t >= T_START && t <= T_END) {
      progress = (t - T_START) / (T_END - T_START);
    } else {
      progress = 1.0;
    }

    const currentX = logoX + progress * (logoW + 10);

    if (t >= T_START) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(logoX - 20, logoY - 20, currentX - (logoX - 20), logoH + 40);
      ctx.clip();

      ctx.drawImage(logoImage, logoX, logoY, logoW, logoH);
      ctx.restore();
    }

    ctx.restore();
  }

  // STATUS & UI UPDATERS
  function updateStatusUI() {
    currentTimeDisplay.textContent = `${currentTime.toFixed(2)}s`;
    const progressPercent = (currentTime / TOTAL_DURATION) * 100;
    document.getElementById('timelineProgress').style.width = `${progressPercent}%`;

    if (currentTime < 0.5) {
      phaseBadge.textContent = 'STAGE 0: MATTE BLACK INTRO';
    } else if (currentTime >= 0.5 && currentTime <= 2.5) {
      phaseBadge.textContent = 'STAGE 1: PROGRESSIVE LOGO REVEAL';
    } else {
      phaseBadge.textContent = 'STAGE 2: LOGO REVEALED & HOLD';
    }
  }

  function updatePlayPauseUI() {
    if (isPlaying) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'block';
      playText.textContent = 'Pause';
    } else {
      playIcon.style.display = 'block';
      pauseIcon.style.display = 'none';
      playText.textContent = 'Play';
    }
  }

  btnPlayPause.addEventListener('click', () => {
    if (currentTime >= TOTAL_DURATION) {
      currentTime = 0.0;
    }
    isPlaying = !isPlaying;
    updatePlayPauseUI();
  });

  btnReplay.addEventListener('click', () => {
    currentTime = 0.0;
    timelineScrubber.value = 0;
    isPlaying = true;
    updatePlayPauseUI();
  });

  timelineScrubber.addEventListener('input', () => {
    currentTime = parseFloat(timelineScrubber.value);
    updateStatusUI();
  });

  speedBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      speedBtns.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      playbackSpeed = parseFloat(btn.dataset.speed);
    });
  });

  glowSlider.addEventListener('input', () => {
    glowIntensity = glowSlider.value / 100;
  });

  btnExport.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `Legalitt_Logo_Reveal_${currentTime.toFixed(2)}s.png`;
    link.href = dataUrl;
    link.click();
  });

})();
