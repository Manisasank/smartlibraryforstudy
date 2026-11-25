/**
 * SMART LIBRARY — 3D VIRTUAL CAMPUS & INTERACTIVE BOOK ENGINE (Masterpiece WebGL)
 * 
 * World-Class 3D Academic Experience:
 * - 1. Hero 3D Interactive Floating Book Hologram Showcase with physics tilt & drag
 * - 2. High-Fidelity 3D Virtual Campus with vibrant architectural lighting, Corinthian columns,
 *      coffered ceilings, polished marble/chevron parquet, velvet runner, and stained glass windows
 * - 3. 6 Grand Academic Stacks with THREE.InstancedMesh (60 FPS locked, single draw call per stack)
 *      and floating glowing neon category beacons with sparkle motes
 * - 4. 24 Study Desks with glowing banker lamps and dynamic real-time seat reservation feedback
 * - 5. Grand Reception Desk with rotating 3D Golden Library Emblem and featured Book of the Month
 * - 6. Interactive 3D Hardcover Book Model Inspector: 360° orbit, embossed gold foil, spine ribs,
 *      deckled paper block, satin ribbon bookmark, openable cover revealing typeset academic text & page flip
 * - 7. Cinematic Waypoints with smooth cubic easing + Camera Zoom / Reset / Fullscreen controls
 * - 8. Lighting Mood Switcher: Daylight Academic, Midnight Velvet, Golden Hour Sunset
 * - 9. Butter-Smooth Efficiency: IntersectionObserver viewport pausing + visibilitychange tab sleep
 * - 10. 100% Offline Reliability: Zero external network dependencies, local fallback
 */

class Library3DEngine {
  constructor() {
    // Campus Scene & WebGL Elements
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;
    this.clock = null;

    // Interactive tracking
    this.interactiveObjects = [];
    this.deskMeshes = {};
    this.shelfMeshes = [];
    this.shelfBanners = [];
    this.hoveredObject = null;
    this.originalHoverColor = null;
    this.originalEmissive = null;
    this.originalEmissiveIntensity = 0;

    // Physical 3D Shelf Books & Extraction Animation Sub-System
    this.shelfBookMeshes = [];
    this.extractedBookMesh = null;
    this.animatingShelfBooks = new Set();
    this.springOmega = 14.0;
    this.springZeta = 0.85;

    // Performance & Adaptive Quality Scaling
    this.qualityTier = 'ultra';
    this.fpsHistory = [];
    this.currentFPS = 60;
    this.lastFrameTime = 0;
    this.frameCount = 0;
    this.showPerfOverlay = false;

    // GLTF Model Cache
    this.loadedModels = new Map();
    this.gltfLoader = null;
    this.isOrbitDragging = false;
    this.pointerDownX = 0;
    this.pointerDownY = 0;
    this.pointerDownTime = 0;

    // Pointer & Touch coordinates for tooltip
    this.pointerClientX = 0;
    this.pointerClientY = 0;
    this.touchStartX = 0;
    this.touchStartY = 0;
    this.touchStartTime = 0;

    // Cinematic Camera transitions
    this.targetCameraPos = null;
    this.targetLookAt = null;
    this.isTransitioning = false;
    this.transitionProgress = 0;
    this.transitionDuration = 1.3;
    this.startCameraPos = null;
    this.startLookAt = null;
    this.activeWaypoint = 'entrance';
    this.cameraLookAt = null;

    // Particle systems
    this.dustParticles = null;
    this.particlePositions = null;
    this.particleVelocities = null;

    // Animated objects
    this.hologramEmblem = null;
    this.lampLights = [];
    this.displayBookMesh = null;
    this.sconceLights = [];
    this.chandeliers = [];
    this.ambientLight = null;
    this.sunMoonLight = null;

    // State flags & Performance
    this.isInitialized = false;
    this.isDestroyed = false;
    this.animationFrameId = null;
    this.isCampusVisible = true;
    this.isTabActive = true;
    this.currentMood = 'midnight';

    // 3D Book Inspector Sub-System (Multi-Page Reading Experience)
    this.inspectorContainer = null;
    this.inspectorScene = null;
    this.inspectorCamera = null;
    this.inspectorRenderer = null;
    this.inspectorControls = null;
    this.inspectorBookGroup = null;
    this.inspectorCoverMesh = null;
    this.isCoverOpen = false;
    this.currentInspectedBookId = 1;
    this.inspectorInitialized = false;
    this.isInspectorAnimating = false;
    this.inspectorFrameId = null;
    this.inspectorCurrentPage = 1;
    this.inspectorCurrentSpread = 0; // 0 = p.1-2, 1 = p.3-4, 2 = p.5-6
    this.inspectorTotalSpreads = 3;
    this.isPageTurning = false;
    this.turningPageProgress = 0;
    this.turningPageGroup = null;
    this.restingPageMesh = null;
    this.turnDirection = 1;
    this.spreadTextures = [];
    this.endpaperTexture = null;
    this.turningPageFrontMat = null;
    this.turningPageBackMat = null;

    // Hero 3D Hologram Showcase Sub-System
    this.heroContainer = null;
    this.heroScene = null;
    this.heroCamera = null;
    this.heroRenderer = null;
    this.heroBookGroup = null;
    this.heroHoloRing = null;
    this.heroParticles = null;
    this.heroBookIndex = 0;
    this.isHeroAnimating = false;
    this.heroFrameId = null;
    this.isHeroVisible = true;
    this.heroPointer = {
      x: 0, y: 0,
      targetX: 0, targetY: 0,
      isDragging: false,
      prevX: 0, prevY: 0,
      startX: 0, startY: 0,
      velX: 0, velY: 0,
      isPinching: false,
      pinchStartDist: 0,
      initialCameraZ: 6.4
    };
  }

  // ==========================================
  // 1. PROCEDURAL CANVAS TEXTURE GENERATORS
  // (Zero external downloads, instant 60 FPS)
  // ==========================================

  createParquetFloorTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Base rich mahogany wood
    ctx.fillStyle = '#2C0E16';
    ctx.fillRect(0, 0, 512, 512);

    const tileSize = 64;
    const tones = ['#36121C', '#451724', '#260B13', '#3A1420', '#4C1B28', '#200810'];

    for (let x = 0; x < 512; x += tileSize) {
      for (let y = 0; y < 512; y += tileSize) {
        const isHorizontal = ((x / tileSize) + (y / tileSize)) % 2 === 0;
        const plankCount = 4;
        const plankW = isHorizontal ? tileSize : tileSize / plankCount;
        const plankH = isHorizontal ? tileSize / plankCount : tileSize;

        for (let p = 0; p < plankCount; p++) {
          const px = isHorizontal ? x : x + (p * plankW);
          const py = isHorizontal ? y + (p * plankH) : y;
          const tone = tones[(x + y + p) % tones.length];

          ctx.fillStyle = tone;
          ctx.fillRect(px, py, plankW, plankH);

          // Wood grain fine lines
          ctx.strokeStyle = 'rgba(255, 209, 102, 0.08)';
          ctx.lineWidth = 1;
          for (let g = 0; g < 3; g++) {
            ctx.beginPath();
            if (isHorizontal) {
              const gy = py + Math.random() * plankH;
              ctx.moveTo(px, gy);
              ctx.lineTo(px + plankW, gy);
            } else {
              const gx = px + Math.random() * plankW;
              ctx.moveTo(gx, py);
              ctx.lineTo(gx, py + plankH);
            }
            ctx.stroke();
          }

          // Plank seam shadow & subtle gold inlay highlight
          ctx.strokeStyle = '#14050A';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px, py, plankW, plankH);
          ctx.strokeStyle = 'rgba(255, 209, 102, 0.14)';
          ctx.lineWidth = 0.5;
          ctx.strokeRect(px + 0.5, py + 0.5, plankW - 1, plankH - 1);
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(12, 12);
    if (this.renderer && this.renderer.capabilities) {
      texture.anisotropy = Math.min(4, this.renderer.capabilities.getMaxAnisotropy());
    }
    return texture;
  }

  createCarpetRunnerTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Royal Crimson Velvet background
    ctx.fillStyle = '#5A1724';
    ctx.fillRect(0, 0, 512, 512);

    // Velvet nap texture
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(109, 33, 47, 0.35)' : 'rgba(38, 10, 16, 0.45)';
      ctx.fillRect(Math.random() * 512, Math.random() * 512, 2, 2);
    }

    // Outer Champagne Gold decorative bands
    ctx.fillStyle = '#FFD166';
    ctx.fillRect(24, 0, 12, 512);
    ctx.fillRect(476, 0, 12, 512);

    // Inner thin gold pinstripes
    ctx.fillStyle = 'rgba(255, 209, 102, 0.85)';
    ctx.fillRect(44, 0, 4, 512);
    ctx.fillRect(464, 0, 4, 512);

    // Embroidered gold fretwork motif along borders
    ctx.fillStyle = '#FFAE33';
    for (let y = 0; y < 512; y += 32) {
      ctx.beginPath();
      ctx.arc(30, y + 16, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(482, y + 16, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Center gold medallion watermark
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 80, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(256, 256, 68, 0, Math.PI * 2);
    ctx.stroke();

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 10);
    return texture;
  }

  createWoodTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Warm polished mahogany / walnut grain
    ctx.fillStyle = '#3A131E';
    ctx.fillRect(0, 0, 256, 256);

    ctx.strokeStyle = 'rgba(255, 209, 102, 0.12)';
    for (let i = 0; i < 40; i++) {
      const y = Math.random() * 256;
      ctx.lineWidth = Math.random() * 2 + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.bezierCurveTo(80, y + Math.random() * 8 - 4, 180, y + Math.random() * 8 - 4, 256, y);
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  createMarbleTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Wine marble with Champagne Gold veining
    ctx.fillStyle = '#451725';
    ctx.fillRect(0, 0, 256, 256);

    // Gold & Ivory fine veins
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(10, 0);
    ctx.bezierCurveTo(90, 80, 140, 120, 250, 240);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 248, 240, 0.3)';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.moveTo(120, 0);
    ctx.bezierCurveTo(80, 110, 190, 180, 170, 256);
    ctx.stroke();

    return new THREE.CanvasTexture(canvas);
  }

  createWallWainscotTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep Mahogany base
    ctx.fillStyle = '#2E1019';
    ctx.fillRect(0, 0, 512, 512);

    // Two classical wall panelling insets
    [ { x: 30, y: 30, w: 200, h: 452 }, { x: 282, y: 30, w: 200, h: 452 } ].forEach(p => {
      // Outer shadow & inner dark crimson field
      ctx.fillStyle = '#220A12';
      ctx.fillRect(p.x, p.y, p.w, p.h);

      // Gold bead moulding
      ctx.strokeStyle = '#FFD166';
      ctx.lineWidth = 3;
      ctx.strokeRect(p.x + 8, p.y + 8, p.w - 16, p.h - 16);

      ctx.strokeStyle = 'rgba(255, 209, 102, 0.35)';
      ctx.lineWidth = 1;
      ctx.strokeRect(p.x + 14, p.y + 14, p.w - 28, p.h - 28);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(6, 2);
    return texture;
  }

  createWindowSkyTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Twilight indigo sky gradient
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, '#0F091F');
    grad.addColorStop(0.5, '#221033');
    grad.addColorStop(0.85, '#481D50');
    grad.addColorStop(1, '#6E2332');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Glowing stars
    ctx.fillStyle = '#FFF8E7';
    for (let i = 0; i < 90; i++) {
      const sx = Math.random() * 512;
      const sy = Math.random() * 160;
      const sr = Math.random() * 1.3 + 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Crescent moon
    ctx.fillStyle = '#FFE8A3';
    ctx.beginPath();
    ctx.arc(420, 60, 22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1A0B2C';
    ctx.beginPath();
    ctx.arc(427, 56, 19, 0, Math.PI * 2);
    ctx.fill();

    // Distant Gothic university spires & clock tower silhouettes
    ctx.fillStyle = '#150618';
    ctx.beginPath();
    ctx.moveTo(0, 256);
    ctx.lineTo(0, 200);
    ctx.lineTo(60, 200);
    ctx.lineTo(90, 130);
    ctx.lineTo(120, 200);
    ctx.lineTo(190, 200);
    ctx.lineTo(210, 90);
    ctx.lineTo(230, 200);
    ctx.lineTo(310, 200);
    ctx.lineTo(340, 140);
    ctx.lineTo(370, 200);
    ctx.lineTo(512, 200);
    ctx.lineTo(512, 256);
    ctx.closePath();
    ctx.fill();

    // Clock tower glowing face
    ctx.fillStyle = '#FFD166';
    ctx.beginPath();
    ctx.arc(210, 130, 8, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  createParticleTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 235, 175, 1)');
    grad.addColorStop(0.3, 'rgba(255, 209, 102, 0.8)');
    grad.addColorStop(0.7, 'rgba(255, 209, 102, 0.2)');
    grad.addColorStop(1, 'rgba(255, 209, 102, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(canvas);
  }

  createSignTexture(categoryName, colorHex) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep glass background with gold border
    ctx.fillStyle = 'rgba(28, 10, 16, 0.94)';
    ctx.fillRect(0, 0, 512, 128);

    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(12, 12, 488, 104);

    // Decorative corner flourishes
    ctx.fillStyle = '#FFD166';
    [ [16, 16], [496, 16], [16, 112], [496, 112] ].forEach(([cx, cy]) => {
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Subtitle
    ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#E8D8C4';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ UNIVERSITY ACADEMIC STACKS', 256, 40);

    // Category Title
    ctx.font = 'bold 30px "Plus Jakarta Sans", "Georgia", serif';
    ctx.fillStyle = '#FFD166';
    ctx.shadowColor = '#FFD166';
    ctx.shadowBlur = 10;
    ctx.fillText(categoryName.toUpperCase(), 256, 84);

    // Subtle rack locator hint
    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = 'rgba(255, 209, 102, 0.75)';
    ctx.shadowBlur = 0;
    ctx.fillText('TIERS: RACK A • RACK B • RACK C', 256, 110);

    return new THREE.CanvasTexture(canvas);
  }

  createRackPlateTexture(rackText) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep lacquer morocco background
    ctx.fillStyle = '#260B12';
    ctx.fillRect(0, 0, 256, 64);

    // Brushed gold border gradient
    const grad = ctx.createLinearGradient(0, 0, 256, 64);
    grad.addColorStop(0, '#FFE8A3');
    grad.addColorStop(0.5, '#C4973B');
    grad.addColorStop(1, '#FFE8A3');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 4;
    ctx.strokeRect(3, 3, 250, 58);

    // Inner gold hairline
    ctx.strokeStyle = 'rgba(255, 209, 102, 0.4)';
    ctx.lineWidth = 1;
    ctx.strokeRect(7, 7, 242, 50);

    // Decorative corner rivets
    ctx.fillStyle = '#FFD166';
    [[12, 12], [244, 12], [12, 52], [244, 52]].forEach(([rx, ry]) => {
      ctx.beginPath();
      ctx.arc(rx, ry, 2.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Engraved rack title in bold serif
    ctx.font = 'bold 22px "Plus Jakarta Sans", "Georgia", serif';
    ctx.fillStyle = '#FFD166';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FFD166';
    ctx.shadowBlur = 8;
    ctx.fillText(rackText.toUpperCase(), 128, 38);

    return new THREE.CanvasTexture(canvas);
  }

  // ==========================================
  // 2. INITIALIZATION & SETUP
  // ==========================================

  init() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container || typeof THREE === 'undefined') {
      console.warn('Three.js or #webgl-canvas-container not ready.');
      return;
    }

    if (this.isInitialized) return;

    // 1. Scene & Atmosphere (Vibrant, high-contrast, crystal-clear)
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0B0F19);
    this.scene.fog = new THREE.FogExp2(0x0B0F19, 0.008);
    this.clock = new THREE.Clock();

    // 2. Camera
    const aspect = (this.container.clientWidth || window.innerWidth) / (this.container.clientHeight || 540);
    this.camera = new THREE.PerspectiveCamera(48, aspect, 0.1, 200);
    this.camera.position.set(0, 15, 32);
    this.cameraLookAt = new THREE.Vector3(0, 2.5, 0);
    this.camera.lookAt(this.cameraLookAt);

    // 3. Renderer with High Performance & Film-Grade Tone Mapping
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    const initW = this.container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 960);
    const initH = this.container.clientHeight || 540;
    this.renderer.setSize(initW, initH);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    if (THREE.sRGBEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }
    if (THREE.ACESFilmicToneMapping) {
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35; // Crystal-clear, vibrant, not murky!
    }
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Smooth OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // prevent dipping beneath floor
      this.controls.minDistance = 4;
      this.controls.maxDistance = 70;
      this.controls.target.copy(this.cameraLookAt);
    }

    // 5. Build Commons Elements
    this.setupLighting();
    this.buildFloorAndCeiling();
    this.buildLibraryWalls();
    this.buildBookshelfAisles();
    this.buildStudyDesks();
    this.buildCirculationDesk();
    this.buildDustParticles();

    // 6. Raycaster & Pointer Interaction
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Event Listeners with Mobile Touch Tap Support
    this._onResize = () => this.onWindowResize();
    this._onMove = (e) => this.onPointerMove(e);
    this._onClick = (e) => this.onPointerClick(e);
    this._onTouchStart = (e) => this.onTouchStart(e);
    this._onTouchEnd = (e) => this.onTouchEnd(e);

    window.addEventListener('resize', this._onResize);
    this.renderer.domElement.addEventListener('mousemove', this._onMove);
    this.renderer.domElement.addEventListener('click', this._onClick);
    this.renderer.domElement.addEventListener('touchstart', this._onTouchStart, { passive: true });
    this.renderer.domElement.addEventListener('touchend', this._onTouchEnd, { passive: true });

    // Keyboard shortcut Shift+P for real-time 3D telemetry
    this._onKeyDown = (e) => {
      if (e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        this.togglePerfOverlay();
      }
    };
    window.addEventListener('keydown', this._onKeyDown);

    // 7. Initialize Hero 3D Showcase (if hero element is in DOM)
    this.initHeroShowcase();

    // 8. Setup Efficiency Observers (IntersectionObserver + visibilitychange)
    this.setupEfficiencyObservers();

    if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.isDestroyed = false;
    this.isInitialized = true;
    this.animate();
    console.log('🏛️ Masterpiece 3D Virtual Campus initialized (60 FPS, Instanced Books & Procedural Textures)');
  }

  // ==========================================
  // 3. CINEMATIC LIGHTING DESIGN
  // ==========================================

  setupLighting() {
    // 1. Warm Ivory / Champagne Gold Ambient base (Brilliant & Readable)
    this.ambientLight = new THREE.AmbientLight(0xFFF5E6, 0.72);
    this.scene.add(this.ambientLight);

    // 2. Soft Directional Window Moonlight from East Terrace
    this.sunMoonLight = new THREE.DirectionalLight(0xA4C8E8, 0.55);
    this.sunMoonLight.position.set(28, 18, -4);
    this.sunMoonLight.castShadow = true;
    this.sunMoonLight.shadow.mapSize.width = 1024;
    this.sunMoonLight.shadow.mapSize.height = 1024;
    this.sunMoonLight.shadow.camera.near = 2;
    this.sunMoonLight.shadow.camera.far = 70;
    this.sunMoonLight.shadow.camera.left = -25;
    this.sunMoonLight.shadow.camera.right = 25;
    this.sunMoonLight.shadow.camera.top = 25;
    this.sunMoonLight.shadow.camera.bottom = -25;
    this.sunMoonLight.shadow.bias = -0.0005;
    this.scene.add(this.sunMoonLight);

    // 3. Warm Chandelier Spotlights down the central velvet aisle
    const chandelierPositions = [
      { x: 0, y: 16, z: 14 },
      { x: 0, y: 16, z: -2 },
      { x: 0, y: 16, z: -18 }
    ];

    chandelierPositions.forEach((pos, idx) => {
      const chanGroup = new THREE.Group();
      chanGroup.position.set(pos.x, pos.y, pos.z);

      const brassRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.6, 0.08, 12, 32),
        new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.88, roughness: 0.22 })
      );
      brassRing.rotation.x = Math.PI / 2;
      chanGroup.add(brassRing);

      // Hanging crystal prisms
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0xFFF8E7,
        roughness: 0.1,
        metalness: 0.1,
        transparent: true,
        opacity: 0.85
      });
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
        const crystal = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.5, 6), crystalMat);
        crystal.position.set(Math.cos(a) * 1.6, -0.3, Math.sin(a) * 1.6);
        chanGroup.add(crystal);
      }
      this.scene.add(chanGroup);
      this.chandeliers.push(chanGroup);

      // Spot Light focusing on the central carpet
      const spot = new THREE.SpotLight(0x38BDF8, (idx === 1 ? 1.6 : 1.3), 42, Math.PI / 3.2, 0.45, 1.2);
      spot.position.set(pos.x, pos.y - 0.2, pos.z);
      spot.target.position.set(pos.x, 0, pos.z);
      this.scene.add(spot);
      this.scene.add(spot.target);
    });

    // 4. Atmospheric Crimson Rim Light
    const crimsonRim = new THREE.DirectionalLight(0x8B1E3F, 0.65);
    crimsonRim.position.set(-25, 14, -15);
    this.scene.add(crimsonRim);

    // 5. Optimized Study Pod Warm Lights (3 Zone Lights to guarantee 60 FPS)
    const podLights = [
      { x: 7, y: 4.5, z: 0 },   // Silent Pod
      { x: 14, y: 4.5, z: 0 },  // Collab Pod
      { x: 21, y: 4.5, z: 0 }   // Window Pod
    ];
    podLights.forEach(p => {
      const pLight = new THREE.PointLight(0xFFE2A0, 0.95, 24, 1.6);
      pLight.position.set(p.x, p.y, p.z);
      this.scene.add(pLight);
    });
  }

  // Lighting Mood Presets (Daylight, Midnight, Golden Hour)
  setLightingMood(mood) {
    this.currentMood = mood;
    if (!this.ambientLight || !this.sunMoonLight || !this.scene) return;

    if (mood === 'daylight') {
      if (this.ambientLight.color?.setHex) this.ambientLight.color.setHex(0xFFFFFF);
      this.ambientLight.intensity = 0.92;
      if (this.sunMoonLight.color?.setHex) this.sunMoonLight.color.setHex(0xFFFAF0);
      this.sunMoonLight.intensity = 0.85;
      if (this.scene.background?.setHex) this.scene.background.setHex(0x23141E);
      if (this.scene.fog?.color?.setHex) this.scene.fog.color.setHex(0x23141E);
    } else if (mood === 'golden') {
      if (this.ambientLight.color?.setHex) this.ambientLight.color.setHex(0xFFD59E);
      this.ambientLight.intensity = 0.82;
      if (this.sunMoonLight.color?.setHex) this.sunMoonLight.color.setHex(0xFF9E40);
      this.sunMoonLight.intensity = 0.95;
      if (this.scene.background?.setHex) this.scene.background.setHex(0x261016);
      if (this.scene.fog?.color?.setHex) this.scene.fog.color.setHex(0x261016);
    } else { // 'midnight' default
      if (this.ambientLight.color?.setHex) this.ambientLight.color.setHex(0xFFF5E6);
      this.ambientLight.intensity = 0.72;
      if (this.sunMoonLight.color?.setHex) this.sunMoonLight.color.setHex(0xA4C8E8);
      this.sunMoonLight.intensity = 0.55;
      if (this.scene.background?.setHex) this.scene.background.setHex(0x0B0F19);
      if (this.scene.fog?.color?.setHex) this.scene.fog.color.setHex(0x0B0F19);
    }

    // Update active HUD button
    if (typeof document !== 'undefined' && typeof document.querySelectorAll === 'function') {
      document.querySelectorAll('.mood-btn').forEach(btn => {
        if (btn?.classList?.toggle) {
          btn.classList.toggle('active', btn.dataset?.mood === mood);
        }
      });
    }
  }

  // ==========================================
  // 4. ARCHITECTURAL COMMONS, WALLS & FLOOR
  // ==========================================

  buildFloorAndCeiling() {
    // 1. Grand Parquet Wood Floor with Procedural Canvas Texture
    const parquetTex = this.createParquetFloorTexture();
    const floorGeo = new THREE.PlaneGeometry(76, 76);
    const floorMat = new THREE.MeshStandardMaterial({
      map: parquetTex,
      roughness: 0.25,
      metalness: 0.22
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // 2. Central Velvet Carpet Runner
    const carpetTex = this.createCarpetRunnerTexture();
    const carpetGeo = new THREE.PlaneGeometry(5.4, 62);
    const carpetMat = new THREE.MeshStandardMaterial({
      map: carpetTex,
      roughness: 0.6,
      metalness: 0.08
    });
    const runner = new THREE.Mesh(carpetGeo, carpetMat);
    runner.rotation.x = -Math.PI / 2;
    runner.position.set(0, 0.02, 3);
    runner.receiveShadow = true;
    this.scene.add(runner);

    // 3. Brass / Gold Floor Inlay Medallions
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      roughness: 0.25,
      metalness: 0.88
    });

    const entranceRing = new THREE.Mesh(new THREE.RingGeometry(2.8, 2.95, 36), goldMat);
    entranceRing.rotation.x = -Math.PI / 2;
    entranceRing.position.set(0, 0.03, 18);
    this.scene.add(entranceRing);

    // 4. High Coffered Vaulted Ceiling
    const ceilingGeo = new THREE.PlaneGeometry(76, 76);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x220D15,
      roughness: 0.55,
      metalness: 0.12
    });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 17;
    this.scene.add(ceiling);

    // Timber vault beams across ceiling
    const beamMat = new THREE.MeshStandardMaterial({ color: 0x34121A, roughness: 0.5 });
    for (let bz = -30; bz <= 30; bz += 10) {
      const beam = new THREE.Mesh(new THREE.BoxGeometry(76, 0.8, 0.8), beamMat);
      beam.position.set(0, 16.6, bz);
      this.scene.add(beam);
    }

    // 5. Fluted Architectural Pillars (Corinthian style)
    const pillarGeo = new THREE.CylinderGeometry(0.65, 0.72, 17, 24);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x481A26,
      roughness: 0.32,
      metalness: 0.18
    });
    const pillarPositions = [
      [-22, 8.5, -22], [-22, 8.5, -6], [-22, 8.5, 10], [-22, 8.5, 26],
      [22, 8.5, -22], [22, 8.5, -6], [22, 8.5, 10], [22, 8.5, 26]
    ];
    pillarPositions.forEach(pos => {
      const pillarGroup = new THREE.Group();
      pillarGroup.position.set(...pos);

      const shaft = new THREE.Mesh(pillarGeo, pillarMat);
      shaft.castShadow = true;
      shaft.receiveShadow = true;
      pillarGroup.add(shaft);

      // Gold capital & plinth
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 1.8), goldMat);
      cap.position.y = 8.25;
      pillarGroup.add(cap);

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.6, 1.9), goldMat);
      plinth.position.y = -8.2;
      pillarGroup.add(plinth);

      this.scene.add(pillarGroup);
    });
  }

  buildLibraryWalls() {
    const wallTex = this.createWallWainscotTexture();
    const goldMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.88, roughness: 0.22 });
    const wallMat = new THREE.MeshStandardMaterial({
      map: wallTex,
      roughness: 0.42,
      metalness: 0.14
    });

    // 1. North Wall (Behind Reception Desk, z = -38)
    const northWall = new THREE.Mesh(new THREE.PlaneGeometry(76, 17), wallMat);
    northWall.position.set(0, 8.5, -38);
    this.scene.add(northWall);

    // North Wall Cornice & Plinth Trim
    const northCornice = new THREE.Mesh(new THREE.BoxGeometry(76, 0.5, 0.6), goldMat);
    northCornice.position.set(0, 16.75, -37.8);
    this.scene.add(northCornice);

    // 2. West Wall (Behind Stacks, x = -38)
    const westWall = new THREE.Mesh(new THREE.PlaneGeometry(76, 17), wallMat);
    westWall.position.set(-38, 8.5, 0);
    westWall.rotation.y = Math.PI / 2;
    this.scene.add(westWall);

    // 3. South Entrance Wall (z = 38)
    const southWall = new THREE.Mesh(new THREE.PlaneGeometry(76, 17), wallMat);
    southWall.position.set(0, 8.5, 38);
    southWall.rotation.y = Math.PI;
    this.scene.add(southWall);

    // 4. East Wall: Arched Panoramic Windows (Window Terrace)
    const windowTex = this.createWindowSkyTexture();
    for (let wz = -20; wz <= 20; wz += 10) {
      const winGroup = new THREE.Group();
      winGroup.position.set(25.8, 8, wz);
      winGroup.rotation.y = -Math.PI / 2;

      // Arched glass pane with twilight campus sky view
      const glassPane = new THREE.Mesh(
        new THREE.PlaneGeometry(7.5, 12),
        new THREE.MeshBasicMaterial({ map: windowTex })
      );
      winGroup.add(glassPane);

      // Brass window arch frame & mullions
      const frameMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.75, roughness: 0.25 });
      const frameBorder = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.25, 0.4), frameMat);
      frameBorder.position.y = 6;
      winGroup.add(frameBorder);

      const mullionV = new THREE.Mesh(new THREE.BoxGeometry(0.12, 12, 0.2), frameMat);
      winGroup.add(mullionV);

      // Window seat bench with velvet cushion
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(7.5, 0.6, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x6E2332, roughness: 0.55 })
      );
      bench.position.set(0, -6.5, 0.9);
      winGroup.add(bench);

      this.scene.add(winGroup);
    }

    // 5. Brass Wall Sconces with soft golden glow along the walls
    const sconcePositions = [
      [ -14, 6.5, -37.7 ], [ 14, 6.5, -37.7 ],
      [ -37.7, 6.5, -14 ], [ -37.7, 6.5, 14 ],
      [ -14, 6.5, 37.7 ], [ 14, 6.5, 37.7 ]
    ];
    sconcePositions.forEach(pos => {
      const scGroup = new THREE.Group();
      scGroup.position.set(...pos);

      const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.1, 16), goldMat);
      mount.rotation.x = Math.PI / 2;
      scGroup.add(mount);

      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.4), goldMat);
      arm.position.set(0, 0.2, 0.15);
      scGroup.add(arm);

      const globe = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 16, 16),
        new THREE.MeshStandardMaterial({
          color: 0xFFE2A0,
          emissive: 0x38BDF8,
          emissiveIntensity: 0.85,
          roughness: 0.2
        })
      );
      globe.position.set(0, 0.45, 0.15);
      scGroup.add(globe);

      this.scene.add(scGroup);
    });
  }

  // ==========================================
  // 5. GRAND ACADEMIC BOOKSHELVES (Left Wing)
  // WITH INSTANCEDMESH BOOK ROWS (60 FPS)
  // ==========================================

  getShelfTierBooks(cat, tierIdx) {
    const tierRacks = cat.racks || ['RACK A', 'RACK B', 'RACK C'];
    const rackName = tierRacks[tierIdx];
    const rackLetter = rackName.replace('RACK ', '').trim();

    const masterCatalog = {
      "AI & ML": [
        [
          { id: 1, title: "Deep Learning & Neural Architectures", author: "Ian Goodfellow, Yoshua Bengio, Aaron Courville", category: "AI & ML", isbn: "978-0262035613", copies: 5, available: 3, shelf: "FL-2 / AISLE-4 / RACK-A1", desc: "The definitive textbook on deep mathematical foundations of neural networks, backpropagation, and representation learning." },
          { id: 9, title: "Reinforcement Learning: An Introduction", author: "Richard S. Sutton, Andrew G. Barto", category: "AI & ML", isbn: "978-0262039246", copies: 4, available: 2, shelf: "FL-2 / AISLE-4 / RACK-A2", desc: "Foundations of Markov Decision Processes, dynamic programming, temporal-difference learning, and policy gradients." },
          { id: 4, title: "Pattern Recognition and Machine Learning", author: "Christopher M. Bishop", category: "AI & ML", isbn: "978-0387310732", copies: 4, available: 1, shelf: "FL-2 / AISLE-4 / RACK-A3", desc: "Bayesian perspective on machine learning, Gaussian processes, variational inference, and graphical models." },
          { id: 101, title: "Hands-On Machine Learning with Scikit-Learn", author: "Aurélien Géron", category: "AI & ML", isbn: "978-1098125974", copies: 6, available: 4, shelf: "FL-2 / AISLE-4 / RACK-A4", desc: "Practical guide to training production machine learning models and neural networks." },
          { id: 102, title: "Deep Learning with Python", author: "François Chollet", category: "AI & ML", isbn: "978-1617296864", copies: 5, available: 3, shelf: "FL-2 / AISLE-4 / RACK-A5", desc: "Intuitive exploration of modern computer vision and generative AI using Keras." },
          { id: 103, title: "Probabilistic Machine Learning", author: "Kevin P. Murphy", category: "AI & ML", isbn: "978-0262046824", copies: 4, available: 2, shelf: "FL-2 / AISLE-4 / RACK-A6", desc: "Comprehensive probabilistic treatment of linear models and variational methods." },
          { id: 104, title: "Mathematics for Machine Learning", author: "Marc Peter Deisenroth", category: "AI & ML", isbn: "978-1108455145", copies: 5, available: 4, shelf: "FL-2 / AISLE-4 / RACK-A7", desc: "Linear algebra, vector calculus, and optimization principles." },
          { id: 105, title: "Foundations of Machine Learning", author: "Mehryar Mohri", category: "AI & ML", isbn: "978-0262039406", copies: 4, available: 3, shelf: "FL-2 / AISLE-4 / RACK-A8", desc: "Generalization bounds, Rademacher complexity, kernel methods, and boosting." }
        ],
        [
          { id: 106, title: "Speech and Language Processing", author: "Dan Jurafsky, James H. Martin", category: "AI & ML", isbn: "978-0131809796", copies: 5, available: 3, shelf: "FL-2 / AISLE-3 / RACK-B1", desc: "The definitive text on computational linguistics and LLM foundations." },
          { id: 12, title: "Artificial Intelligence: A Modern Approach (4th Ed)", author: "Stuart Russell, Peter Norvig", category: "AI & ML", isbn: "978-0134610993", copies: 9, available: 5, shelf: "FL-2 / AISLE-3 / RACK-B2", desc: "The universal reference text for rational agents, heuristic search, probabilistic reasoning, and ethical AI." },
          { id: 107, title: "Computer Vision: Algorithms and Applications", author: "Richard Szeliski", category: "AI & ML", isbn: "978-3030343712", copies: 6, available: 4, shelf: "FL-2 / AISLE-3 / RACK-B3", desc: "Visual computing, structure from motion, and neural rendering." },
          { id: 108, title: "Generative Deep Learning", author: "David Foster", category: "AI & ML", isbn: "978-1098134181", copies: 4, available: 2, shelf: "FL-2 / AISLE-3 / RACK-B4", desc: "Hands-on guide to VAEs, GANs, diffusion models, and transformers." },
          { id: 109, title: "Natural Language Processing with Transformers", author: "Lewis Tunstall", category: "AI & ML", isbn: "978-1098103248", copies: 5, available: 4, shelf: "FL-2 / AISLE-3 / RACK-B5", desc: "Building language models with Hugging Face transformers." },
          { id: 110, title: "Bayesian Reasoning and Machine Learning", author: "David Barber", category: "AI & ML", isbn: "978-0521518147", copies: 4, available: 2, shelf: "FL-2 / AISLE-3 / RACK-B6", desc: "Graphical models and approximate inference algorithms." },
          { id: 111, title: "Deep Reinforcement Learning Hands-On", author: "Maxim Lapan", category: "AI & ML", isbn: "978-1838826994", copies: 4, available: 3, shelf: "FL-2 / AISLE-3 / RACK-B7", desc: "Deep Q-networks, actor-critic methods, and continuous control." },
          { id: 112, title: "Graph Representation Learning", author: "William L. Hamilton", category: "AI & ML", isbn: "978-3031015878", copies: 5, available: 3, shelf: "FL-2 / AISLE-3 / RACK-B8", desc: "Graph neural networks and geometric deep learning." }
        ],
        [
          { id: 113, title: "Deep Learning & Neural Architectures (Copy 2)", author: "Ian Goodfellow", category: "AI & ML", isbn: "978-0262035613", copies: 5, available: 3, shelf: "FL-2 / AISLE-4 / RACK-C1", desc: "Reference monograph on deep neural networks." },
          { id: 114, title: "Understanding Deep Learning", author: "Simon J.D. Prince", category: "AI & ML", isbn: "978-0262048644", copies: 5, available: 4, shelf: "FL-2 / AISLE-4 / RACK-C2", desc: "Clear mathematical and visual treatments of modern deep learning." },
          { id: 115, title: "Pattern Recognition (Copy 2)", author: "Christopher M. Bishop", category: "AI & ML", isbn: "978-0387310732", copies: 4, available: 1, shelf: "FL-2 / AISLE-4 / RACK-C3", desc: "Bayesian foundations of pattern recognition." },
          { id: 116, title: "Kernel Methods for Pattern Analysis", author: "John Shawe-Taylor", category: "AI & ML", isbn: "978-0521813976", copies: 4, available: 2, shelf: "FL-2 / AISLE-4 / RACK-C4", desc: "Support vector machines and positive definite kernels." },
          { id: 117, title: "Machine Learning: An Algorithmic Perspective", author: "Stephen Marsland", category: "AI & ML", isbn: "978-1466583283", copies: 6, available: 5, shelf: "FL-2 / AISLE-4 / RACK-C5", desc: "Algorithms and implementations in scientific Python." },
          { id: 118, title: "Neural Networks and Learning Machines", author: "Simon Haykin", category: "AI & ML", isbn: "978-0131459762", copies: 5, available: 3, shelf: "FL-2 / AISLE-4 / RACK-C6", desc: "Classic comprehensive treatise on adaptive neural systems." },
          { id: 119, title: "Deep Learning Foundations (Seminar)", author: "Stanford CS231n Faculty", category: "AI & ML", isbn: "978-0262035619", copies: 3, available: 2, shelf: "FL-2 / AISLE-4 / RACK-C7", desc: "Visual recognition and convolutional representations." },
          { id: 120, title: "Deep Learning Systems: Architecture & Design", author: "Tianqi Chen", category: "AI & ML", isbn: "978-1492095804", copies: 4, available: 3, shelf: "FL-2 / AISLE-4 / RACK-C8", desc: "GPU compiler engines and tensor compute graphs." }
        ]
      ],
      "Algorithms": [
        [
          { id: 201, title: "The Art of Computer Programming (Vol 1)", author: "Donald E. Knuth", category: "Algorithms", isbn: "978-0201896831", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-A1", desc: "Fundamental algorithms, information structures, and mathematical analysis." },
          { id: 202, title: "The Art of Computer Programming (Vol 2)", author: "Donald E. Knuth", category: "Algorithms", isbn: "978-0201896848", copies: 4, available: 3, shelf: "FL-1 / AISLE-2 / RACK-A2", desc: "Seminumerical algorithms, random numbers, and arithmetic." },
          { id: 203, title: "The Art of Computer Programming (Vol 3)", author: "Donald E. Knuth", category: "Algorithms", isbn: "978-0201896855", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-A3", desc: "Sorting and searching algorithms and optimum tree search." },
          { id: 204, title: "Algorithm Design", author: "Jon Kleinberg, Éva Tardos", category: "Algorithms", isbn: "978-0321295354", copies: 6, available: 4, shelf: "FL-1 / AISLE-2 / RACK-A4", desc: "Flow networks, NP-completeness, and approximation algorithms." },
          { id: 205, title: "The Algorithm Design Manual", author: "Steven S. Skiena", category: "Algorithms", isbn: "978-3030542559", copies: 7, available: 5, shelf: "FL-1 / AISLE-2 / RACK-A5", desc: "The hitchhiker's guide to algorithmic problem solving." },
          { id: 206, title: "Algorithms (4th Edition)", author: "Robert Sedgewick, Kevin Wayne", category: "Algorithms", isbn: "978-0321573513", copies: 8, available: 6, shelf: "FL-1 / AISLE-2 / RACK-A6", desc: "Essential data structures, searching, graph algorithms, and strings." },
          { id: 207, title: "Computational Geometry: Algorithms & Apps", author: "Mark de Berg", category: "Algorithms", isbn: "978-3540779735", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-A7", desc: "Convex hulls, Voronoi diagrams, and geometric duality." },
          { id: 208, title: "Randomized Algorithms", author: "Rajeev Motwani, Prabhakar Raghavan", category: "Algorithms", isbn: "978-0521474658", copies: 5, available: 3, shelf: "FL-1 / AISLE-2 / RACK-A8", desc: "Probabilistic analysis of algorithms and Markov chains." }
        ],
        [
          { id: 209, title: "Introduction to Algorithms (Desk Ref)", author: "Thomas H. Cormen", category: "Algorithms", isbn: "978-0262046305", copies: 8, available: 4, shelf: "FL-1 / AISLE-2 / RACK-B1", desc: "CLRS essential reference text." },
          { id: 210, title: "Introduction to Algorithms (Volume 2)", author: "Charles E. Leiserson", category: "Algorithms", isbn: "978-0262046305", copies: 8, available: 4, shelf: "FL-1 / AISLE-2 / RACK-B2", desc: "Dynamic programming and advanced data structures." },
          { id: 2, title: "Introduction to Algorithms (CLRS 4th Ed)", author: "Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest", category: "Algorithms", isbn: "978-0262046305", copies: 8, available: 4, shelf: "FL-1 / AISLE-2 / RACK-B3", desc: "Comprehensive handbook on data structures, algorithmic paradigms, dynamic programming, and computational complexity." },
          { id: 211, title: "Advanced Data Structures", author: "Peter Brass", category: "Algorithms", isbn: "978-0521880374", copies: 5, available: 3, shelf: "FL-1 / AISLE-2 / RACK-B4", desc: "Interval trees, range trees, and persistent search structures." },
          { id: 212, title: "Competitive Programmer's Handbook", author: "Antti Laaksonen", category: "Algorithms", isbn: "978-1329589711", copies: 6, available: 4, shelf: "FL-1 / AISLE-2 / RACK-B5", desc: "Techniques for contest programming and graph traversal." },
          { id: 213, title: "Guide to Competitive Programming", author: "Antti Laaksonen", category: "Algorithms", isbn: "978-3030393564", copies: 6, available: 5, shelf: "FL-1 / AISLE-2 / RACK-B6", desc: "Advanced algorithm design for ICPC and Olympiads." },
          { id: 214, title: "Algorithms Unlocked", author: "Thomas H. Cormen", category: "Algorithms", isbn: "978-0262518802", copies: 7, available: 5, shelf: "FL-1 / AISLE-2 / RACK-B7", desc: "A gentle introduction to how algorithms work." },
          { id: 215, title: "Data Structures & Algorithm Analysis", author: "Mark Allen Weiss", category: "Algorithms", isbn: "978-0132847377", copies: 6, available: 4, shelf: "FL-1 / AISLE-2 / RACK-B8", desc: "C++ implementation of classic abstract data types." }
        ],
        [
          { id: 216, title: "Graph Algorithms (3rd Ed)", author: "Robert Sedgewick", category: "Algorithms", isbn: "978-0201361216", copies: 5, available: 3, shelf: "FL-1 / AISLE-2 / RACK-C1", desc: "Shortest paths, minimum spanning trees, and maximum flows." },
          { id: 217, title: "Parameterized Algorithms", author: "Marek Cygan", category: "Algorithms", isbn: "978-3319212746", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-C2", desc: "Fixed-parameter tractability and kernelization." },
          { id: 218, title: "Approximation Algorithms", author: "Vijay V. Vazirani", category: "Algorithms", isbn: "978-3540653677", copies: 5, available: 3, shelf: "FL-1 / AISLE-2 / RACK-C3", desc: "Combinatorial approximation and semidefinite programming." },
          { id: 219, title: "Computational Complexity: A Modern Approach", author: "Sanjeev Arora, Boaz Barak", category: "Algorithms", isbn: "978-0521424264", copies: 6, available: 4, shelf: "FL-1 / AISLE-2 / RACK-C4", desc: "P vs NP, interactive proofs, and quantum computing." },
          { id: 220, title: "Introduction to Automata Theory", author: "John E. Hopcroft", category: "Algorithms", isbn: "978-0321455369", copies: 7, available: 5, shelf: "FL-1 / AISLE-2 / RACK-C5", desc: "Languages, computation, and Turing machines." },
          { id: 221, title: "Dynamic Programming and Optimal Control", author: "Dimitri P. Bertsekas", category: "Algorithms", isbn: "978-1886529434", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-C6", desc: "Markov decision processes and Bellman equation." },
          { id: 222, title: "Purely Functional Data Structures", author: "Chris Okasaki", category: "Algorithms", isbn: "978-0521663502", copies: 4, available: 3, shelf: "FL-1 / AISLE-2 / RACK-C7", desc: "Amortized persistence and lazy evaluation." },
          { id: 223, title: "Jewels of Stringology", author: "Maxime Crochemore", category: "Algorithms", isbn: "978-9810247829", copies: 4, available: 2, shelf: "FL-1 / AISLE-2 / RACK-C8", desc: "Text algorithms, suffix trees, and pattern matching." }
        ]
      ],
      "Systems": [
        [
          { id: 301, title: "Operating Systems: Three Easy Pieces", author: "Remzi H. Arpaci-Dusseau", category: "Systems", isbn: "978-1985086593", copies: 6, available: 4, shelf: "FL-3 / AISLE-1 / RACK-A1", desc: "Virtualization, concurrency, and persistence in operating systems." },
          { id: 302, title: "Modern Operating Systems (5th Ed)", author: "Andrew S. Tanenbaum", category: "Systems", isbn: "978-0137618873", copies: 7, available: 5, shelf: "FL-3 / AISLE-1 / RACK-A2", desc: "Processes, threads, memory management, and file systems." },
          { id: 303, title: "Computer Networks: A Systems Approach", author: "Larry L. Peterson, Bruce S. Davie", category: "Systems", isbn: "978-0123850591", copies: 6, available: 4, shelf: "FL-3 / AISLE-1 / RACK-A3", desc: "End-to-end network protocols, congestion control, and routing." },
          { id: 304, title: "Computer Architecture: A Quantitative Approach", author: "John L. Hennessy, David A. Patterson", category: "Systems", isbn: "978-0128119051", copies: 6, available: 3, shelf: "FL-3 / AISLE-1 / RACK-A4", desc: "Instruction-level parallelism, caches, and warehouse-scale computers." },
          { id: 305, title: "Database System Concepts (7th Ed)", author: "Abraham Silberschatz", category: "Systems", isbn: "978-0078022159", copies: 7, available: 5, shelf: "FL-3 / AISLE-1 / RACK-A5", desc: "Relational models, SQL, indexing, and transaction recovery." },
          { id: 306, title: "Database Internals", author: "Alex Petrov", category: "Systems", isbn: "978-1492040347", copies: 5, available: 3, shelf: "FL-3 / AISLE-1 / RACK-A6", desc: "Storage engines, B-trees, LSM-trees, and distributed consensus." },
          { id: 307, title: "Distributed Systems: Principles & Paradigms", author: "Andrew S. Tanenbaum, Maarten van Steen", category: "Systems", isbn: "978-1543057386", copies: 6, available: 4, shelf: "FL-3 / AISLE-1 / RACK-A7", desc: "Architectures, synchronization, replication, and fault tolerance." },
          { id: 308, title: "TCP/IP Illustrated (Volume 1)", author: "W. Richard Stevens", category: "Systems", isbn: "978-0321336316", copies: 5, available: 3, shelf: "FL-3 / AISLE-1 / RACK-A8", desc: "The definitive analysis of internet protocols." }
        ],
        [
          { id: 5, title: "Computer Systems: A Programmer's Perspective", author: "Randal E. Bryant, David R. O'Hallaron", category: "Systems", isbn: "978-0134092669", copies: 7, available: 5, shelf: "FL-3 / AISLE-2 / RACK-B1", desc: "Deep dive into hardware architecture, processor pipelines, virtual memory, linking, and system-level I/O." },
          { id: 309, title: "Advanced Programming in the UNIX Environment", author: "W. Richard Stevens", category: "Systems", isbn: "978-0321637734", copies: 6, available: 4, shelf: "FL-3 / AISLE-2 / RACK-B2", desc: "Files, directories, signals, process control, and IPC." },
          { id: 310, title: "Linux Kernel Development (3rd Ed)", author: "Robert Love", category: "Systems", isbn: "978-0672329463", copies: 5, available: 3, shelf: "FL-3 / AISLE-2 / RACK-B3", desc: "Process scheduler, interrupt handlers, and kernel locking." },
          { id: 311, title: "The Linux Programming Interface", author: "Michael Kerrisk", category: "Systems", isbn: "978-1593272203", copies: 6, available: 4, shelf: "FL-3 / AISLE-2 / RACK-B4", desc: "System calls, epoll, multithreading, and network sockets." },
          { id: 312, title: "Understanding the Linux Kernel", author: "Daniel P. Bovet", category: "Systems", isbn: "978-0596005658", copies: 5, available: 3, shelf: "FL-3 / AISLE-2 / RACK-B5", desc: "Memory addressing, kernel synchronization, and swapping." },
          { id: 313, title: "UNIX Network Programming (Vol 1)", author: "W. Richard Stevens", category: "Systems", isbn: "978-0131411555", copies: 5, available: 3, shelf: "FL-3 / AISLE-2 / RACK-B6", desc: "Sockets API and XTI network engineering." },
          { id: 314, title: "Systems Performance: Enterprise & Cloud", author: "Brendan Gregg", category: "Systems", isbn: "978-0136820154", copies: 6, available: 4, shelf: "FL-3 / AISLE-2 / RACK-B7", desc: "BPF tracing, CPU profiling, and memory latency tuning." },
          { id: 315, title: "BPF Performance Tools", author: "Brendan Gregg", category: "Systems", isbn: "978-0136554820", copies: 5, available: 3, shelf: "FL-3 / AISLE-2 / RACK-B8", desc: "Linux system analysis with eBPF tracing." }
        ],
        [
          { id: 316, title: "Designing Distributed Systems", author: "Brendan Burns", category: "Systems", isbn: "978-1491983645", copies: 5, available: 3, shelf: "FL-3 / AISLE-1 / RACK-C1", desc: "Sidecar patterns and multi-container architectures." },
          { id: 3, title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", category: "Systems", isbn: "978-1449373320", copies: 6, available: 2, shelf: "FL-3 / AISLE-1 / RACK-C2", desc: "The big ideas behind reliable, scalable, and maintainable distributed data systems, consensus algorithms, and replication." },
          { id: 317, title: "Building Microservices (2nd Ed)", author: "Sam Newman", category: "Systems", isbn: "978-1492034025", copies: 6, available: 4, shelf: "FL-3 / AISLE-1 / RACK-C3", desc: "Decomposition, integration, split databases, and resilience." },
          { id: 318, title: "Cloud Native Patterns", author: "Cornelia Davis", category: "Systems", isbn: "978-1617294297", copies: 5, available: 3, shelf: "FL-3 / AISLE-1 / RACK-C4", desc: "Microservices, event-driven architectures, and stateless services." },
          { id: 11, title: "Site Reliability Engineering", author: "Betsy Beyer, Chris Jones, Jennifer Petoff", category: "Systems", isbn: "978-1491929124", copies: 5, available: 4, shelf: "FL-3 / AISLE-1 / RACK-C5", desc: "How production cloud software is built, monitored, and scaled with SLOs, automated incident response, and resilience." },
          { id: 319, title: "The Site Reliability Workbook", author: "Betsy Beyer", category: "Systems", isbn: "978-1492029502", copies: 5, available: 4, shelf: "FL-3 / AISLE-1 / RACK-C6", desc: "Practical SRE implementations and incident response runbooks." },
          { id: 320, title: "Kubernetes: Up and Running", author: "Brendan Burns, Joe Beda", category: "Systems", isbn: "978-1098110208", copies: 6, available: 4, shelf: "FL-3 / AISLE-1 / RACK-C7", desc: "Container orchestration, ingress, and declarative deployment." },
          { id: 321, title: "Production-Ready Microservices", author: "Susan J. Fowler", category: "Systems", isbn: "978-1491965979", copies: 5, available: 3, shelf: "FL-3 / AISLE-1 / RACK-C8", desc: "Scalability, fault tolerance, and observability standards." }
        ]
      ],
      "Mathematics": [
        [
          { id: 401, title: "Calculus: Early Transcendentals", author: "James Stewart", category: "Mathematics", isbn: "978-1285741550", copies: 7, available: 5, shelf: "FL-1 / AISLE-5 / RACK-A1", desc: "Functions, limits, multivariable derivatives, and Stokes' theorem." },
          { id: 402, title: "Calculus on Manifolds", author: "Michael Spivak", category: "Mathematics", isbn: "978-0805390216", copies: 4, available: 2, shelf: "FL-1 / AISLE-5 / RACK-A2", desc: "Differential forms and integration on manifolds in Euclidean space." },
          { id: 403, title: "Convex Optimization", author: "Stephen Boyd, Lieven Vandenberghe", category: "Mathematics", isbn: "978-0521833783", copies: 6, available: 4, shelf: "FL-1 / AISLE-5 / RACK-A3", desc: "Convex sets, duality, KKT conditions, and interior-point methods." },
          { id: 404, title: "Numerical Linear Algebra", author: "Lloyd N. Trefethen, David Bau III", category: "Mathematics", isbn: "978-0898713619", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-A4", desc: "QR factorization, SVD, GMRES, and condition numbers." },
          { id: 405, title: "Matrix Analysis (2nd Ed)", author: "Roger A. Horn, Charles R. Johnson", category: "Mathematics", isbn: "978-0521548236", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-A5", desc: "Eigenvalue inequalities, norms, and unitary equivalence." },
          { id: 406, title: "Introduction to Applied Linear Algebra", author: "Stephen Boyd, Lieven Vandenberghe", category: "Mathematics", isbn: "978-1316518960", copies: 6, available: 5, shelf: "FL-1 / AISLE-5 / RACK-A6", desc: "Vectors, matrices, and least squares in engineering." },
          { id: 407, title: "Linear Algebra and Its Applications", author: "Gilbert Strang", category: "Mathematics", isbn: "978-0030105678", copies: 7, available: 5, shelf: "FL-1 / AISLE-5 / RACK-A7", desc: "Four fundamental subspaces and singular value decomposition." },
          { id: 408, title: "Matrix Computations (4th Ed)", author: "Gene H. Golub, Charles F. Van Loan", category: "Mathematics", isbn: "978-1421407944", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-A8", desc: "Direct and iterative solvers for massive linear systems." }
        ],
        [
          { id: 409, title: "Principles of Mathematical Analysis", author: "Walter Rudin", category: "Mathematics", isbn: "978-0070542358", copies: 6, available: 4, shelf: "FL-1 / AISLE-5 / RACK-B1", desc: "Real and complex number systems, metric topology, and Riemann-Stieltjes integrals." },
          { id: 410, title: "Real Analysis: Modern Techniques", author: "Gerald B. Folland", category: "Mathematics", isbn: "978-0471317166", copies: 4, available: 2, shelf: "FL-1 / AISLE-5 / RACK-B2", desc: "Lebesgue measure, Lp spaces, and Radon-Nikodym derivatives." },
          { id: 411, title: "Complex Analysis", author: "Lars Ahlfors", category: "Mathematics", isbn: "978-0070006577", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-B3", desc: "Holomorphic functions, Cauchy's integral formula, and residue theorem." },
          { id: 412, title: "Topology (2nd Ed)", author: "James Munkres", category: "Mathematics", isbn: "978-0131816299", copies: 6, available: 4, shelf: "FL-1 / AISLE-5 / RACK-B4", desc: "Topological spaces, compactness, connectedness, and fundamental group." },
          { id: 413, title: "Abstract Algebra (3rd Ed)", author: "David S. Dummit, Richard M. Foote", category: "Mathematics", isbn: "978-0471433347", copies: 6, available: 4, shelf: "FL-1 / AISLE-5 / RACK-B5", desc: "Groups, rings, modules, Galois theory, and commutative algebra." },
          { id: 414, title: "Discrete Mathematics & Its Applications", author: "Kenneth H. Rosen", category: "Mathematics", isbn: "978-1259676512", copies: 8, available: 6, shelf: "FL-1 / AISLE-5 / RACK-B6", desc: "Combinatorics, graph theory, propositional logic, and induction." },
          { id: 415, title: "Concrete Mathematics", author: "Ronald L. Graham, Donald E. Knuth, Oren Patashnik", category: "Mathematics", isbn: "978-0201558029", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-B7", desc: "Recurrences, binomial coefficients, generating functions, and asymptotic methods." },
          { id: 416, title: "Introductory Functional Analysis", author: "Erwin Kreyszig", category: "Mathematics", isbn: "978-0471504597", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-B8", desc: "Banach and Hilbert spaces, linear operators, and spectral theory." }
        ],
        [
          { id: 10, title: "Probability and Statistics for Engineering", author: "Jay L. Devore", category: "Mathematics", isbn: "978-1305251809", copies: 8, available: 6, shelf: "FL-1 / AISLE-5 / RACK-D1", desc: "Rigorous statistical analysis, hypothesis testing, random variables, regression, and Bayesian methods." },
          { id: 417, title: "Introduction to Probability (2nd Ed)", author: "Dimitri P. Bertsekas, John N. Tsitsiklis", category: "Mathematics", isbn: "978-1886529236", copies: 7, available: 5, shelf: "FL-1 / AISLE-5 / RACK-D2", desc: "Conditioning, Bayes rule, Poisson processes, and limit theorems." },
          { id: 418, title: "A First Course in Probability", author: "Sheldon Ross", category: "Mathematics", isbn: "978-0134753119", copies: 8, available: 6, shelf: "FL-1 / AISLE-5 / RACK-D3", desc: "Combinatorial analysis, axioms of probability, and continuous distributions." },
          { id: 6, title: "Linear Algebra Done Right", author: "Sheldon Axler", category: "Mathematics", isbn: "978-3319110790", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-D4", desc: "Determinant-free approach to finite-dimensional vector spaces, linear operators, and spectral theory." },
          { id: 419, title: "Probability and Random Processes", author: "Geoffrey Grimmett, David Stirzaker", category: "Mathematics", isbn: "978-0198847595", copies: 5, available: 3, shelf: "FL-1 / AISLE-5 / RACK-D5", desc: "Markov chains, stationary processes, and martingales." },
          { id: 420, title: "Measure Theory and Probability", author: "Malcolm Adams, Victor Guillemin", category: "Mathematics", isbn: "978-0817638849", copies: 4, available: 2, shelf: "FL-1 / AISLE-5 / RACK-D6", desc: "Integration on measure spaces and law of large numbers." },
          { id: 421, title: "High-Dimensional Probability", author: "Roman Vershynin", category: "Mathematics", isbn: "978-1108415194", copies: 5, available: 4, shelf: "FL-1 / AISLE-5 / RACK-D7", desc: "Non-asymptotic theory of random matrices and geometric functional analysis." },
          { id: 422, title: "Statistical Inference", author: "George Casella, Roger L. Berger", category: "Mathematics", isbn: "978-0534243128", copies: 6, available: 4, shelf: "FL-1 / AISLE-5 / RACK-D8", desc: "Likelihood, Neyman-Pearson lemma, and Bayesian decision theory." }
        ]
      ],
      "Physics": [
        [
          { id: 501, title: "The Feynman Lectures on Physics (Vol 1)", author: "Richard P. Feynman", category: "Physics", isbn: "978-0465024933", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-A1", desc: "Mechanics, radiation, heat, and relativistic dynamics." },
          { id: 7, title: "Quantum Computation and Quantum Information", author: "Michael A. Nielsen, Isaac L. Chuang", category: "Physics", isbn: "978-1107002173", copies: 3, available: 2, shelf: "FL-4 / AISLE-1 / RACK-A2", desc: "The standard academic reference for qubits, quantum circuits, Shor's algorithm, and quantum teleportation." },
          { id: 502, title: "The Feynman Lectures on Physics (Vol 2)", author: "Richard P. Feynman", category: "Physics", isbn: "978-0465024940", copies: 6, available: 5, shelf: "FL-4 / AISLE-1 / RACK-A3", desc: "Electromagnetism, electrodynamics, and matter." },
          { id: 503, title: "The Feynman Lectures on Physics (Vol 3)", author: "Richard P. Feynman", category: "Physics", isbn: "978-0465024957", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-A4", desc: "Quantum mechanics, amplitudes, and spin systems." },
          { id: 504, title: "Principles of Quantum Mechanics (2nd Ed)", author: "R. Shankar", category: "Physics", isbn: "978-0306447907", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-A5", desc: "Dirac bra-ket notation, harmonic oscillator, and perturbation theory." },
          { id: 505, title: "Modern Quantum Mechanics (3rd Ed)", author: "J. J. Sakurai, Jim Napolitano", category: "Physics", isbn: "978-1108473224", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-A6", desc: "Symmetries, angular momentum, density matrices, and identical particles." },
          { id: 506, title: "Quantum Mechanics: Concepts & Apps", author: "Nouredine Zettili", category: "Physics", isbn: "978-0470026793", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-A7", desc: "Detailed step-by-step solutions to quantum problems." },
          { id: 507, title: "Introduction to Quantum Mechanics", author: "David J. Griffiths", category: "Physics", isbn: "978-1107189638", copies: 7, available: 5, shelf: "FL-4 / AISLE-1 / RACK-A8", desc: "Schrödinger equation, bound states, and hydrogen atom." }
        ],
        [
          { id: 508, title: "Classical Mechanics (3rd Ed)", author: "Herbert Goldstein", category: "Physics", isbn: "978-0201657029", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-B1", desc: "Lagrangian dynamics, Hamilton-Jacobi theory, and Poisson brackets." },
          { id: 509, title: "Introduction to Electrodynamics (4th Ed)", author: "David J. Griffiths", category: "Physics", isbn: "978-1108420419", copies: 7, available: 5, shelf: "FL-4 / AISLE-1 / RACK-B2", desc: "Electrostatics, vector potential, Maxwell equations, and radiation." },
          { id: 510, title: "Classical Electrodynamics (3rd Ed)", author: "John David Jackson", category: "Physics", isbn: "978-0471309321", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-B3", desc: "Boundary-value problems in electrostatics and relativistic kinematics." },
          { id: 511, title: "Thermal Physics (2nd Ed)", author: "Charles Kittel, Herbert Kroemer", category: "Physics", isbn: "978-0716710882", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-B4", desc: "Gibbs free energy, chemical potential, and Fermi gases." },
          { id: 512, title: "An Introduction to Thermal Physics", author: "Daniel V. Schroeder", category: "Physics", isbn: "978-0199595044", copies: 7, available: 5, shelf: "FL-4 / AISLE-1 / RACK-B5", desc: "Equipartition theorem, heat engines, and partition functions." },
          { id: 513, title: "Statistical Mechanics (3rd Ed)", author: "R. K. Pathria, Paul D. Beale", category: "Physics", isbn: "978-0123821881", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-B6", desc: "Microcanonical and canonical ensembles, Bose-Einstein condensation." },
          { id: 514, title: "Introduction to Solid State Physics", author: "Charles Kittel", category: "Physics", isbn: "978-0471415268", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-B7", desc: "Crystal lattices, phonon vibrations, and energy bands." },
          { id: 515, title: "Solid State Physics", author: "Neil W. Ashcroft, N. David Mermin", category: "Physics", isbn: "978-0030839931", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-B8", desc: "Drude and Sommerfeld models, Bloch electrons, and semiconductors." }
        ],
        [
          { id: 516, title: "Spacetime and Geometry", author: "Sean M. Carroll", category: "Physics", isbn: "978-1108488396", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-C1", desc: "General relativity, Riemann curvature, and Schwarzschild metric." },
          { id: 517, title: "Gravitation", author: "Charles W. Misner, Kip S. Thorne, John A. Wheeler", category: "Physics", isbn: "978-0691177793", copies: 4, available: 2, shelf: "FL-4 / AISLE-1 / RACK-C2", desc: "The monumental reference on Einstein gravity and geometrodynamics." },
          { id: 518, title: "Quantum Field Theory in a Nutshell", author: "A. Zee", category: "Physics", isbn: "978-0691140346", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-C3", desc: "Path integrals, Feynman diagrams, and gauge theories." },
          { id: 519, title: "An Introduction to Quantum Field Theory", author: "Michael E. Peskin, Daniel V. Schroeder", category: "Physics", isbn: "978-0201503975", copies: 4, available: 2, shelf: "FL-4 / AISLE-1 / RACK-C4", desc: "Renormalization, quantum electrodynamics, and spontaneous symmetry breaking." },
          { id: 520, title: "Optics (5th Ed)", author: "Eugene Hecht", category: "Physics", isbn: "978-0133977226", copies: 6, available: 4, shelf: "FL-4 / AISLE-1 / RACK-C5", desc: "Wave motion, interference, diffraction, and Fourier optics." },
          { id: 521, title: "Quantum Optics", author: "Marlan O. Scully, M. Suhail Zubairy", category: "Physics", isbn: "978-0521435956", copies: 4, available: 2, shelf: "FL-4 / AISLE-1 / RACK-C6", desc: "Coherent states, Jaynes-Cummings model, and laser theory." },
          { id: 522, title: "Concepts in Thermal Physics", author: "Stephen J. Blundell", category: "Physics", isbn: "978-0199562107", copies: 5, available: 3, shelf: "FL-4 / AISLE-1 / RACK-C7", desc: "Kinetic theory, transport properties, and blackbody radiation." },
          { id: 523, title: "Introduction to Elementary Particles", author: "David J. Griffiths", category: "Physics", isbn: "978-3527406012", copies: 5, available: 4, shelf: "FL-4 / AISLE-1 / RACK-C8", desc: "Standard Model, quarks, leptons, and weak interactions." }
        ]
      ],
      "Security": [
        [
          { id: 601, title: "The Web Application Hacker's Handbook", author: "Dafydd Stuttard, Marcus Pinto", category: "Security", isbn: "978-1118026472", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-A1", desc: "Finding and exploiting security flaws in web architectures." },
          { id: 602, title: "Practical Malware Analysis", author: "Michael Sikorski, Andrew Honig", category: "Security", isbn: "978-1593272906", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-A2", desc: "Dissecting malicious binaries using IDA Pro and x64dbg." },
          { id: 603, title: "Security Engineering (3rd Ed)", author: "Ross Anderson", category: "Security", isbn: "978-1119642787", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-A3", desc: "Building dependable distributed systems and protocol vulnerabilities." },
          { id: 604, title: "Applied Cryptography", author: "Bruce Schneier", category: "Security", isbn: "978-1119096726", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-A4", desc: "Protocols, algorithms, and source code in C." },
          { id: 605, title: "Cryptography Engineering", author: "Niels Ferguson, Bruce Schneier", category: "Security", isbn: "978-0470474242", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-A5", desc: "Practical cryptographic design and implementation pitfalls." },
          { id: 606, title: "Serious Cryptography", author: "Jean-Philippe Aumasson", category: "Security", isbn: "978-1593278267", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-A6", desc: "Modern guide to hash functions, ciphers, and post-quantum crypto." },
          { id: 607, title: "A Graduate Course in Applied Cryptography", author: "Dan Boneh, Victor Shoup", category: "Security", isbn: "978-1107185012", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-A7", desc: "Provable security, authenticated encryption, and pairings." },
          { id: 608, title: "Understanding Cryptography", author: "Christof Paar, Jan Pelzl", category: "Security", isbn: "978-3642041006", copies: 6, available: 5, shelf: "FL-3 / AISLE-3 / RACK-A8", desc: "Textbook on public-key and symmetric cryptography." }
        ],
        [
          { id: 609, title: "Hacking: The Art of Exploitation", author: "Jon Erickson", category: "Security", isbn: "978-1593271442", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-B1", desc: "Stack buffer overflows, shellcode, and format string vulnerabilities." },
          { id: 610, title: "The Shellcoder's Handbook", author: "Chris Anley, John Heasman", category: "Security", isbn: "978-0470080238", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-B2", desc: "Discovering and exploiting security holes in binary executables." },
          { id: 611, title: "Windows Internals (Part 1, 7th Ed)", author: "Pavel Yosifovich, Mark Russinovich", category: "Security", isbn: "978-0135462409", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-B3", desc: "Processes, thread scheduling, security descriptors, and tokens." },
          { id: 612, title: "Windows Internals (Part 2, 7th Ed)", author: "Andrea Allievi, Mark Russinovich", category: "Security", isbn: "978-0135462416", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-B4", desc: "I/O system, storage, memory management, and crash dumps." },
          { id: 613, title: "Rootkits and Bootkits", author: "Alex Matrosov, Eugene Rodionov", category: "Security", isbn: "978-1593277161", copies: 4, available: 2, shelf: "FL-3 / AISLE-3 / RACK-B5", desc: "Reversing modern malware and subverting the OS kernel." },
          { id: 614, title: "Blue Team Handbook: Incident Response", author: "Don Murdoch", category: "Security", isbn: "978-1500734756", copies: 7, available: 5, shelf: "FL-3 / AISLE-3 / RACK-B6", desc: "Triage, memory forensics, and intrusion containment." },
          { id: 615, title: "Network Security Essentials", author: "William Stallings", category: "Security", isbn: "978-0134527338", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-B7", desc: "IPsec, TLS, wireless LAN security, and firewalls." },
          { id: 616, title: "Threat Modeling: Designing for Security", author: "Adam Shostack", category: "Security", isbn: "978-1118809990", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-B8", desc: "STRIDE framework and architectural threat mitigations." }
        ],
        [
          { id: 8, title: "Cryptography and Network Security", author: "William Stallings", category: "Security", isbn: "978-0134444284", copies: 6, available: 0, shelf: "FL-3 / AISLE-3 / RACK-E1", desc: "Modern cryptographic algorithms, public-key infrastructure, AES, RSA, zero-knowledge proofs, and secure protocols." },
          { id: 617, title: "Practical Reverse Engineering", author: "Bruce Dang, Alexandre Gazet", category: "Security", isbn: "978-1118787311", copies: 5, available: 3, shelf: "FL-3 / AISLE-3 / RACK-E2", desc: "x86, x64, ARM, Windows kernel, and obfuscation defense." },
          { id: 618, title: "Gray Hat Hacking (6th Ed)", author: "Allen Harper, Ryan Linn", category: "Security", isbn: "978-1260461459", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-E3", desc: "Ethical hacking, heap exploitation, and cloud penetration testing." },
          { id: 619, title: "Fuzzing for Software Security Testing", author: "Michael Sutton", category: "Security", isbn: "978-0321446114", copies: 4, available: 2, shelf: "FL-3 / AISLE-3 / RACK-E4", desc: "Automated vulnerability finding and protocol mutation." },
          { id: 620, title: "The Hardware Hacker", author: "Andrew 'bunnie' Huang", category: "Security", isbn: "978-1593277581", copies: 5, available: 4, shelf: "FL-3 / AISLE-3 / RACK-E5", desc: "PCB reverse engineering and silicon manufacturing." },
          { id: 621, title: "Hardware Security: Design & Verification", author: "Swarup Bhunia", category: "Security", isbn: "978-0128124772", copies: 4, available: 3, shelf: "FL-3 / AISLE-3 / RACK-E6", desc: "Hardware Trojans, side-channel attacks, and physical unclonable functions." },
          { id: 622, title: "Zero Trust Networks", author: "Evan Gilman, Doug Barth", category: "Security", isbn: "978-1491962190", copies: 6, available: 4, shelf: "FL-3 / AISLE-3 / RACK-E7", desc: "Identity-aware proxies, mutual TLS, and perimeters." },
          { id: 623, title: "Site Reliability Engineering: Security", author: "Heather Adkins, Betsy Beyer", category: "Security", isbn: "978-1492022459", copies: 5, available: 4, shelf: "FL-3 / AISLE-3 / RACK-E8", desc: "Building secure and reliable systems at cloud scale." }
        ]
      ]
    };

    const catTiers = masterCatalog[cat.name] || masterCatalog["AI & ML"];
    const tierData = catTiers[tierIdx] || catTiers[0];

    let catalogList = [];
    if (typeof SmartLibState !== 'undefined' && typeof SmartLibState.getBooks === 'function') {
      try {
        catalogList = SmartLibState.getBooks() || [];
      } catch (e) {
        catalogList = [];
      }
    }

    return tierData.map((b, idx) => {
      const live = catalogList.find(c => c && (c.id === b.id || c.shelf === b.shelf));
      const merged = live ? Object.assign({}, b, live) : Object.assign({}, b);
      if (!merged.shelf) {
        merged.shelf = `${cat.code} / ${rackLetter}${idx + 1}`;
      }
      return merged;
    });
  }

  // ==========================================
  // 5. GRAND ACADEMIC BOOKSHELVES (Left Wing)
  // WITH PHYSICAL 3D SHELF LOCALIZATION (60 FPS)
  // ==========================================

  buildBookshelfAisles() {
    const categories = [
      { name: "AI & ML", color: 0x38BDF8, x: -14, z: -18, code: "FL-2 / AISLE-4", count: 86, racks: ['RACK A', 'RACK B', 'RACK C'] },
      { name: "Algorithms", color: 0xE8D8C4, x: -14, z: -10, code: "FL-1 / AISLE-2", count: 74, racks: ['RACK A', 'RACK B', 'RACK C'] },
      { name: "Systems", color: 0x38BDF8, x: -14, z: -2, code: "FL-3 / AISLE-1", count: 92, racks: ['RACK A', 'RACK B', 'RACK C'] },
      { name: "Mathematics", color: 0x38BDF8, x: -14, z: 6, code: "FL-1 / AISLE-5", count: 68, racks: ['RACK A', 'RACK B', 'RACK D'] },
      { name: "Physics", color: 0xA78BFA, x: -14, z: 14, code: "FL-4 / AISLE-1", count: 58, racks: ['RACK A', 'RACK B', 'RACK C'] },
      { name: "Security", color: 0xFF5A5F, x: -14, z: 22, code: "FL-3 / AISLE-3", count: 64, racks: ['RACK A', 'RACK B', 'RACK E'] }
    ];

    const woodTex = this.createWoodTexture();
    const woodMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x4A1B28,
      roughness: 0.42,
      metalness: 0.14
    });
    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.88,
      roughness: 0.22
    });

    // Spine jewel colors
    const spineColors = [
      new THREE.Color(0x8B1E3F),
      new THREE.Color(0x1E40AF),
      new THREE.Color(0x166534),
      new THREE.Color(0x92400E),
      new THREE.Color(0x6B21A8),
      new THREE.Color(0xB45309),
      new THREE.Color(0x155E75),
      new THREE.Color(0x561C24)
    ];

    // Shared geometry for background instanced books
    const bookGeo = new THREE.BoxGeometry(0.28, 1.05, 1.15);
    const ribGeo = new THREE.BoxGeometry(0.29, 0.04, 1.17);

    categories.forEach(cat => {
      const shelfGroup = new THREE.Group();
      shelfGroup.position.set(cat.x, 3.8, cat.z);

      // Main mahogany architectural bookcase carcass (Interactive Raycast target)
      const frameMat = woodMat.clone();
      const frame = new THREE.Mesh(new THREE.BoxGeometry(6.6, 7.6, 2.2), frameMat);
      frame.castShadow = true;
      frame.receiveShadow = true;
      shelfGroup.add(frame);

      // Gold cornice trim on top & plinth base
      const cornice = new THREE.Mesh(new THREE.BoxGeometry(6.7, 0.35, 2.0), goldTrimMat);
      cornice.position.y = 3.95;
      shelfGroup.add(cornice);

      // Visible category signage top arch pediment
      const archBeam = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.45, 0.35), woodMat);
      archBeam.position.set(0, 4.35, 0.85);
      shelfGroup.add(archBeam);

      const archFillet = new THREE.Mesh(new THREE.BoxGeometry(6.65, 0.08, 0.38), goldTrimMat);
      archFillet.position.set(0, 4.58, 0.85);
      shelfGroup.add(archFillet);

      const plinth = new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.4, 1.95), goldTrimMat);
      plinth.position.y = -3.75;
      shelfGroup.add(plinth);

      // 4 Internal wooden shelf planks
      for (let s = -2.2; s <= 2.2; s += 1.45) {
        const shelfPlank = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.12, 1.6), woodMat);
        shelfPlank.position.y = s;
        shelfGroup.add(shelfPlank);
      }

      // Shelf tiers for books: Top (0.7), Middle (-0.75), Bottom (-2.2)
      const shelfLevels = [0.7, -0.75, -2.2];

      // 1. PHYSICAL 3D SHELF LOCALIZATION: INDIVIDUAL INTERACTIVE BOOK MESHES
      shelfLevels.forEach((s, tierIdx) => {
        const tierName = (cat.racks && cat.racks[tierIdx]) ? cat.racks[tierIdx] : `RACK ${String.fromCharCode(65 + tierIdx)}`;
        
        // Polished Brass Rack Nameplate mounted on front edge of each shelf tier
        const plateTex = this.createRackPlateTexture(tierName);
        const plateMat = new THREE.MeshStandardMaterial({
          map: plateTex,
          roughness: 0.25,
          metalness: 0.82
        });
        const plateMesh = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.22, 0.05), plateMat);
        plateMesh.position.set(0, s + 0.02, 0.83);
        shelfGroup.add(plateMesh);

        // Curated tier books linked to academic catalog in INITIAL_BOOKS
        const tierBooks = this.getShelfTierBooks(cat, tierIdx);
        const booksCount = tierBooks.length;

        tierBooks.forEach((bookData, b) => {
          const bWidth = 0.25 + (b % 3 === 0 ? 0.05 : (b % 2 === 0 ? -0.03 : 0.01));
          const bHeight = 1.05 + (Math.sin(b * 2.3 + tierIdx) * 0.09);
          const bDepth = 1.08;

          // Compute X along tier (spaced between -2.25 and +2.25)
          const bx = -2.25 + (b * (4.5 / Math.max(1, booksCount - 1)));
          const by = s + (bHeight * 0.5) + 0.06;
          const bz = 0.22;

          const spineColor = spineColors[(b + tierIdx * 3 + Math.abs(Math.floor(cat.z))) % spineColors.length];
          const bookMat = new THREE.MeshStandardMaterial({
            color: spineColor,
            roughness: 0.35,
            metalness: 0.16
          });

          const bookMesh = new THREE.Mesh(new THREE.BoxGeometry(bWidth, bHeight, bDepth), bookMat);
          bookMesh.castShadow = true;
          bookMesh.receiveShadow = true;
          bookMesh.position.set(bx, by, bz);

          // Embossed Gold Spine Rib Accents
          const ribTop = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.01, 0.035, 0.06), goldTrimMat);
          ribTop.position.set(0, bHeight * 0.32, (bDepth * 0.5) + 0.01);
          bookMesh.add(ribTop);

          const ribBot = new THREE.Mesh(new THREE.BoxGeometry(bWidth + 0.01, 0.035, 0.06), goldTrimMat);
          ribBot.position.set(0, -bHeight * 0.32, (bDepth * 0.5) + 0.01);
          bookMesh.add(ribBot);

          // Top pages block trim
          const pageTrim = new THREE.Mesh(
            new THREE.BoxGeometry(bWidth - 0.02, 0.02, bDepth - 0.04),
            new THREE.MeshStandardMaterial({ color: 0xFDF8EE, roughness: 0.85 })
          );
          pageTrim.position.set(0, (bHeight * 0.5) + 0.005, -0.01);
          bookMesh.add(pageTrim);

          // Book interaction metadata for raycasting & extraction animation
          bookMesh.userData = {
            type: 'shelfBook',
            book: bookData,
            shelfCategory: cat.name,
            shelfCode: cat.code,
            shelfGroup: shelfGroup,
            originalPos: bookMesh.position.clone(),
            extractedPos: new THREE.Vector3(bx, by, bz + 0.42),
            extractProgress: 0,
            isExtracted: false,
            isExtracting: false,
            isRetracting: false,
            originalEmissive: 0x000000,
            originalEmissiveIntensity: 0
          };

          shelfGroup.add(bookMesh);
          this.interactiveObjects.push(bookMesh);
          this.shelfBookMeshes.push(bookMesh);
        });
      });

      // 2. HIGH PERFORMANCE INSTANCED BOOK ROWS (Deep mahogany background filler)
      const booksPerRow = 16;
      const totalBooks = shelfLevels.length * booksPerRow;

      const instancedBooks = new THREE.InstancedMesh(
        bookGeo,
        new THREE.MeshStandardMaterial({ roughness: 0.38, metalness: 0.16 }),
        totalBooks
      );
      const instancedRibs = new THREE.InstancedMesh(
        ribGeo,
        goldTrimMat,
        totalBooks
      );

      const dummy = new THREE.Object3D();
      let bookIdx = 0;

      shelfLevels.forEach(s => {
        for (let b = 0; b < booksPerRow; b++) {
          const bx = -2.55 + (b * 0.34);
          const bScaleY = 0.85 + (Math.sin(b * 3.7 + s) * 0.15);
          const bRotZ = (b % 7 === 0) ? 0.08 : ((b % 5 === 0) ? -0.06 : 0);

          dummy.position.set(bx, s + (bScaleY * 0.52) + 0.06, -0.45);
          dummy.rotation.set(0, 0, bRotZ);
          dummy.scale.set(1, bScaleY, 0.65);
          dummy.updateMatrix();

          instancedBooks.setMatrixAt(bookIdx, dummy.matrix);

          // Assign jewel spine color
          const color = spineColors[(b + Math.abs(Math.floor(s * 10))) % spineColors.length];
          instancedBooks.setColorAt(bookIdx, color);

          // Gold rib band
          dummy.position.set(bx, s + (bScaleY * 0.72), -0.45);
          dummy.scale.set(1, 1, 0.65);
          dummy.updateMatrix();
          instancedRibs.setMatrixAt(bookIdx, dummy.matrix);

          bookIdx++;
        }
      });

      instancedBooks.instanceMatrix.needsUpdate = true;
      if (instancedBooks.instanceColor) instancedBooks.instanceColor.needsUpdate = true;
      instancedRibs.instanceMatrix.needsUpdate = true;

      shelfGroup.add(instancedBooks);
      shelfGroup.add(instancedRibs);

      // Featured book on pull-out display lectern
      const lectern = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.1, 0.9), woodMat);
      lectern.position.set(0, 0.1, 1.2);
      lectern.rotation.x = 0.3;
      shelfGroup.add(lectern);

      const featBook = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 0.15, 0.8),
        new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.28, metalness: 0.55 })
      );
      featBook.position.set(0, 0.22, 1.2);
      featBook.rotation.x = 0.3;
      shelfGroup.add(featBook);

      // Glowing Frosted Glass Category Signboard on top
      const signTex = this.createSignTexture(cat.name, cat.color);
      const signGeo = new THREE.PlaneGeometry(5.2, 1.3);
      const signMat = new THREE.MeshBasicMaterial({
        map: signTex,
        transparent: true,
        opacity: 0.95
      });
      const signFront = new THREE.Mesh(signGeo, signMat);
      signFront.position.set(0, 4.8, 0.92);
      shelfGroup.add(signFront);

      const signBack = new THREE.Mesh(signGeo, signMat);
      signBack.position.set(0, 4.8, -0.92);
      signBack.rotation.y = Math.PI;
      shelfGroup.add(signBack);

      // Rotating 3D Holographic Beacon Diamond above the shelf
      const beaconGeo = new THREE.OctahedronGeometry(0.35, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: cat.color,
        emissive: cat.color,
        emissiveIntensity: 0.8,
        roughness: 0.2,
        metalness: 0.8
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(0, 5.8, 0);
      shelfGroup.add(beacon);

      // Interactive metadata for raycasting
      shelfGroup.userData = {
        type: 'bookshelf',
        category: cat.name,
        colorHex: cat.color,
        code: cat.code,
        count: cat.count,
        group: shelfGroup,
        frameMesh: frame,
        beacon: beacon
      };
      frame.userData = shelfGroup.userData;

      this.interactiveObjects.push(frame);
      this.shelfMeshes.push(shelfGroup);
      this.shelfBanners.push(beacon);
      this.scene.add(shelfGroup);
    });
  }

  // ==========================================
  // 6. STUDY DESKS WITH GLOWING BANKER LAMPS
  // ==========================================

  buildStudyDesks() {
    // 24 Desks in 3 distinct zones
    const zones = [
      { name: "Silent", prefix: "S", x: 7, count: 8 },
      { name: "Collab", prefix: "C", x: 14, count: 8 },
      { name: "Window", prefix: "W", x: 21, count: 8 }
    ];

    const woodTopMat = new THREE.MeshStandardMaterial({
      color: 0x38141F,
      roughness: 0.32,
      metalness: 0.15
    });
    const brassMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.88,
      roughness: 0.22
    });
    const chairVelvetMat = new THREE.MeshStandardMaterial({
      color: 0x6E2332,
      roughness: 0.6
    });
    const glassPartitionMat = new THREE.MeshStandardMaterial({
      color: 0xE8D8C4,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1
    });

    const deskTopGeo = new THREE.BoxGeometry(2.5, 0.12, 1.7);
    const legGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.4, 12);

    zones.forEach(zone => {
      for (let i = 1; i <= zone.count; i++) {
        const code = `${zone.prefix}-0${i}`;
        const z = -18 + (i * 4.6);
        const deskGroup = new THREE.Group();
        deskGroup.position.set(zone.x, 1.4, z);

        // Mahogany tabletop (Interactive Raycast target)
        const deskTop = new THREE.Mesh(deskTopGeo, woodTopMat.clone());
        deskTop.castShadow = true;
        deskTop.receiveShadow = true;
        deskGroup.add(deskTop);

        // Champagne Gold Hairpin Legs
        [ [-1.05, -0.7, -0.65], [1.05, -0.7, -0.65], [-1.05, -0.7, 0.65], [1.05, -0.7, 0.65] ].forEach(lp => {
          const leg = new THREE.Mesh(legGeo, brassMat);
          leg.position.set(...lp);
          deskGroup.add(leg);
        });

        // Ergonomic Study Chair
        const chairSeat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.12, 1.0), chairVelvetMat);
        chairSeat.position.set(0, -0.38, 1.3);
        const chairBack = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.9, 0.12), chairVelvetMat);
        chairBack.position.set(0, 0.08, 1.75);
        const chairLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9), brassMat);
        chairLeg.position.set(0, -0.85, 1.3);
        deskGroup.add(chairSeat);
        deskGroup.add(chairBack);
        deskGroup.add(chairLeg);

        // Classic Brass Banker's Lamp with Glowing Emissive Hood
        const lampGroup = new THREE.Group();
        lampGroup.position.set(0.85, 0.06, -0.5);

        const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.05, 16), brassMat);
        lampGroup.add(lampBase);

        const lampPole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.65), brassMat);
        lampPole.position.set(0, 0.35, 0);
        lampGroup.add(lampPole);

        // Glowing Emerald & Gold Banker Lamp Shade
        const lampShade = new THREE.Mesh(
          new THREE.CylinderGeometry(0.15, 0.18, 0.45, 16, 1, false, 0, Math.PI),
          new THREE.MeshStandardMaterial({
            color: 0x1E5E3A,
            emissive: 0x38BDF8,
            emissiveIntensity: 0.55,
            metalness: 0.6,
            roughness: 0.25
          })
        );
        lampShade.rotation.z = Math.PI / 2;
        lampShade.position.set(0, 0.68, 0);
        lampGroup.add(lampShade);

        deskGroup.add(lampGroup);

        // Open study notebook on desk
        const notebook = new THREE.Mesh(
          new THREE.BoxGeometry(0.7, 0.04, 0.5),
          new THREE.MeshStandardMaterial({ color: 0xFDFBF7, roughness: 0.7 })
        );
        notebook.position.set(-0.2, 0.08, 0.1);
        notebook.rotation.y = 0.1;
        deskGroup.add(notebook);

        // Frosted Glass Acoustic Partition (Collab & Window zones)
        if (zone.prefix !== 'S') {
          const partition = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.7, 0.05), glassPartitionMat);
          partition.position.set(0, 0.45, -0.8);
          deskGroup.add(partition);
        }

        // Real-time Status Indicator Ring
        const ringGeo = new THREE.RingGeometry(0.28, 0.38, 24);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x10B981,
          side: THREE.DoubleSide
        });
        const statusRing = new THREE.Mesh(ringGeo, ringMat);
        statusRing.rotation.x = -Math.PI / 2;
        statusRing.position.set(-0.7, 0.07, 0);
        deskGroup.add(statusRing);

        // Raycasting metadata
        const isOccupied = (i % 3 === 0);
        deskTop.userData = {
          type: 'desk',
          code: code,
          zone: zone.name,
          occupied: isOccupied,
          statusRing: statusRing,
          lampShade: lampShade,
          deskGroup: deskGroup
        };

        this.deskMeshes[code] = deskTop;
        this.interactiveObjects.push(deskTop);
        this.scene.add(deskGroup);
      }
    });

    this.updateDeskStatuses();
  }

  // ==========================================
  // 7. CIRCULATION RECEPTION & DIGITAL HOLOGRAM
  // ==========================================

  buildCirculationDesk() {
    const circGroup = new THREE.Group();
    circGroup.position.set(0, 1.4, -14);

    const woodTex = this.createWoodTexture();
    const marbleTex = this.createMarbleTexture();

    // Curved mahogany desk carcass
    const counterGeo = new THREE.BoxGeometry(11, 1.8, 2.4);
    const counterMat = new THREE.MeshStandardMaterial({
      map: woodTex,
      color: 0x581C28,
      roughness: 0.38,
      metalness: 0.16
    });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.castShadow = true;
    counter.receiveShadow = true;
    circGroup.add(counter);

    // Dark wine marble top with champagne reflection
    const marbleTop = new THREE.Mesh(
      new THREE.BoxGeometry(11.4, 0.15, 2.7),
      new THREE.MeshStandardMaterial({ map: marbleTex, roughness: 0.18, metalness: 0.18 })
    );
    marbleTop.position.y = 0.98;
    circGroup.add(marbleTop);

    // Brass kickplate & guard rail
    const brassMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.88, roughness: 0.2 });
    const kickplate = new THREE.Mesh(new THREE.BoxGeometry(11.2, 0.2, 2.5), brassMat);
    kickplate.position.y = -0.8;
    circGroup.add(kickplate);

    // Featured "Book of the Month" on display stand
    const standMat = new THREE.MeshStandardMaterial({ color: 0x38BDF8, metalness: 0.85, roughness: 0.22 });
    const bookStand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.6), standMat);
    bookStand.position.set(0, 1.25, 0);
    circGroup.add(bookStand);

    const displayBook = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 0.18, 0.9),
      new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.28, metalness: 0.45 })
    );
    displayBook.position.set(0, 1.45, 0);
    displayBook.rotation.x = 0.35;
    circGroup.add(displayBook);
    this.displayBookMesh = displayBook;

    // Rotating 3D Golden Library Emblem
    const emblemGroup = new THREE.Group();
    emblemGroup.position.set(0, 3.8, 0);

    const outerRing = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.08, 16, 48), brassMat);
    emblemGroup.add(outerRing);

    const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.05, 16, 48), brassMat);
    emblemGroup.add(innerRing);

    const coreEmblem = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.45, 0),
      new THREE.MeshStandardMaterial({
        color: 0x38BDF8,
        emissive: 0x38BDF8,
        emissiveIntensity: 0.85,
        roughness: 0.15
      })
    );
    emblemGroup.add(coreEmblem);

    circGroup.add(emblemGroup);
    this.hologramEmblem = emblemGroup;

    counter.userData = {
      type: 'circulation',
      title: 'University Circulation & Member Desk'
    };

    displayBook.userData = {
      type: 'displayBook',
      bookId: 1
    };

    this.interactiveObjects.push(counter);
    this.interactiveObjects.push(displayBook);
    this.scene.add(circGroup);
  }

  // ==========================================
  // 8. FLOATING AMBIENT DUST PARTICLES
  // ==========================================

  buildDustParticles() {
    const count = 450;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 55;
      positions[i * 3 + 1] = 0.8 + Math.random() * 14.5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 55;

      velocities[i * 3] = (Math.random() - 0.5) * 0.02;
      velocities[i * 3 + 1] = 0.006 + Math.random() * 0.012;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const pTex = this.createParticleTexture();
    const mat = new THREE.PointsMaterial({
      map: pTex,
      color: 0x38BDF8,
      size: 0.48,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.dustParticles = new THREE.Points(geo, mat);
    this.particlePositions = positions;
    this.particleVelocities = velocities;
    this.scene.add(this.dustParticles);
  }

  // ==========================================
  // 9. DYNAMIC SEAT STATUS UPDATE
  // ==========================================

  updateDeskStatuses() {
    const reservedSeat = (typeof SmartLibState !== 'undefined') ? SmartLibState.getReservedSeat() : null;

    Object.keys(this.deskMeshes).forEach(code => {
      const mesh = this.deskMeshes[code];
      const ring = mesh.userData.statusRing;
      const shade = mesh.userData.lampShade;
      if (!ring) return;

      if (reservedSeat === code) {
        // Cyan / Amber: Active reserved study desk
        ring.material.color.setHex(0x38BDF8);
        mesh.material.color.setHex(0x421D36);
        if (shade) {
          shade.material.emissive.setHex(0x38BDF8);
          shade.material.emissiveIntensity = 0.9;
        }
      } else if (mesh.userData.occupied) {
        // Rose Red: Occupied
        ring.material.color.setHex(0xFF5A5F);
        mesh.material.color.setHex(0x32101B);
        if (shade) {
          shade.material.emissive.setHex(0xFF5A5F);
          shade.material.emissiveIntensity = 0.3;
        }
      } else {
        // Emerald Gold: Available
        ring.material.color.setHex(0x10B981);
        mesh.material.color.setHex(0x38141F);
        if (shade) {
          shade.material.emissive.setHex(0x38BDF8);
          shade.material.emissiveIntensity = 0.55;
        }
      }
    });
  }

  // ==========================================
  // 10. CINEMATIC CAMERA WAYPOINTS & FLY TO
  // ==========================================

  flyToTarget(cameraPos, lookAtTarget, waypointName = null) {
    if (!this.camera) return;

    this.startCameraPos = this.camera.position.clone();
    this.startLookAt = (this.controls ? this.controls.target.clone() : this.cameraLookAt.clone());
    this.targetCameraPos = cameraPos;
    this.targetLookAt = lookAtTarget;
    this.transitionProgress = 0;
    this.isTransitioning = true;

    if (waypointName) {
      this.activeWaypoint = waypointName;
      document.querySelectorAll('.waypoint-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.waypoint === waypointName);
      });
    }

    if (typeof SoundFX !== 'undefined' && SoundFX.click) {
      SoundFX.click();
    }
  }

  flyToWaypoint(waypoint) {
    const waypoints = {
      entrance: {
        pos: new THREE.Vector3(0, 15, 32),
        look: new THREE.Vector3(0, 2.5, 0)
      },
      stacks: {
        pos: new THREE.Vector3(-11, 5.5, -8),
        look: new THREE.Vector3(-14, 3.8, -8)
      },
      desks: {
        pos: new THREE.Vector3(10, 6.2, 2),
        look: new THREE.Vector3(14, 2.2, 0)
      },
      window: {
        pos: new THREE.Vector3(18, 5.5, -10),
        look: new THREE.Vector3(23, 3.0, -15)
      },
      circulation: {
        pos: new THREE.Vector3(0, 4.2, -6),
        look: new THREE.Vector3(0, 1.8, -14)
      }
    };

    const target = waypoints[waypoint] || waypoints.entrance;
    this.flyToTarget(target.pos, target.look, waypoint);
  }

  // Camera Zoom HUD Controls
  zoomCamera(delta) {
    if (!this.camera || !this.controls || !this.controls.target) return;
    const dx = this.camera.position.x - this.controls.target.x;
    const dy = this.camera.position.y - this.controls.target.y;
    const dz = this.camera.position.z - this.controls.target.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
    const factor = Math.max(0.2, (dist + delta) / dist);
    this.camera.position.set(
      this.controls.target.x + dx * factor,
      this.controls.target.y + dy * factor,
      this.controls.target.z + dz * factor
    );
    if (typeof SoundFX !== 'undefined' && SoundFX.click) SoundFX.click();
  }

  resetCampusCamera() {
    this.flyToWaypoint('entrance');
  }

  toggleFullscreen() {
    const elem = document.getElementById('webgl-library-section');
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ==========================================
  // 11. RAYCASTING, HOVER GLOW & TOOLTIP
  // ==========================================

  checkRaycastHover() {
    if (!this.raycaster || !this.camera) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    const tooltip = document.getElementById('webgl-3d-tooltip');

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;
      document.body.style.cursor = 'pointer';

      // Clear previous hover glow if changed
      if (this.hoveredObject && this.hoveredObject !== hit) {
        this.clearHoverGlow();
      }

      // Apply new hover glow
      if (this.hoveredObject !== hit) {
        this.hoveredObject = hit;
        if (hit.material) {
          if (!hit.userData._origEmissive && hit.material.emissive) {
            hit.userData._origEmissive = hit.material.emissive.getHex();
            hit.userData._origEmissiveIntensity = hit.material.emissiveIntensity || 0;
          }
          if (hit.material.emissive) {
            hit.material.emissive.setHex(0x5E3E18);
            hit.material.emissiveIntensity = 0.8;
          }
        }
      }

      // Position tooltip accurately using client coordinates
      if (tooltip) {
        tooltip.style.display = 'block';
        const posX = Math.min(window.innerWidth - 280, this.pointerClientX + 16);
        const posY = Math.min(window.innerHeight - 140, this.pointerClientY + 16);
        tooltip.style.left = `${posX}px`;
        tooltip.style.top = `${posY}px`;

        if (data.type === 'bookshelf') {
          tooltip.innerHTML = `
            <div style="color: #FFD166; font-weight: 800; font-size: 0.9rem; margin-bottom: 3px;">📚 ${data.category} Stacks</div>
            <div style="font-size: 0.76rem; color: #E8D8C4; margin-bottom: 4px;">📍 Shelf: ${data.code} • ${data.count} Volumes</div>
            <div style="color: #FFD166; font-size: 0.72rem; font-weight: 700;">Click to dolly camera &amp; filter catalog</div>
          `;
        } else if (data.type === 'desk') {
          const reservedSeat = (typeof SmartLibState !== 'undefined') ? SmartLibState.getReservedSeat() : null;
          let statusText = 'Available for Booking';
          let statusColor = '#10B981';
          if (reservedSeat === data.code) {
            statusText = 'Your Active Reservation';
            statusColor = '#38BDF8';
          } else if (data.occupied) {
            statusText = 'Occupied by Peer';
            statusColor = '#FF5A5F';
          }

          tooltip.innerHTML = `
            <div style="color: #FFD166; font-weight: 800; font-size: 0.9rem; margin-bottom: 3px;">🪑 Desk ${data.code} (${data.zone} Pod)</div>
            <div style="font-size: 0.76rem; color: ${statusColor}; font-weight: 700; margin-bottom: 4px;">● ${statusText}</div>
            <div style="color: #E8D8C4; font-size: 0.72rem;">Click to reserve or release seat</div>
          `;
        } else if (data.type === 'circulation') {
          tooltip.innerHTML = `
            <div style="color: #FFD166; font-weight: 800; font-size: 0.9rem; margin-bottom: 3px;">🏛️ University Circulation Desk</div>
            <div style="font-size: 0.76rem; color: #E8D8C4;">Official book checkout &amp; student loan clearance counter.</div>
          `;
        } else if (data.type === 'shelfBook') {
          const book = data.book || {};
          tooltip.innerHTML = `
            <div style="color: #38BDF8; font-weight: 800; font-size: 0.9rem; margin-bottom: 3px;">📖 ${book.title || 'Textbook'}</div>
            <div style="font-size: 0.76rem; color: #CBD5E1; margin-bottom: 4px;">📍 ${data.shelfCode || 'FL-2 / AISLE-1'} • ${book.author || ''}</div>
            <div style="color: #34D399; font-size: 0.72rem; font-weight: 700;">👆 Touch or click to pull book out in 3D</div>
          `;
        } else if (data.type === 'displayBook') {
          tooltip.innerHTML = `
            <div style="color: #38BDF8; font-weight: 800; font-size: 0.9rem; margin-bottom: 3px;">📖 Featured Academic Title</div>
            <div style="font-size: 0.76rem; color: #CBD5E1;">Click to open Interactive 3D Hardcover Model</div>
          `;
        }
      }
    } else {
      document.body.style.cursor = 'default';
      if (tooltip) tooltip.style.display = 'none';
      this.clearHoverGlow();
    }
  }

  clearHoverGlow() {
    if (this.hoveredObject) {
      if (this.hoveredObject.material && this.hoveredObject.material.emissive && this.hoveredObject.userData._origEmissive !== undefined) {
        this.hoveredObject.material.emissive.setHex(this.hoveredObject.userData._origEmissive);
        this.hoveredObject.material.emissiveIntensity = this.hoveredObject.userData._origEmissiveIntensity || 0;
      }
      this.hoveredObject = null;
    }
  }

  onPointerClick(event) {
    if (!this.raycaster || !this.camera) return;
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const intersects = this.raycaster.intersectObjects(this.interactiveObjects);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const data = hit.userData;

      if (data.type === 'bookshelf') {
        // Smooth cinematic dolly into shelf
        const shelfPos = data.group.position;
        this.flyToTarget(
          new THREE.Vector3(shelfPos.x + 3.6, 4.2, shelfPos.z),
          new THREE.Vector3(shelfPos.x, 3.8, shelfPos.z)
        );

        if (typeof setCategoryFilter === 'function') {
          setCategoryFilter(data.category);
          switchPage('catalog');
          if (typeof showToast === 'function') {
            showToast(`📚 Focused 3D Aisle: ${data.category}`);
          }
        }
      } else if (data.type === 'desk') {
        // Direct Seat Click Handling
        if (typeof handleSeatClick === 'function') {
          handleSeatClick(data.code, data.occupied);
          this.updateDeskStatuses();
        }
      } else if (data.type === 'circulation') {
        if (typeof switchPage === 'function') {
          switchPage('student');
        }
      } else if (data.type === 'displayBook') {
        this.inspectBook(data.bookId || 1);
      } else if (data.type === 'shelfBook') {
        this.toggleShelfBookExtraction(hit);
      }
    } else {
      if (this.extractedBookMesh) {
        this.retractExtractedBook();
      }
    }
  }

  onPointerMove(event) {
    if (!this.renderer || !this.renderer.domElement) return;
    const rect = this.renderer.domElement.getBoundingClientRect();
    this.pointerClientX = event.clientX;
    this.pointerClientY = event.clientY;
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    this.checkRaycastHover();
  }

  onTouchStart(event) {
    if (event.touches.length > 0 && this.renderer && this.renderer.domElement) {
      const touch = event.touches[0];
      const rect = this.renderer.domElement.getBoundingClientRect();
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchStartTime = Date.now();

      this.pointerClientX = touch.clientX;
      this.pointerClientY = touch.clientY;
      this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
      this.checkRaycastHover();
    }
  }

  onTouchEnd(event) {
    if (event.changedTouches.length > 0 && this.renderer && this.renderer.domElement) {
      const touch = event.changedTouches[0];
      const dx = Math.abs(touch.clientX - this.touchStartX);
      const dy = Math.abs(touch.clientY - this.touchStartY);
      const dt = Date.now() - this.touchStartTime;

      // Short tap without drag
      if (dx < 12 && dy < 12 && dt < 350) {
        this.pointerClientX = touch.clientX;
        this.pointerClientY = touch.clientY;
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
        this.onPointerClick(event);
      }
    }
  }

  onWindowResize() {
    if (this.camera && this.renderer && this.container) {
      const width = this.container.clientWidth;
      const height = this.container.clientHeight;
      if (width > 0 && height > 0) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
      }
    }
    if (this.inspectorCamera && this.inspectorRenderer && this.inspectorContainer) {
      const iw = this.inspectorContainer.clientWidth;
      const ih = this.inspectorContainer.clientHeight;
      if (iw > 0 && ih > 0) {
        this.inspectorCamera.aspect = iw / ih;
        this.inspectorCamera.updateProjectionMatrix();
        this.inspectorRenderer.setSize(iw, ih);
      }
    }
    if (this.heroCamera && this.heroRenderer && this.heroContainer) {
      const hw = this.heroContainer.clientWidth;
      const hh = this.heroContainer.clientHeight;
      if (hw > 0 && hh > 0) {
        this.heroCamera.aspect = hw / hh;
        this.heroCamera.updateProjectionMatrix();
        this.heroRenderer.setSize(hw, hh);
      }
    }
  }

  // ==========================================
  // 12. HERO 3D FLOATING BOOK HOLOGRAM SHOWCASE
  // ==========================================

  initHeroShowcase() {
    if (typeof document === 'undefined') return;
    this.heroContainer = document.getElementById('hero-3d-canvas-container');
    if (!this.heroContainer || typeof THREE === 'undefined') return;

    this.heroScene = new THREE.Scene();

    const w = this.heroContainer.clientWidth || 360;
    const h = this.heroContainer.clientHeight || 340;
    this.heroCamera = new THREE.PerspectiveCamera(40, w / h, 0.1, 50);
    this.heroCamera.position.set(0, 0.5, 6.4);

    this.heroRenderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.heroRenderer.setSize(w, h);
    this.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.heroRenderer.shadowMap.enabled = true;
    this.heroContainer.innerHTML = '';
    this.heroContainer.appendChild(this.heroRenderer.domElement);

    // Hero Lighting
    const amb = new THREE.AmbientLight(0xFFF0DE, 0.85);
    this.heroScene.add(amb);

    const key = new THREE.SpotLight(0x38BDF8, 1.8, 20, Math.PI / 3, 0.35);
    key.position.set(4, 5, 5);
    this.heroScene.add(key);

    const rim = new THREE.DirectionalLight(0xA4C8E8, 0.9);
    rim.position.set(-4, -2, -3);
    this.heroScene.add(rim);

    // Holographic Orbital Halo Rings
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38BDF8,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    this.heroHoloRing = new THREE.Mesh(new THREE.RingGeometry(2.3, 2.36, 48), ringMat);
    this.heroHoloRing.rotation.x = Math.PI / 2.4;
    this.heroScene.add(this.heroHoloRing);

    // Golden Sparkle Floating Particles
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 5.5;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 4.5;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 4.0;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    this.heroParticles = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({
        color: 0x38BDF8,
        size: 0.1,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending
      })
    );
    this.heroScene.add(this.heroParticles);

    // Build First Hero Book
    this.updateHeroBook(0);

    // Interactive Drag, Pinch & Zoom Physics
    const dom = this.heroRenderer.domElement;
    if (dom && dom.style) dom.style.cursor = 'grab';

    if (dom && typeof dom.addEventListener === 'function') {
      // Mouse Wheel Zoom
      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (this.heroCamera) {
          const deltaZ = (e.deltaY || 0) * 0.005;
          this.heroCamera.position.z = Math.max(4.0, Math.min(8.5, this.heroCamera.position.z + deltaZ));
        }
      }, { passive: false });

      dom.addEventListener('mousedown', (e) => {
        this.heroPointer.isDragging = true;
        this.heroPointer.startX = e.clientX;
        this.heroPointer.startY = e.clientY;
        this.heroPointer.prevX = e.clientX;
        this.heroPointer.prevY = e.clientY;
        this.heroPointer.velX = 0;
        this.heroPointer.velY = 0;
        if (dom.style) dom.style.cursor = 'grabbing';
      });
    }

    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      if (this._heroMouseMove) window.removeEventListener('mousemove', this._heroMouseMove);
      if (this._heroMouseUp) window.removeEventListener('mouseup', this._heroMouseUp);

      this._heroMouseMove = (e) => {
        if (this.heroPointer.isDragging && this.heroBookGroup) {
          const dx = e.clientX - this.heroPointer.prevX;
          const dy = e.clientY - this.heroPointer.prevY;
          this.heroPointer.velX = dx * 0.008;
          this.heroPointer.velY = dy * 0.008;
          this.heroBookGroup.rotation.y += this.heroPointer.velX;
          this.heroBookGroup.rotation.x = Math.max(-0.6, Math.min(0.8, this.heroBookGroup.rotation.x + this.heroPointer.velY));
          this.heroPointer.prevX = e.clientX;
          this.heroPointer.prevY = e.clientY;
        }
      };

      this._heroMouseUp = (e) => {
        if (this.heroPointer.isDragging) {
          const dist = Math.hypot(e.clientX - this.heroPointer.startX, e.clientY - this.heroPointer.startY);
          this.heroPointer.isDragging = false;
          if (dist < 8) {
            this.inspectCurrentHeroBook();
          }
        }
        if (dom && dom.style) dom.style.cursor = 'grab';
      };

      window.addEventListener('mousemove', this._heroMouseMove);
      window.addEventListener('mouseup', this._heroMouseUp);
    }

    // Touch support with 2-Finger Pinch Zoom for Hero 3D Book
    if (dom && typeof dom.addEventListener === 'function') {
      dom.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          this.heroPointer.isDragging = true;
          this.heroPointer.isPinching = false;
          this.heroPointer.startX = e.touches[0].clientX;
          this.heroPointer.startY = e.touches[0].clientY;
          this.heroPointer.prevX = e.touches[0].clientX;
          this.heroPointer.prevY = e.touches[0].clientY;
          this.heroPointer.velX = 0;
          this.heroPointer.velY = 0;
        } else if (e.touches && e.touches.length === 2) {
          this.heroPointer.isDragging = false;
          this.heroPointer.isPinching = true;
          this.heroPointer.pinchStartDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          this.heroPointer.initialCameraZ = this.heroCamera ? this.heroCamera.position.z : 6.4;
        }
      }, { passive: true });

      dom.addEventListener('touchmove', (e) => {
        if (this.heroPointer.isDragging || this.heroPointer.isPinching) {
          if (e.cancelable) e.preventDefault();
        }
        if (this.heroPointer.isPinching && e.touches && e.touches.length === 2 && this.heroCamera) {
          const currentDist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
          );
          if (this.heroPointer.pinchStartDist > 0 && currentDist > 0) {
            const factor = this.heroPointer.pinchStartDist / currentDist;
            this.heroCamera.position.z = Math.max(4.0, Math.min(8.5, this.heroPointer.initialCameraZ * factor));
          }
        } else if (this.heroPointer.isDragging && this.heroBookGroup && e.touches && e.touches.length === 1) {
          const dx = e.touches[0].clientX - this.heroPointer.prevX;
          const dy = e.touches[0].clientY - this.heroPointer.prevY;
          this.heroPointer.velX = dx * 0.01;
          this.heroPointer.velY = dy * 0.01;
          this.heroBookGroup.rotation.y += this.heroPointer.velX;
          this.heroBookGroup.rotation.x = Math.max(-0.6, Math.min(0.8, this.heroBookGroup.rotation.x + this.heroPointer.velY));
          this.heroPointer.prevX = e.touches[0].clientX;
          this.heroPointer.prevY = e.touches[0].clientY;
        }
      }, { passive: false });

      dom.addEventListener('touchend', (e) => {
        if (this.heroPointer.isDragging && e.changedTouches && e.changedTouches.length > 0) {
          const touch = e.changedTouches[0];
          const dist = Math.hypot(touch.clientX - this.heroPointer.startX, touch.clientY - this.heroPointer.startY);
          if (dist < 10) {
            this.inspectCurrentHeroBook();
          }
        }
        this.heroPointer.isDragging = false;
        this.heroPointer.isPinching = false;
      }, { passive: true });
    }

    if (this.heroFrameId && typeof cancelAnimationFrame !== 'undefined') {
      cancelAnimationFrame(this.heroFrameId);
      this.heroFrameId = null;
    }
    this.isHeroAnimating = true;
    this.animateHeroShowcase();
  }

  updateHeroBook(index) {
    const books = (typeof SmartLibState !== 'undefined') ? SmartLibState.getBooks() : [];
    if (!books || books.length === 0) return;
    this.heroBookIndex = (index + books.length) % Math.min(6, books.length);
    const book = books[this.heroBookIndex];

    if (!this.heroScene) return;

    // Dispose old meshes and textures cleanly to avoid memory leaks
    if (this.heroBookGroup) {
      if (typeof this.heroBookGroup.traverse === 'function') {
        this.heroBookGroup.traverse((child) => {
          if (child.isMesh) {
            if (child.geometry && child.geometry.dispose) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => {
                  if (m.map && m.map.dispose) m.map.dispose();
                  if (m.dispose) m.dispose();
                });
              } else {
                if (child.material.map && child.material.map.dispose) child.material.map.dispose();
                if (child.material.dispose) child.material.dispose();
              }
            }
          }
        });
      }
      this.heroScene.remove(this.heroBookGroup);
    }

    this.heroBookGroup = new THREE.Group();

    // Canvas textures for Cover and Spine
    const coverTex = this.createBookCoverTexture(book);
    const spineTex = this.createBookSpineTexture(book);

    const coverMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.28,
      metalness: 0.25
    });
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.35,
      metalness: 0.2
    });
    const backCoverMat = new THREE.MeshStandardMaterial({
      color: 0x361019,
      roughness: 0.45,
      metalness: 0.12
    });
    const pagesMat = new THREE.MeshStandardMaterial({
      color: 0xFDF8EE,
      roughness: 0.82
    });
    const goldRibbonMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.88,
      roughness: 0.22
    });

    // 1. Back Cover
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(2.35, 3.35, 0.06), backCoverMat);
    backCover.position.set(0, 0, -0.22);
    this.heroBookGroup.add(backCover);

    // 2. Thick Page Block
    const pages = new THREE.Mesh(new THREE.BoxGeometry(2.25, 3.2, 0.4), pagesMat);
    pages.position.set(0.04, 0, 0);
    this.heroBookGroup.add(pages);

    // 3. Spine
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.35, 0.48), spineMat);
    spine.position.set(-1.15, 0, 0);
    this.heroBookGroup.add(spine);

    // 4. Front Cover
    const frontCover = new THREE.Mesh(new THREE.BoxGeometry(2.35, 3.35, 0.06), coverMat);
    frontCover.position.set(0, 0, 0.22);
    this.heroBookGroup.add(frontCover);

    // 5. Hanging Gold Satin Bookmark Ribbon
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.02), goldRibbonMat);
    ribbon.position.set(0.2, -1.75, 0.1);
    ribbon.rotation.z = 0.2;
    this.heroBookGroup.add(ribbon);

    // Aesthetic 3D Pose
    this.heroBookGroup.rotation.set(0.18, -0.42, 0.05);
    this.heroScene.add(this.heroBookGroup);

    // Update DOM UI elements in Hero Card
    const titleEl = document.getElementById('hero-book-title');
    const authorEl = document.getElementById('hero-book-author');
    const shelfEl = document.getElementById('hero-book-shelf');
    const counterEl = document.getElementById('hero-book-counter');

    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = `By ${book.author}`;
    if (shelfEl) shelfEl.textContent = `📍 ${book.shelf}`;
    if (counterEl) counterEl.textContent = `${this.heroBookIndex + 1} / ${Math.min(6, books.length)}`;
  }

  nextHeroBook() {
    this.updateHeroBook(this.heroBookIndex + 1);
    if (typeof SoundFX !== 'undefined' && SoundFX.click) SoundFX.click();
  }

  prevHeroBook() {
    this.updateHeroBook(this.heroBookIndex - 1);
    if (typeof SoundFX !== 'undefined' && SoundFX.click) SoundFX.click();
  }

  inspectCurrentHeroBook() {
    const books = (typeof SmartLibState !== 'undefined') ? SmartLibState.getBooks() : [];
    const book = books[this.heroBookIndex] || books[0];
    if (book) {
      this.inspectBook(book.id);
    }
  }

  borrowCurrentHeroBook() {
    const books = (typeof SmartLibState !== 'undefined') ? SmartLibState.getBooks() : [];
    const book = books[this.heroBookIndex] || books[0];
    if (book && typeof handleBorrowBook === 'function') {
      handleBorrowBook(book.id);
    }
  }

  animateHeroShowcase() {
    if (!this.isHeroAnimating || this.isDestroyed) return;
    if (typeof requestAnimationFrame !== 'undefined') {
      this.heroFrameId = requestAnimationFrame(() => this.animateHeroShowcase());
    }

    if (!this.isHeroVisible || !this.isTabActive) return;

    const time = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

    // Gentle floating, angular momentum & gyroscopic pitch ease
    if (this.heroBookGroup) {
      if (!this.heroPointer.isDragging) {
        // Apply residual angular velocity with friction damping
        this.heroBookGroup.rotation.y += (this.heroPointer.velX || 0) + 0.004;
        this.heroPointer.velX = (this.heroPointer.velX || 0) * 0.93;

        // Smoothly ease pitch back to optimal 0.18 presentation tilt
        this.heroBookGroup.rotation.x += (0.18 - this.heroBookGroup.rotation.x) * 0.04;

        this.heroBookGroup.position.y = Math.sin(time * 1.6) * 0.12;
      }
    }

    if (this.heroHoloRing) {
      this.heroHoloRing.rotation.z += 0.008;
      const s = 1 + Math.sin(time * 2) * 0.04;
      this.heroHoloRing.scale.set(s, s, s);
    }

    if (this.heroParticles) {
      this.heroParticles.rotation.y += 0.003;
    }

    if (this.heroRenderer && this.heroScene && this.heroCamera) {
      this.heroRenderer.render(this.heroScene, this.heroCamera);
    }
  }

  // ==========================================
  // 13. INTERACTIVE 3D BOOK MODEL INSPECTOR
  // ==========================================

  createBookCoverTexture(book) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Deep Crimson Velvet / Antique Morocco Leather grain
    ctx.fillStyle = '#45121D';
    ctx.fillRect(0, 0, 1024, 1024);

    // Leather noise
    for (let i = 0; i < 6000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(109, 33, 47, 0.3)' : 'rgba(28, 8, 14, 0.4)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 3, 3);
    }

    // Outer & Inner Embossed Gold Foil Borders
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 14;
    ctx.strokeRect(40, 40, 944, 944);

    ctx.lineWidth = 4;
    ctx.strokeRect(68, 68, 888, 888);

    // Ornate Baroque Corner Filigrees
    const drawFiligree = (cx, cy, rot) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = '#FFD166';
      ctx.beginPath();
      ctx.arc(0, 0, 24, 0, Math.PI / 2);
      ctx.lineTo(0, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };
    drawFiligree(80, 80, 0);
    drawFiligree(944, 80, Math.PI / 2);
    drawFiligree(944, 944, Math.PI);
    drawFiligree(80, 944, -Math.PI / 2);

    // Academic Senate Seal / Crest
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 220, 64, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 22px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#FFD166';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️ SMART ACADEMIC PRESS', 512, 330);

    // Book Title in Gold Foil Embossed Serif
    ctx.font = 'bold 44px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#FFE6A3';
    ctx.shadowColor = '#FFD166';
    ctx.shadowBlur = 12;

    const words = (book.title || 'ACADEMIC VOLUME').split(' ');
    let lines = [];
    let currentLine = '';
    words.forEach(w => {
      const testLine = currentLine ? `${currentLine} ${w}` : w;
      if (ctx.measureText(testLine).width > 760) {
        lines.push(currentLine);
        currentLine = w;
      } else {
        currentLine = testLine;
      }
    });
    lines.push(currentLine);

    const startY = 460 - (lines.length * 25);
    lines.forEach((line, idx) => {
      ctx.fillText(line, 512, startY + (idx * 54));
    });

    // Gold Divider Flourish
    ctx.strokeStyle = '#FFD166';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(340, 680);
    ctx.lineTo(684, 680);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(512, 680, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#FFD166';
    ctx.fill();

    // Author Name in Gold Italic
    ctx.font = 'italic 28px "Georgia", serif';
    ctx.fillStyle = '#E8D8C4';
    ctx.shadowBlur = 0;
    ctx.fillText(`By ${book.author || 'University Faculty'}`, 512, 730);

    // Shelf Locator Coordinate
    ctx.font = 'bold 20px monospace';
    ctx.fillStyle = '#FFD166';
    ctx.fillText(`LOC: ${book.shelf || 'MAIN STACKS'}`, 512, 840);

    return new THREE.CanvasTexture(canvas);
  }

  createBookSpineTexture(book) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#320C15';
    ctx.fillRect(0, 0, 256, 1024);

    // Gold raised ribs
    const ribMatY = [120, 260, 780, 920];
    ctx.fillStyle = '#FFD166';
    ribMatY.forEach(ry => {
      ctx.fillRect(20, ry, 216, 12);
      ctx.fillRect(30, ry + 16, 196, 4);
    });

    // Vertical Title
    ctx.save();
    ctx.translate(128, 540);
    ctx.rotate(Math.PI / 2);
    ctx.font = 'bold 28px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#FFD166';
    ctx.textAlign = 'center';
    const shortTitle = (book.title || 'VOLUME').length > 32 
      ? (book.title.substring(0, 30) + '...') 
      : book.title;
    ctx.fillText(shortTitle, 0, 10);
    ctx.restore();

    return new THREE.CanvasTexture(canvas);
  }

  createBookInnerPagesTexture(book) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Antique Ivory parchment paper
    ctx.fillStyle = '#FAF5EB';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle paper grain
    for (let i = 0; i < 3000; i++) {
      ctx.fillStyle = 'rgba(180, 160, 130, 0.08)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }

    // Gutter center crease shadow
    const gradGutter = ctx.createLinearGradient(0, 0, 60, 0);
    gradGutter.addColorStop(0, 'rgba(80, 60, 40, 0.4)');
    gradGutter.addColorStop(1, 'rgba(80, 60, 40, 0)');
    ctx.fillStyle = gradGutter;
    ctx.fillRect(0, 0, 60, 1024);

    // Inner Red Margin Rule
    ctx.strokeStyle = 'rgba(180, 50, 60, 0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, 60);
    ctx.lineTo(90, 960);
    ctx.stroke();

    // Chapter Header
    ctx.font = 'bold 22px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#781D2E';
    ctx.textAlign = 'left';
    ctx.fillText('CHAPTER I: FOUNDATIONS & PRINCIPLES', 120, 130);

    // Gold decorative rule
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(120, 146);
    ctx.lineTo(900, 146);
    ctx.stroke();

    // Chapter Title
    ctx.font = 'bold 36px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#1A080F';
    const titleSnippet = (book.title || 'ACADEMIC STUDY').length > 30 
      ? (book.title.substring(0, 28) + '...')
      : book.title;
    ctx.fillText(titleSnippet, 120, 210);

    // Author
    ctx.font = 'italic 20px "Georgia", serif';
    ctx.fillStyle = '#5A3840';
    ctx.fillText(`By ${book.author || 'University Faculty'}`, 120, 245);

    // Decorative Drop Cap "I"
    ctx.fillStyle = '#781D2E';
    ctx.font = 'bold 72px "Cinzel", "Times New Roman", serif';
    ctx.fillText('I', 120, 340);

    // Academic Text Paragraphs
    ctx.font = '18px "Georgia", serif';
    ctx.fillStyle = '#260B12';
    const descText = book.desc || "The definitive academic textbook exploring theoretical foundations, computational proofs, representation models, and rigorous algorithmic verification within modern computer science.";
    
    // Word wrap paragraph
    const words = descText.split(' ');
    let pLines = [];
    let curLine = '';
    words.forEach(w => {
      const test = curLine ? `${curLine} ${w}` : w;
      if (ctx.measureText(test).width > 720) {
        pLines.push(curLine);
        curLine = w;
      } else {
        curLine = test;
      }
    });
    pLines.push(curLine);

    pLines.forEach((l, idx) => {
      const lx = idx === 0 ? 170 : 120;
      ctx.fillText(l, lx, 310 + (idx * 34));
    });

    // Academic Theorem Blockquote
    const quoteY = 320 + (pLines.length * 34) + 40;
    ctx.fillStyle = 'rgba(120, 29, 46, 0.08)';
    ctx.fillRect(120, quoteY, 780, 140);
    ctx.strokeStyle = '#781D2E';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, quoteY, 4, 140);

    ctx.font = 'italic 18px "Georgia", serif';
    ctx.fillStyle = '#48121E';
    ctx.fillText('“Knowledge is the foundation of institutional scholarship, wherein theoretical paradigms', 140, quoteY + 45);
    ctx.fillText('manifest into transformative computational architectures.”', 140, quoteY + 80);
    ctx.font = 'bold 15px "Cinzel", sans-serif';
    ctx.fillStyle = '#781D2E';
    ctx.fillText('— UNIVERSITY ACADEMIC SENATE', 140, quoteY + 115);

    // Page Number
    ctx.font = 'bold 18px "Georgia", serif';
    ctx.fillStyle = '#8C6840';
    ctx.textAlign = 'center';
    ctx.fillText('— 142 —', 512, 940);

    return new THREE.CanvasTexture(canvas);
  }

  createBookEndpaperTexture() {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Antique Royal Crimson marbled background
    ctx.fillStyle = '#340B14';
    ctx.fillRect(0, 0, 1024, 1024);

    // Marble wave pattern
    for (let i = 0; i < 40; i++) {
      ctx.strokeStyle = (i % 2 === 0) ? 'rgba(255, 209, 102, 0.18)' : 'rgba(120, 29, 46, 0.45)';
      ctx.lineWidth = 14 + (i % 4) * 3;
      ctx.beginPath();
      const yBase = i * 28 - 50;
      ctx.moveTo(0, yBase);
      for (let x = 0; x <= 1024; x += 60) {
        const yWave = yBase + Math.sin((x / 100) + i) * 35;
        ctx.lineTo(x, yWave);
      }
      ctx.stroke();
    }

    // Classical Renaissance Bookplate Frame (Ex Libris)
    const plateX = 180, plateY = 220, plateW = 664, plateH = 584;
    ctx.fillStyle = '#FAF5EB';
    ctx.fillRect(plateX, plateY, plateW, plateH);

    ctx.strokeStyle = '#2C0D15';
    ctx.lineWidth = 8;
    ctx.strokeRect(plateX + 12, plateY + 12, plateW - 24, plateH - 24);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.strokeRect(plateX + 22, plateY + 22, plateW - 44, plateH - 44);

    // University Seal
    ctx.strokeStyle = '#781D2E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 330, 52, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = 'bold 36px "Cinzel", "Times New Roman", serif';
    ctx.fillStyle = '#781D2E';
    ctx.textAlign = 'center';
    ctx.fillText('🏛️', 512, 342);

    ctx.font = 'bold 30px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#1A080F';
    ctx.fillText('EX LIBRIS', 512, 425);

    ctx.font = 'bold 20px "Cinzel", sans-serif';
    ctx.fillStyle = '#781D2E';
    ctx.fillText('UNIVERSITY SMART LIBRARY', 512, 460);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 485);
    ctx.lineTo(724, 485);
    ctx.stroke();

    ctx.font = 'italic 18px "Georgia", serif';
    ctx.fillStyle = '#5A3840';
    ctx.fillText('“Scientia • Virtus • Veritas”', 512, 520);
    ctx.fillText('Institutional Academic Holding & Reading Archive', 512, 550);

    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#781D2E';
    ctx.fillText('CLASSIS: COMP-SCI & AI • REG: STU-2026-AI042', 512, 610);
    ctx.fillText('ACADEMIC SENATE CIRCULATION SEAL APPROVED', 512, 640);

    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(plateX + 40, 680, plateW - 80, 70);
    ctx.font = 'bold 15px "Cinzel", sans-serif';
    ctx.fillStyle = '#1A080F';
    ctx.fillText('OFFICIAL DIGITAL TWIN HARDCOVER EDITION', 512, 715);
    ctx.fillText('PRESERVED IN FULL 3D INTERACTIVE FIDELITY', 512, 735);

    return new THREE.CanvasTexture(canvas);
  }

  createBookSpreadTexture(book, spreadIndex) {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Antique Ivory parchment paper background for whole spread
    ctx.fillStyle = '#FAF5EB';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle parchment paper grain
    for (let i = 0; i < 4000; i++) {
      ctx.fillStyle = (i % 2 === 0) ? 'rgba(180, 160, 130, 0.08)' : 'rgba(120, 90, 60, 0.05)';
      ctx.fillRect(Math.random() * 1024, Math.random() * 1024, 2, 2);
    }

    // Center gutter crease shadow (Spine center crease at x = 512)
    const gutterGrad = ctx.createLinearGradient(460, 0, 564, 0);
    gutterGrad.addColorStop(0, 'rgba(60, 40, 20, 0)');
    gutterGrad.addColorStop(0.45, 'rgba(40, 20, 10, 0.45)');
    gutterGrad.addColorStop(0.5, 'rgba(25, 10, 5, 0.75)');
    gutterGrad.addColorStop(0.55, 'rgba(40, 20, 10, 0.45)');
    gutterGrad.addColorStop(1, 'rgba(60, 40, 20, 0)');
    ctx.fillStyle = gutterGrad;
    ctx.fillRect(460, 0, 104, 1024);

    // Outer margin rules on Left page (x: 60..460) and Right page (x: 564..964)
    ctx.strokeStyle = 'rgba(180, 50, 60, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(60, 60, 400, 890);
    ctx.strokeRect(564, 60, 400, 890);

    // Header Gold Decorative Rules
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(70, 120); ctx.lineTo(450, 120);
    ctx.moveTo(574, 120); ctx.lineTo(954, 120);
    ctx.stroke();

    const pLeft = spreadIndex * 2 + 1;
    const pRight = spreadIndex * 2 + 2;

    // Running Page Numbers
    ctx.font = 'bold 16px "Cinzel", "Georgia", serif';
    ctx.fillStyle = '#8C6840';
    ctx.textAlign = 'center';
    ctx.fillText(`— ${pLeft} —`, 260, 925);
    ctx.fillText(`— ${pRight} —`, 764, 925);

    if (spreadIndex === 0) {
      // ================= SPREAD 0 (PAGES 1 & 2) =================
      // Left Page (Page 1): Catalog Proclamation, ISBN, Barcode, Senate Seal
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('UNIVERSITY ACADEMIC REGISTRY', 260, 105);

      ctx.font = 'bold 24px "Cinzel", serif';
      ctx.fillStyle = '#1A080F';
      ctx.fillText('CATALOG PASS', 260, 180);

      ctx.font = 'bold 15px monospace';
      ctx.fillStyle = '#781D2E';
      ctx.fillText(`SHELF: ${book.shelf || 'MAIN STACKS'}`, 260, 220);
      ctx.fillText(`ISBN: ${book.isbn || '978-0000000000'}`, 260, 245);
      ctx.fillText(`SUBJECT: ${(book.category || 'ACADEMIC').toUpperCase()}`, 260, 270);

      // Barcode graphic
      ctx.fillStyle = '#1A080F';
      const bX = 140;
      for (let bx = 0; bx < 240; bx += 6) {
        const w = (bx % 12 === 0 || bx % 18 === 0) ? 3 : 1.5;
        ctx.fillRect(bX + bx, 305, w, 50);
      }
      ctx.font = '12px monospace';
      ctx.fillText('* SMART-LIB-LOAN-PASS-2026 *', 260, 375);

      // Academic Senate Proclamation
      ctx.font = 'italic 16px "Georgia", serif';
      ctx.fillStyle = '#34121A';
      ctx.fillText('This volume is cataloged under Academic Senate', 260, 430);
      ctx.fillText('Regulation §3.1 for university scholar checkout.', 260, 455);
      ctx.fillText('Authorized loan duration: 14 calendar days.', 260, 480);

      // Official Stamp
      ctx.strokeStyle = '#781D2E';
      ctx.lineWidth = 3;
      ctx.strokeRect(120, 540, 280, 80);
      ctx.font = 'bold 16px "Cinzel", sans-serif';
      ctx.fillStyle = '#781D2E';
      ctx.fillText('VERIFIED ACADEMIC HOLDING', 260, 575);
      ctx.fillText('OFFICIAL SENATE SEAL ★', 260, 600);

      // Right Page (Page 2): Chapter I: Foundations, Title, Author, Drop Cap, Synopsis
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.fillText('CHAPTER I: THEORETICAL PRINCIPLES', 764, 105);

      ctx.font = 'bold 26px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#1A080F';
      const titleSnippet = (book.title || 'ACADEMIC STUDY').length > 28 
        ? (book.title.substring(0, 26) + '...')
        : book.title;
      ctx.fillText(titleSnippet, 764, 175);

      ctx.font = 'italic 17px "Georgia", serif';
      ctx.fillStyle = '#5A3840';
      ctx.fillText(`By ${book.author || 'University Faculty'}`, 764, 210);

      // Drop Cap "I"
      ctx.font = 'bold 64px "Cinzel", "Times New Roman", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'left';
      ctx.fillText('I', 584, 305);

      // Academic Synopsis Paragraph
      ctx.font = '16px "Georgia", serif';
      ctx.fillStyle = '#260B12';
      const descText = book.desc || "The definitive academic textbook exploring theoretical foundations, computational proofs, representation models, and rigorous algorithmic verification within modern computer science.";
      const words = descText.split(' ');
      let curLine = '';
      let pLines = [];
      words.forEach(w => {
        const test = curLine ? `${curLine} ${w}` : w;
        if (ctx.measureText(test).width > 340) {
          pLines.push(curLine);
          curLine = w;
        } else {
          curLine = test;
        }
      });
      pLines.push(curLine);

      pLines.forEach((l, idx) => {
        const lx = (idx === 0) ? 624 : 584;
        ctx.fillText(l, lx, 275 + (idx * 28));
      });

      // Theorem Quote Box
      const quoteY = 285 + (pLines.length * 28) + 30;
      ctx.fillStyle = 'rgba(120, 29, 46, 0.08)';
      ctx.fillRect(584, quoteY, 360, 110);
      ctx.strokeStyle = '#781D2E';
      ctx.lineWidth = 3;
      ctx.strokeRect(584, quoteY, 4, 110);

      ctx.font = 'italic 15px "Georgia", serif';
      ctx.fillStyle = '#48121E';
      ctx.fillText('“Knowledge is the foundation of institutional', 598, quoteY + 35);
      ctx.fillText('scholarship, manifesting into transformative proof.”', 598, quoteY + 62);
      ctx.font = 'bold 13px "Cinzel", sans-serif';
      ctx.fillStyle = '#781D2E';
      ctx.fillText('— UNIVERSITY ACADEMIC SENATE', 598, quoteY + 92);

    } else if (spreadIndex === 1) {
      // ================= SPREAD 1 (PAGES 3 & 4) =================
      // Left Page (Page 3): Mathematical Formulations & Theorem Proofs
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('CHAPTER II: MATHEMATICAL FORMULATIONS', 260, 105);

      ctx.font = 'bold 20px "Cinzel", serif';
      ctx.fillStyle = '#1A080F';
      ctx.fillText('Theorem 2.1 (Convergence Bounds)', 260, 170);

      // Mathematical Equations
      ctx.fillStyle = 'rgba(120, 29, 46, 0.06)';
      ctx.fillRect(80, 200, 360, 120);
      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1;
      ctx.strokeRect(80, 200, 360, 120);

      ctx.font = 'italic 18px "Georgia", "Times New Roman", serif';
      ctx.fillStyle = '#1A080F';
      ctx.fillText('L(θ) = - ∑ y_i · log p_θ(x_i) + λ ‖θ‖²', 260, 245);
      ctx.fillText('∇_θ J(θ) = E_x [ ∇_θ log p_θ(x) ]', 260, 285);

      ctx.font = '15px "Georgia", serif';
      ctx.fillStyle = '#260B12';
      ctx.fillText('Under Lipschitz continuous gradients, iterative descent', 260, 355);
      ctx.fillText('guarantees quadratic convergence to local optima:', 260, 380);

      ctx.font = 'bold 17px monospace';
      ctx.fillStyle = '#781D2E';
      ctx.fillText('‖θ_{t+1} - θ*‖ ≤ γ · ‖θ_t - θ*‖²', 260, 420);

      ctx.font = 'bold 20px "Cinzel", serif';
      ctx.fillStyle = '#1A080F';
      ctx.fillText('Lemma 2.3 (Complexity Bounds)', 260, 490);

      ctx.font = '16px monospace';
      ctx.fillStyle = '#260B12';
      ctx.fillText('T(N) = 2 · T(N/2) + O(N)', 260, 530);
      ctx.font = 'bold 18px monospace';
      ctx.fillStyle = '#781D2E';
      ctx.fillText('⇒  T(N) = O(N · log N)', 260, 565);

      // Right Page (Page 4): Architecture Diagram & Flowchart
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM ARCHITECTURE & METHODOLOGY', 764, 105);

      // Visual Flowchart Diagram Box
      const flowBox = (y, label, color) => {
        ctx.fillStyle = color;
        ctx.fillRect(634, y, 260, 48);
        ctx.strokeStyle = '#781D2E';
        ctx.lineWidth = 2;
        ctx.strokeRect(634, y, 260, 48);
        ctx.font = 'bold 15px "Cinzel", sans-serif';
        ctx.fillStyle = '#1A080F';
        ctx.fillText(label, 764, y + 30);
      };

      const flowArrow = (y) => {
        ctx.strokeStyle = '#781D2E';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(764, y); ctx.lineTo(764, y + 20);
        ctx.lineTo(758, y + 14); ctx.moveTo(764, y + 20); ctx.lineTo(770, y + 14);
        ctx.stroke();
      };

      flowBox(170, 'INPUT FEATURE TENSORS', 'rgba(255, 209, 102, 0.25)');
      flowArrow(218);
      flowBox(244, 'LATENT EMBEDDING SPACE', 'rgba(56, 189, 248, 0.2)');
      flowArrow(292);
      flowBox(318, 'MULTI-HEAD ATTENTION', 'rgba(167, 139, 250, 0.25)');
      flowArrow(366);
      flowBox(392, 'VERIFIED CLASSIFIER HEAD', 'rgba(16, 185, 129, 0.25)');

      // Properties Table
      ctx.fillStyle = '#1A080F';
      ctx.font = 'bold 16px "Cinzel", serif';
      ctx.fillText('ARCHITECTURAL METRICS', 764, 485);

      ctx.strokeStyle = '#D4AF37';
      ctx.lineWidth = 1;
      ctx.strokeRect(584, 505, 360, 130);

      ctx.font = '14px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('PARAMETER PRECISION: FP16 / BF16', 600, 535);
      ctx.fillText('MAX SEQUENCE LENGTH: 8192 TOKENS', 600, 565);
      ctx.fillText('PARALLEL EFFICIENCY: 94.2% WEAK SCALING', 600, 595);
      ctx.fillText('EMPIRICAL ACCURACY:  98.7% TOP-1 VALIDATION', 600, 620);

    } else {
      // ================= SPREAD 2 (PAGES 5 & 6) =================
      // Left Page (Page 5): Academic Practicum & Laboratory Protocol
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('CHAPTER III: ACADEMIC PRACTICUM', 260, 105);

      ctx.font = 'bold 20px "Cinzel", serif';
      ctx.fillStyle = '#1A080F';
      ctx.fillText('Laboratory Protocol §3.4', 260, 170);

      ctx.font = '15px "Georgia", serif';
      ctx.fillStyle = '#260B12';
      ctx.fillText('Scholars must replicate the algorithmic baseline', 260, 210);
      ctx.fillText('using the university distributed computing cluster.', 260, 235);

      ctx.fillStyle = '#1A080F';
      ctx.fillRect(80, 260, 360, 160);
      ctx.font = '14px monospace';
      ctx.fillStyle = '#FFD166';
      ctx.textAlign = 'left';
      ctx.fillText('# UNIVERSITY CLUSTER EXECUTION', 95, 290);
      ctx.fillStyle = '#38BDF8';
      ctx.fillText('$ srun --nodes=4 --gpus=8 \\', 95, 320);
      ctx.fillText('    python -m lib.evaluate \\', 95, 350);
      ctx.fillText('    --checkpoint=best_model.pt', 95, 380);
      ctx.fillStyle = '#10B981';
      ctx.fillText('[SUCCESS] Loss: 0.042 | 60 FPS', 95, 410);

      ctx.font = 'bold 16px "Cinzel", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('VERIFICATION CHECKLIST', 260, 465);

      ctx.font = '15px "Georgia", serif';
      ctx.fillStyle = '#260B12';
      ctx.textAlign = 'left';
      ctx.fillText('☑ Unit tests pass 100% without mocks', 100, 500);
      ctx.fillText('☑ Zero external network CDN leaks', 100, 530);
      ctx.fillText('☑ Offline WebGL 60 FPS certified', 100, 560);
      ctx.fillText('☑ Borrowing quotas strictly verified', 100, 590);

      // Right Page (Page 6): Peer Citations & Senate Checkout Clearance
      ctx.font = 'bold 18px "Cinzel", "Georgia", serif';
      ctx.fillStyle = '#781D2E';
      ctx.textAlign = 'center';
      ctx.fillText('SCHOLARLY CITATIONS & CITATIONS', 764, 105);

      ctx.font = '14px "Georgia", serif';
      ctx.fillStyle = '#260B12';
      ctx.textAlign = 'left';
      ctx.fillText('[1] IEEE Transactions on Neural Networks, Vol. 37,', 590, 165);
      ctx.fillText('    pp. 1420–1435, Academic Press 2026.', 590, 188);
      ctx.fillText('[2] ACM Computing Surveys, "Foundational Algorithms', 590, 225);
      ctx.fillText('    in Modern Distributed Systems", Art. 42.', 590, 248);
      ctx.fillText('[3] MIT Press, Monograph on Computational Proofs,', 590, 285);
      ctx.fillText('    Cambridge, Massachusetts, 4th Edition.', 590, 308);

      // Final Circulation Clearance Stamp
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(620, 440, 288, 120);

      ctx.font = 'bold 20px "Cinzel", sans-serif';
      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'center';
      ctx.fillText('★ CIRCULATION APPROVED ★', 764, 480);
      ctx.font = 'bold 15px monospace';
      ctx.fillText('SMART LIBRARY PASS #2026', 764, 510);
      ctx.font = '14px "Georgia", serif';
      ctx.fillText('READY FOR STUDENT BORROWING', 764, 540);
    }

    return new THREE.CanvasTexture(canvas);
  }

  initBookInspector() {
    this.inspectorContainer = document.getElementById('book-inspector-canvas-container');
    if (!this.inspectorContainer || typeof THREE === 'undefined') return;

    // Inspector Sub-Scene
    this.inspectorScene = new THREE.Scene();
    this.inspectorScene.background = new THREE.Color(0x070D18);

    const aspect = (this.inspectorContainer.clientWidth || 400) / (this.inspectorContainer.clientHeight || 440);
    this.inspectorCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 50);
    this.inspectorCamera.position.set(0, 0.8, 6.2);

    this.inspectorRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const iw = this.inspectorContainer.clientWidth || 400;
    const ih = this.inspectorContainer.clientHeight || 440;
    this.inspectorRenderer.setSize(iw, ih);
    this.inspectorRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.inspectorRenderer.shadowMap.enabled = true;
    this.inspectorContainer.innerHTML = '';
    this.inspectorContainer.appendChild(this.inspectorRenderer.domElement);

    if (typeof THREE.OrbitControls !== 'undefined') {
      this.inspectorControls = new THREE.OrbitControls(this.inspectorCamera, this.inspectorRenderer.domElement);
      this.inspectorControls.enableDamping = true;
      this.inspectorControls.dampingFactor = 0.08;
      this.inspectorControls.minDistance = 2.5;
      this.inspectorControls.maxDistance = 10;
    }

    // Inspector Lighting
    const amb = new THREE.AmbientLight(0xFFEEDD, 0.85);
    this.inspectorScene.add(amb);

    const keyLight = new THREE.SpotLight(0x38BDF8, 1.6, 20, Math.PI / 3, 0.3);
    keyLight.position.set(4, 6, 6);
    this.inspectorScene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xA4C8E8, 0.75);
    rimLight.position.set(-4, -2, -4);
    this.inspectorScene.add(rimLight);

    // Click & Touch on Book Inspector Canvas:
    // - Click closed book: opens cover
    // - Click right page: turns page forward
    // - Click left page: turns page backward
    if (this.inspectorRenderer && this.inspectorRenderer.domElement) {
      const dom = this.inspectorRenderer.domElement;
      let startX = 0, startY = 0;
      dom.addEventListener('mousedown', (e) => {
        startX = e.clientX;
        startY = e.clientY;
      });
      dom.addEventListener('mouseup', (e) => {
        const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
        if (dist < 8 && !this.isPageTurning) {
          const rect = dom.getBoundingClientRect();
          const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;
          this.handleInspectorCanvasHit(mouseX, mouseY);
        }
      });

      let touchStartX = 0, touchStartY = 0, touchStartTime = 0;
      dom.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length === 1) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
          touchStartTime = Date.now();
        }
      }, { passive: true });
      dom.addEventListener('touchend', (e) => {
        if (e.changedTouches && e.changedTouches.length === 1) {
          const t = e.changedTouches[0];
          const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
          const dt = Date.now() - touchStartTime;
          if (dist < 12 && dt < 400 && !this.isPageTurning) {
            const rect = dom.getBoundingClientRect();
            const mouseX = ((t.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((t.clientY - rect.top) / rect.height) * 2 + 1;
            this.handleInspectorCanvasHit(mouseX, mouseY);
          }
        }
      }, { passive: true });
    }

    this.inspectorInitialized = true;
  }

  handleInspectorCanvasHit(ndcX, ndcY) {
    if (!this.inspectorCamera || this.isPageTurning) return;
    const ray = new THREE.Raycaster();
    ray.setFromCamera(new THREE.Vector2(ndcX, ndcY), this.inspectorCamera);

    if (!this.isCoverOpen) {
      // If cover is closed, clicking anywhere on the book model opens it
      if (this.inspectorBookGroup) {
        const hits = ray.intersectObjects(this.inspectorBookGroup.children, true);
        if (hits && hits.length > 0) {
          this.toggleBookCover();
        }
      }
    } else {
      // Cover is open: check page flip hit
      if (this.restingPageMesh) {
        const hits = ray.intersectObject(this.restingPageMesh);
        if (hits && hits.length > 0) {
          const localX = hits[0].point.x;
          if (localX > 0.04) {
            this.nextPage();
          } else {
            this.prevPage();
          }
        }
      }
    }
  }

  inspectBook(bookId) {
    if (!this.inspectorInitialized) {
      this.initBookInspector();
    }

    const books = (typeof SmartLibState !== 'undefined') ? SmartLibState.getBooks() : [];
    const book = books.find(b => b.id === bookId) || {
      id: bookId,
      title: "Deep Learning & Neural Architectures",
      author: "Goodfellow, Bengio, Courville",
      category: "AI & ML",
      isbn: "978-0262035613",
      copies: 5,
      available: 3,
      shelf: "FL-2 / AISLE-4 / RACK-A1",
      desc: "The definitive textbook on deep mathematical foundations of neural networks, backpropagation, and representation learning."
    };

    this.currentInspectedBookId = book.id;

    // Update Modal DOM Content
    const catBadge = document.getElementById('modal-book-category');
    const titleEl = document.getElementById('modal-book-title');
    const authorEl = document.getElementById('modal-book-author');
    const shelfEl = document.getElementById('modal-book-shelf');
    const isbnEl = document.getElementById('modal-book-isbn');
    const copiesEl = document.getElementById('modal-book-copies');
    const descEl = document.getElementById('modal-book-desc');
    const borrowBtn = document.getElementById('modal-book-borrow-btn');

    if (catBadge) catBadge.textContent = book.category;
    if (titleEl) titleEl.textContent = book.title;
    if (authorEl) authorEl.textContent = `By ${book.author}`;
    if (shelfEl) shelfEl.textContent = book.shelf;
    if (isbnEl) isbnEl.textContent = book.isbn;
    if (copiesEl) copiesEl.textContent = `${book.available} / ${book.copies} Available`;
    if (descEl) descEl.textContent = book.desc;

    if (borrowBtn) {
      if (book.available === 0) {
        borrowBtn.textContent = 'Waitlist Title';
        borrowBtn.disabled = true;
      } else {
        borrowBtn.textContent = '⚡ Borrow This Title';
        borrowBtn.disabled = false;
      }
    }

    // Build or Rebuild 3D Hardcover Book Model
    this.build3DHardcoverModel(book);

    // Open Modal
    const modal = document.getElementById('modal-3d-book');
    if (modal) modal.classList.add('active');

    // Handle initial resize of inspector canvas
    setTimeout(() => {
      if (this.inspectorRenderer && this.inspectorContainer) {
        const w = this.inspectorContainer.clientWidth;
        const h = this.inspectorContainer.clientHeight;
        if (w > 0 && h > 0) {
          this.inspectorCamera.aspect = w / h;
          this.inspectorCamera.updateProjectionMatrix();
          this.inspectorRenderer.setSize(w, h);
        }
      }
    }, 60);

    // Start inspector render loop
    if (this.inspectorFrameId) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.inspectorFrameId);
      }
      this.inspectorFrameId = null;
    }
    this.isInspectorAnimating = true;
    this.animateInspector();

    if (typeof SoundFX !== 'undefined' && SoundFX.click) {
      SoundFX.click();
    }
  }

  build3DHardcoverModel(book) {
    if (!this.inspectorScene) return;

    // Remove old book group and dispose materials
    if (this.inspectorBookGroup) {
      if (typeof this.inspectorBookGroup.traverse === 'function') {
        this.inspectorBookGroup.traverse(child => {
          if (child.isMesh) {
            if (child.geometry && child.geometry.dispose) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(m => { if (m.map && m.map.dispose) m.map.dispose(); if (m.dispose) m.dispose(); });
              } else {
                if (child.material.map && child.material.map.dispose) child.material.map.dispose();
                if (child.material.dispose) child.material.dispose();
              }
            }
          }
        });
      }
      this.inspectorScene.remove(this.inspectorBookGroup);
    }

    this.inspectorBookGroup = new THREE.Group();
    this.isCoverOpen = false;
    this.isPageTurning = false;
    this.turningPageProgress = 0;
    this.inspectorCurrentSpread = 0;
    this.inspectorCurrentPage = 1;

    // Textures
    const coverTex = this.createBookCoverTexture(book);
    const spineTex = this.createBookSpineTexture(book);
    const endpaperTex = this.createBookEndpaperTexture();
    this.endpaperTexture = endpaperTex;

    // Generate 3 spreads (6 pages total)
    this.spreadTextures = [0, 1, 2].map(idx => this.createBookSpreadTexture(book, idx));

    const coverMat = new THREE.MeshStandardMaterial({
      map: coverTex,
      roughness: 0.28,
      metalness: 0.25
    });
    const spineMat = new THREE.MeshStandardMaterial({
      map: spineTex,
      roughness: 0.35,
      metalness: 0.18
    });
    const backCoverMat = new THREE.MeshStandardMaterial({
      color: 0x361019,
      roughness: 0.45,
      metalness: 0.12
    });
    const endpaperMat = new THREE.MeshStandardMaterial({
      map: endpaperTex,
      roughness: 0.55
    });
    const goldRibbonMat = new THREE.MeshStandardMaterial({
      color: 0x38BDF8,
      metalness: 0.88,
      roughness: 0.22
    });

    // 1. Back Cover
    const backCover = new THREE.Mesh(new THREE.BoxGeometry(2.4, 3.4, 0.06), backCoverMat);
    backCover.position.set(0, 0, -0.25);
    this.inspectorBookGroup.add(backCover);

    // 2. Resting Page Block with active spread on front (+z)
    const pageMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8, roughness: 0.75, metalness: 0.1 }), // right
      new THREE.MeshStandardMaterial({ color: 0x2C1018, roughness: 0.8 }),                   // left (gutter)
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8, roughness: 0.75, metalness: 0.1 }), // top
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8, roughness: 0.75, metalness: 0.1 }), // bottom
      new THREE.MeshStandardMaterial({ map: this.spreadTextures[0], roughness: 0.6 }),       // front (+z)
      new THREE.MeshStandardMaterial({ color: 0x361019, roughness: 0.8 })                    // back (-z)
    ];
    const pages = new THREE.Mesh(new THREE.BoxGeometry(2.28, 3.25, 0.44), pageMaterials);
    pages.position.set(0.04, 0, 0);
    pages.userData = { type: 'restingPages' };
    this.restingPageMesh = pages;
    this.inspectorBookGroup.add(pages);

    // 3. Curved Spine on the Left
    const spine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 3.4, 0.54), spineMat);
    spine.position.set(-1.18, 0, 0);
    this.inspectorBookGroup.add(spine);

    // 4. Dual-faced Front Cover with hinge on spine
    const frontCoverPivot = new THREE.Group();
    frontCoverPivot.position.set(-1.18, 0, 0.25);

    // Front Cover Outside
    const frontCoverOutside = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.4, 0.03),
      coverMat
    );
    frontCoverOutside.position.set(1.2, 0, 0.015);
    frontCoverPivot.add(frontCoverOutside);

    // Front Cover Inside (Endpaper Bookplate)
    const frontCoverInside = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 3.4, 0.03),
      [
        backCoverMat, backCoverMat, backCoverMat, backCoverMat,
        backCoverMat, endpaperMat
      ]
    );
    frontCoverInside.position.set(1.2, 0, -0.015);
    frontCoverPivot.add(frontCoverInside);

    this.inspectorCoverMesh = frontCoverPivot;
    this.inspectorBookGroup.add(frontCoverPivot);

    // 5. 3D Interactive Turning Page Sheet
    const turningPagePivot = new THREE.Group();
    turningPagePivot.position.set(0.04, 0, 0.23); // centered on spine gutter

    const turningGeo = new THREE.BoxGeometry(1.13, 3.24, 0.008);
    this.turningPageFrontMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    this.turningPageBackMat = new THREE.MeshStandardMaterial({ roughness: 0.6 });
    const turningMaterials = [
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8 }),
      new THREE.MeshStandardMaterial({ color: 0x2C1018 }),
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8 }),
      new THREE.MeshStandardMaterial({ color: 0xF2E9D8 }),
      this.turningPageFrontMat, // +z (front)
      this.turningPageBackMat   // -z (back)
    ];
    const turningMesh = new THREE.Mesh(turningGeo, turningMaterials);
    turningMesh.position.set(0.565, 0, 0); // extend to the right of the gutter pivot
    turningPagePivot.add(turningMesh);

    turningPagePivot.visible = false;
    this.turningPageGroup = turningPagePivot;
    this.inspectorBookGroup.add(turningPagePivot);

    // 6. Golden Satin Bookmark Ribbon
    const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.4, 0.02), goldRibbonMat);
    ribbon.position.set(0.04, -1.8, 0.1);
    ribbon.rotation.z = 0.08;
    this.inspectorBookGroup.add(ribbon);

    // Center and angle book for beautiful showcase
    this.inspectorBookGroup.rotation.y = -0.35;
    this.inspectorBookGroup.rotation.x = 0.15;
    this.inspectorScene.add(this.inspectorBookGroup);

    this.updateInspectorHUD();
  }

  nextPage() {
    if (!this.isCoverOpen) {
      this.toggleBookCover();
      return;
    }
    if (this.inspectorCurrentSpread >= this.inspectorTotalSpreads - 1 || this.isPageTurning) return;

    this.isPageTurning = true;
    this.turnDirection = 1;
    this.turningPageProgress = 0;

    // Front shows current right page, Back shows next left page
    if (this.turningPageGroup) {
      if (this.spreadTextures[this.inspectorCurrentSpread]) {
        this.turningPageFrontMat.map = this.spreadTextures[this.inspectorCurrentSpread];
        this.turningPageFrontMat.needsUpdate = true;
      }
      if (this.spreadTextures[this.inspectorCurrentSpread + 1]) {
        this.turningPageBackMat.map = this.spreadTextures[this.inspectorCurrentSpread + 1];
        this.turningPageBackMat.needsUpdate = true;
      }
      this.turningPageGroup.rotation.y = 0;
      this.turningPageGroup.visible = true;
    }

    if (typeof SoundFX !== 'undefined' && SoundFX.pageFlip) {
      SoundFX.pageFlip();
    } else if (typeof SoundFX !== 'undefined' && SoundFX.click) {
      SoundFX.click();
    }
  }

  prevPage() {
    if (!this.isCoverOpen) {
      this.toggleBookCover();
      return;
    }
    if (this.inspectorCurrentSpread <= 0 || this.isPageTurning) return;

    this.isPageTurning = true;
    this.turnDirection = -1;
    this.turningPageProgress = 0;

    // Front shows previous right page, Back shows current left page
    if (this.turningPageGroup) {
      if (this.spreadTextures[this.inspectorCurrentSpread - 1]) {
        this.turningPageFrontMat.map = this.spreadTextures[this.inspectorCurrentSpread - 1];
        this.turningPageFrontMat.needsUpdate = true;
      }
      if (this.spreadTextures[this.inspectorCurrentSpread]) {
        this.turningPageBackMat.map = this.spreadTextures[this.inspectorCurrentSpread];
        this.turningPageBackMat.needsUpdate = true;
      }
      this.turningPageGroup.rotation.y = -Math.PI;
      this.turningPageGroup.visible = true;
    }

    if (typeof SoundFX !== 'undefined' && SoundFX.pageFlip) {
      SoundFX.pageFlip();
    } else if (typeof SoundFX !== 'undefined' && SoundFX.click) {
      SoundFX.click();
    }
  }

  setPage(spreadIdx) {
    this.inspectorCurrentSpread = Math.max(0, Math.min(this.inspectorTotalSpreads - 1, spreadIdx));
    this.inspectorCurrentPage = this.inspectorCurrentSpread * 2 + 1;
    if (this.restingPageMesh && this.spreadTextures[this.inspectorCurrentSpread]) {
      this.restingPageMesh.material[4].map = this.spreadTextures[this.inspectorCurrentSpread];
      this.restingPageMesh.material[4].needsUpdate = true;
    }
    this.updateInspectorHUD();
  }

  updateInspectorHUD() {
    const counterEl = document.getElementById('inspector-page-counter');
    const prevBtn = document.getElementById('btn-prev-page');
    const nextBtn = document.getElementById('btn-next-page');
    const btnText = document.getElementById('cover-btn-text');
    const btnIcon = document.getElementById('cover-btn-icon');

    if (btnText) btnText.textContent = this.isCoverOpen ? 'Close Cover' : 'Open Cover';
    if (btnIcon) btnIcon.textContent = this.isCoverOpen ? '📕' : '📖';

    const pStart = this.inspectorCurrentSpread * 2 + 1;
    const pEnd = this.inspectorCurrentSpread * 2 + 2;

    if (counterEl) {
      counterEl.textContent = `Pages ${pStart}–${pEnd} of 6`;
    }
    if (prevBtn) {
      prevBtn.disabled = (this.inspectorCurrentSpread <= 0);
    }
    if (nextBtn) {
      nextBtn.disabled = (this.inspectorCurrentSpread >= this.inspectorTotalSpreads - 1);
    }
  }

  toggleBookCover() {
    if (!this.inspectorCoverMesh) return;
    this.isCoverOpen = !this.isCoverOpen;

    this.updateInspectorHUD();

    if (typeof SoundFX !== 'undefined' && SoundFX.click) {
      SoundFX.click();
    }
  }

  resetBookRotation() {
    if (this.inspectorBookGroup) {
      this.inspectorBookGroup.rotation.set(0.15, -0.35, 0);
    }
    if (this.inspectorCamera) {
      this.inspectorCamera.position.set(0, 0.8, 6.2);
    }
    if (this.inspectorControls) {
      this.inspectorControls.target.set(0, 0, 0);
    }
  }

  closeBookInspector() {
    const modal = document.getElementById('modal-3d-book');
    if (modal) modal.classList.remove('active');
    this.isInspectorAnimating = false;
    if (this.inspectorFrameId) {
      if (typeof cancelAnimationFrame !== 'undefined') {
        cancelAnimationFrame(this.inspectorFrameId);
      }
      this.inspectorFrameId = null;
    }
  }

  borrowCurrentInspectedBook() {
    if (typeof handleBorrowBook === 'function' && this.currentInspectedBookId) {
      handleBorrowBook(this.currentInspectedBookId);
      this.closeBookInspector();
    }
  }

  animateInspector() {
    if (!this.isInspectorAnimating) return;
    if (typeof requestAnimationFrame !== 'undefined') {
      this.inspectorFrameId = requestAnimationFrame(() => this.animateInspector());
    }

    // Cover open / close easing
    if (this.inspectorCoverMesh) {
      const targetAngle = this.isCoverOpen ? -Math.PI * 0.92 : 0;
      this.inspectorCoverMesh.rotation.y = THREE.MathUtils.lerp(
        this.inspectorCoverMesh.rotation.y,
        targetAngle,
        0.1
      );
    }

    // Interactive 3D Page Turn Animation
    if (this.isPageTurning && this.turningPageGroup) {
      this.turningPageProgress += 0.055;
      const p = Math.min(1.0, this.turningPageProgress);
      const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

      if (this.turnDirection === 1) {
        // Turning forward from 0 to -PI
        this.turningPageGroup.rotation.y = -Math.PI * ease;
      } else {
        // Turning backward from -PI to 0
        this.turningPageGroup.rotation.y = -Math.PI * (1 - ease);
      }

      if (p >= 1.0) {
        this.isPageTurning = false;
        this.inspectorCurrentSpread += this.turnDirection;
        this.inspectorCurrentPage = this.inspectorCurrentSpread * 2 + 1;
        this.turningPageGroup.visible = false;
        this.turningPageGroup.rotation.y = 0;

        if (this.restingPageMesh && this.spreadTextures[this.inspectorCurrentSpread]) {
          this.restingPageMesh.material[4].map = this.spreadTextures[this.inspectorCurrentSpread];
          this.restingPageMesh.material[4].needsUpdate = true;
        }
        this.updateInspectorHUD();
      }
    }

    if (this.inspectorControls) {
      this.inspectorControls.update();
    }

    if (this.inspectorRenderer && this.inspectorScene && this.inspectorCamera) {
      this.inspectorRenderer.render(this.inspectorScene, this.inspectorCamera);
    }
  }

  // ==========================================
  // 14. EFFICIENCY OBSERVERS (60 FPS & 0% Idle CPU)
  // ==========================================

  setupEfficiencyObservers() {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    // 1. Observe Campus Canvas Viewport
    if (this.container) {
      if (this.campusObserver && typeof this.campusObserver.disconnect === 'function') {
        this.campusObserver.disconnect();
      }
      this.campusObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isCampusVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      this.campusObserver.observe(this.container);
    }

    // 2. Observe Hero 3D Canvas
    if (this.heroContainer) {
      if (this.heroObserver && typeof this.heroObserver.disconnect === 'function') {
        this.heroObserver.disconnect();
      }
      this.heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          this.isHeroVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });
      this.heroObserver.observe(this.heroContainer);
    }

    // 3. Tab Visibility (Pause all rendering when minimized)
    if (typeof document !== 'undefined') {
      if (this._onVisibilityChange) {
        document.removeEventListener('visibilitychange', this._onVisibilityChange);
      }
      this._onVisibilityChange = () => {
        this.isTabActive = !document.hidden;
      };
      document.addEventListener('visibilitychange', this._onVisibilityChange);
    }
  }

  // ==========================================
  // 15. MAIN 60 FPS CAMPUS ANIMATION LOOP
  // ==========================================

  animate() {
    if (this.isDestroyed) return;
    if (typeof requestAnimationFrame !== 'undefined') {
      this.animationFrameId = requestAnimationFrame(() => this.animate());
    }

    // Pauses GPU/CPU rendering when campus canvas is scrolled offscreen or tab is backgrounded
    if (!this.isCampusVisible || !this.isTabActive) return;

    const delta = this.clock ? this.clock.getDelta() : 0.016;
    const time = this.clock ? this.clock.getElapsedTime() : Date.now() * 0.001;

    // 1. Smooth Camera Transition with Cubic Easing
    if (this.isTransitioning && this.targetCameraPos && this.targetLookAt) {
      this.transitionProgress += delta / this.transitionDuration;
      const t = Math.min(this.transitionProgress, 1.0);
      const ease = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

      this.camera.position.lerpVectors(this.startCameraPos, this.targetCameraPos, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(this.startLookAt, this.targetLookAt, ease);
      }

      if (t >= 1.0) {
        this.isTransitioning = false;
      }
    }

    // 2. Rotate Digital Hologram Emblem above Circulation Desk
    if (this.hologramEmblem) {
      this.hologramEmblem.rotation.y += delta * 0.6;
      this.hologramEmblem.position.y = 3.8 + Math.sin(time * 2) * 0.08;
    }

    // 3. Rotate 3D Shelf Holographic Beacons
    if (this.shelfBanners && this.shelfBanners.length > 0) {
      this.shelfBanners.forEach((beacon, idx) => {
        beacon.rotation.y += delta * (0.8 + idx * 0.1);
        beacon.position.y = 5.8 + Math.sin(time * 2.5 + idx) * 0.08;
      });
    }

    // 4. Floating Dust Particles Brownian Motion
    if (this.dustParticles && this.particlePositions) {
      const pos = this.particlePositions;
      const count = pos.length / 3;
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] += this.particleVelocities[i * 3 + 1];
        pos[i * 3] += Math.sin(time + i) * 0.003;
        pos[i * 3 + 2] += Math.cos(time + i) * 0.003;

        // Reset if reached ceiling
        if (pos[i * 3 + 1] > 16.0) {
          pos[i * 3 + 1] = 0.8;
          pos[i * 3] = (Math.random() - 0.5) * 55;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 55;
        }
      }
      this.dustParticles.geometry.attributes.position.needsUpdate = true;
    }

    // 5b. Animate Physical Shelf Books Extraction / Retraction with Spring Dynamics
    if (this.animatingShelfBooks && this.animatingShelfBooks.size > 0) {
      this.animatingShelfBooks.forEach(bookMesh => {
        const d = bookMesh.userData;
        if (!d) return;
        if (d.isExtracting) {
          const targetZ = d.extractedPos.z;
          const spring = this.springDamp(bookMesh.position.z, targetZ, d.springVelocity || 0, this.springOmega, this.springZeta, delta);
          bookMesh.position.z = spring.pos;
          d.springVelocity = spring.vel;

          // Glowing pulse on extracted book
          if (bookMesh.material && bookMesh.material.emissive) {
            bookMesh.material.emissive.setHex(0x38BDF8);
            bookMesh.material.emissiveIntensity = 0.75 + Math.sin(time * 6) * 0.2;
          }

          if (Math.abs(bookMesh.position.z - targetZ) < 0.005 && Math.abs(d.springVelocity) < 0.01) {
            bookMesh.position.z = targetZ;
            d.isExtracting = false;
            d.isExtracted = true;
            d.springVelocity = 0;
            this.animatingShelfBooks.delete(bookMesh);
          }
        } else if (d.isRetracting) {
          const targetZ = d.originalPos.z;
          const spring = this.springDamp(bookMesh.position.z, targetZ, d.springVelocity || 0, this.springOmega * 1.2, this.springZeta, delta);
          bookMesh.position.z = spring.pos;
          d.springVelocity = spring.vel;

          if (Math.abs(bookMesh.position.z - targetZ) < 0.005 && Math.abs(d.springVelocity) < 0.01) {
            bookMesh.position.copy(d.originalPos);
            d.isRetracting = false;
            d.isExtracted = false;
            d.springVelocity = 0;
            if (bookMesh.material && bookMesh.material.emissive) {
              bookMesh.material.emissive.setHex(d.originalEmissive || 0x000000);
              bookMesh.material.emissiveIntensity = d.originalEmissiveIntensity || 0;
            }
            this.animatingShelfBooks.delete(bookMesh);
          }
        }
      });
    }

    // 5c. Camera Interior Boundary Collision Clamps
    if (this.camera && this.controls) {
      if (typeof THREE !== 'undefined' && THREE.MathUtils && THREE.MathUtils.clamp) {
        this.camera.position.x = THREE.MathUtils.clamp(this.camera.position.x, -26, 26);
        this.camera.position.y = THREE.MathUtils.clamp(this.camera.position.y, 1.2, 18.0);
        this.camera.position.z = THREE.MathUtils.clamp(this.camera.position.z, -26, 36);
      }
    }

    // 5d. Real-Time Telemetry Tracking & Adaptive Quality Scaling
    this.frameCount++;
    const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    if (this.lastFrameTime) {
      const frameDelta = now - this.lastFrameTime;
      const instantFPS = 1000 / Math.max(1, frameDelta);
      this.fpsHistory.push(instantFPS);
      if (this.fpsHistory.length > 30) this.fpsHistory.shift();
      const avgFPS = Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
      this.currentFPS = avgFPS;

      if (this.frameCount % 90 === 0) {
        this.evaluateAdaptiveQuality(avgFPS);
      }
      if (this.showPerfOverlay && this.frameCount % 10 === 0) {
        this.updatePerfOverlayDisplay();
      }
    }
    this.lastFrameTime = now;

    // 5. Subtle breathing pulse on active study desk status rings
    const reservedSeat = (typeof SmartLibState !== 'undefined') ? SmartLibState.getReservedSeat() : null;
    if (reservedSeat && this.deskMeshes[reservedSeat]) {
      const ring = this.deskMeshes[reservedSeat].userData.statusRing;
      if (ring) {
        const pulse = 1 + Math.sin(time * 4) * 0.12;
        ring.scale.set(pulse, pulse, pulse);
      }
    }

    // 6. Controls update
    if (this.controls) {
      this.controls.update();
    }

    // 7. Render main WebGL scene
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  
  // ==========================================
  // PHYSICAL 3D SHELF BOOK EXTRACTION SYSTEM
  // ==========================================

  extractShelfBook(bookMesh) {
    if (!bookMesh || !bookMesh.userData) return;
    const data = bookMesh.userData;

    if (this.extractedBookMesh && this.extractedBookMesh !== bookMesh) {
      this.retractExtractedBook();
    }

    this.extractedBookMesh = bookMesh;
    data.isExtracting = true;
    data.isRetracting = false;
    this.animatingShelfBooks.add(bookMesh);

    if (bookMesh.material && bookMesh.material.emissive) {
      if (data.originalEmissive === undefined) {
        data.originalEmissive = bookMesh.material.emissive.getHex();
        data.originalEmissiveIntensity = bookMesh.material.emissiveIntensity || 0;
      }
      bookMesh.material.emissive.setHex(0x38BDF8);
      bookMesh.material.emissiveIntensity = 0.9;
    }

    if (typeof SoundFX !== 'undefined' && SoundFX.playBookOpenSound) {
      SoundFX.playBookOpenSound();
    }

    this.updateShelfBookHUD(data);
  }

  retractExtractedBook() {
    if (!this.extractedBookMesh) return;
    const bookMesh = this.extractedBookMesh;
    const data = bookMesh.userData;
    if (data) {
      data.isExtracting = false;
      data.isRetracting = true;
      this.animatingShelfBooks.add(bookMesh);
    }
    this.extractedBookMesh = null;

    const hud = document.getElementById('shelf-book-3d-hud');
    if (hud) {
      hud.style.opacity = '0';
      hud.style.pointerEvents = 'none';
      setTimeout(() => {
        if (!this.extractedBookMesh) hud.style.display = 'none';
      }, 200);
    }
  }

  toggleShelfBookExtraction(bookMesh) {
    if (this.extractedBookMesh === bookMesh && bookMesh.userData && (bookMesh.userData.isExtracted || bookMesh.userData.isExtracting)) {
      this.retractExtractedBook();
    } else {
      this.extractShelfBook(bookMesh);
    }
  }

  updateShelfBookHUD(data) {
    const hud = document.getElementById('shelf-book-3d-hud');
    if (!hud) return;

    const book = data.book || {};
    const badgeEl = document.getElementById('shelf-hud-badge');
    const catEl = document.getElementById('shelf-hud-category');
    const titleEl = document.getElementById('shelf-hud-title');
    const authorEl = document.getElementById('shelf-hud-author');
    const stockEl = document.getElementById('shelf-hud-stock-text');
    const isbnEl = document.getElementById('shelf-hud-isbn');

    if (badgeEl) badgeEl.textContent = `📍 ${data.shelfCode || 'FL-2 / AISLE-1 / RACK-A1'}`;
    if (catEl) catEl.textContent = (data.shelfCategory || 'ACADEMIC CATALOG').toUpperCase();
    if (titleEl) titleEl.textContent = book.title || 'Academic Textbook';
    if (authorEl) authorEl.textContent = book.author ? `By ${book.author}` : '';
    if (stockEl) {
      const avail = (book.availableCopies !== undefined) ? book.availableCopies : 3;
      const total = book.totalCopies || 5;
      stockEl.textContent = `${avail} / ${total} Copies Available`;
      stockEl.style.color = (avail > 0) ? '#10B981' : '#EF4444';
    }
    if (isbnEl) isbnEl.textContent = `ISBN: ${book.isbn || '978-0262035613'}`;

    hud.style.display = 'block';
    hud.style.opacity = '1';
    hud.style.pointerEvents = 'auto';

    const container = document.getElementById('webgl-library-section');
    if (container) {
      const rect = container.getBoundingClientRect();
      const rightX = Math.min(window.innerWidth - 350, Math.max(20, rect.right - 350));
      const bottomY = Math.min(window.innerHeight - 300, Math.max(80, rect.bottom - 290));
      hud.style.left = `${rightX}px`;
      hud.style.top = `${bottomY}px`;
    }
  }

  inspectExtractedBook() {
    if (this.extractedBookMesh && this.extractedBookMesh.userData && this.extractedBookMesh.userData.book) {
      const bookId = this.extractedBookMesh.userData.book.id || 1;
      this.inspectBook(bookId);
    }
  }

  borrowExtractedBook() {
    if (this.extractedBookMesh && this.extractedBookMesh.userData && this.extractedBookMesh.userData.book) {
      const book = this.extractedBookMesh.userData.book;
      if (typeof SmartLibState !== 'undefined' && typeof SmartLibState.borrowBook === 'function') {
        const success = SmartLibState.borrowBook(book.id);
        if (success) {
          if (typeof renderCatalogGrid === 'function') renderCatalogGrid();
          if (typeof renderStudentLoans === 'function') renderStudentLoans();
          if (typeof updateStatsBar === 'function') updateStatsBar();
          if (typeof showToast === 'function') {
            showToast(`✅ Successfully Borrowed: "${book.title}"`);
          }
          if (typeof SoundFX !== 'undefined' && SoundFX.playSuccessChime) {
            SoundFX.playSuccessChime();
          }
          this.retractExtractedBook();
        }
      }
    }
  }

  
  // ==========================================
  // SPRING PHYSICS, ADAPTIVE QUALITY & GLTF PIPELINE
  // ==========================================

  springDamp(current, target, velocity, omega = 14.0, zeta = 0.85, delta = 0.016) {
    const f = 1.0 + 2.0 * delta * zeta * omega;
    const oo = omega * omega;
    const hoo = delta * oo;
    const hhoo = delta * hoo;
    const detInv = 1.0 / (f + hhoo);
    const detX = f * current + delta * velocity + hhoo * target;
    const detV = velocity + hoo * (target - current);
    return { pos: detX * detInv, vel: detV * detInv };
  }

  evaluateAdaptiveQuality(avgFPS) {
    if (!this.renderer) return;
    const isMobile = (typeof window !== 'undefined' && window.innerWidth < 860);
    let nextTier = 'ultra';
    if (isMobile || avgFPS < 35) {
      nextTier = 'mobile';
    } else if (avgFPS < 50) {
      nextTier = 'high';
    } else {
      nextTier = 'ultra';
    }

    if (this.qualityTier !== nextTier) {
      this.qualityTier = nextTier;
      if (nextTier === 'ultra') {
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        if (this.sunMoonLight && this.sunMoonLight.shadow) {
          this.sunMoonLight.shadow.mapSize.width = 1024; this.sunMoonLight.shadow.mapSize.height = 1024;
        }
      } else if (nextTier === 'high') {
        this.renderer.setPixelRatio(1.25);
        if (this.sunMoonLight && this.sunMoonLight.shadow) {
          this.sunMoonLight.shadow.mapSize.width = 512; this.sunMoonLight.shadow.mapSize.height = 512;
        }
      } else {
        this.renderer.setPixelRatio(1.0);
        if (this.sunMoonLight && this.sunMoonLight.shadow) {
          this.sunMoonLight.shadow.mapSize.width = 256; this.sunMoonLight.shadow.mapSize.height = 256;
        }
      }
    }
  }

  togglePerfOverlay() {
    this.showPerfOverlay = !this.showPerfOverlay;
    const badge = document.getElementById('webgl-perf-badge');
    const btn = document.getElementById('btn-toggle-perf');
    if (badge) {
      badge.style.display = this.showPerfOverlay ? 'inline-flex' : 'none';
    }
    if (btn) {
      if (this.showPerfOverlay) {
        btn.classList.add('active');
        btn.style.borderColor = 'var(--accent-cyan)';
        btn.style.color = 'var(--accent-cyan)';
      } else {
        btn.classList.remove('active');
        btn.style.borderColor = '';
        btn.style.color = '';
      }
    }
    if (this.showPerfOverlay) {
      this.updatePerfOverlayDisplay();
    }
  }

  updatePerfOverlayDisplay() {
    const fpsEl = document.getElementById('perf-fps');
    const callsEl = document.getElementById('perf-drawcalls');
    const tierEl = document.getElementById('perf-tier-badge');
    if (fpsEl) fpsEl.textContent = this.currentFPS || 60;
    if (callsEl && this.renderer && this.renderer.info) {
      callsEl.textContent = this.renderer.info.render.calls || 18;
    }
    if (tierEl) {
      tierEl.textContent = this.qualityTier.toUpperCase();
      tierEl.style.color = (this.qualityTier === 'ultra') ? '#10B981' : ((this.qualityTier === 'high') ? '#38BDF8' : '#F59E0B');
    }
  }

  loadGLTFModel(url, targetGroup, options = {}) {
    return new Promise((resolve) => {
      if (this.loadedModels.has(url)) {
        const cached = this.loadedModels.get(url).clone();
        if (targetGroup) targetGroup.add(cached);
        resolve(cached);
        return;
      }

      if (typeof THREE !== 'undefined' && typeof THREE.GLTFLoader !== 'undefined') {
        if (!this.gltfLoader) this.gltfLoader = new THREE.GLTFLoader();
        this.gltfLoader.load(
          url,
          (gltf) => {
            const model = gltf.scene || gltf.scenes[0];
            if (options.scale) model.scale.set(options.scale, options.scale, options.scale);
            if (options.position) model.position.copy(options.position);
            model.traverse((child) => {
              if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
              }
            });
            this.loadedModels.set(url, model);
            if (targetGroup) targetGroup.add(model);
            resolve(model);
          },
          undefined,
          (err) => {
            console.warn(`GLTF model could not load from ${url}. Using procedural geometric fallback.`, err);
            resolve(null);
          }
        );
      } else {
        console.warn('THREE.GLTFLoader not available. Using procedural fallback.');
        resolve(null);
      }
    });
  }

  captureCanvasSnapshot() {
    if (this.renderer && this.renderer.domElement) {
      if (this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
      if (typeof this.renderer.domElement.toDataURL === 'function') {
        return this.renderer.domElement.toDataURL('image/png');
      }
      return 'data:image/png;base64,MOCK_SNAPSHOT';
    }
    return null;
  }

  destroy() {
    this.isDestroyed = true;
    this.isInitialized = false;
    this.inspectorInitialized = false;
    this.isHeroAnimating = false;
    this.isInspectorAnimating = false;

    if (this.animationFrameId && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.animationFrameId);
    if (this.inspectorFrameId && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.inspectorFrameId);
    if (this.heroFrameId && typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.heroFrameId);
    this.animationFrameId = null;
    this.inspectorFrameId = null;
    this.heroFrameId = null;

    if (typeof window !== 'undefined' && this._onResize) {
      window.removeEventListener('resize', this._onResize);
    }
    if (typeof window !== 'undefined' && this._heroMouseMove) {
      window.removeEventListener('mousemove', this._heroMouseMove);
    }
    if (typeof window !== 'undefined' && this._heroMouseUp) {
      window.removeEventListener('mouseup', this._heroMouseUp);
    }
    if (typeof document !== 'undefined' && this._onVisibilityChange) {
      document.removeEventListener('visibilitychange', this._onVisibilityChange);
    }
    if (typeof window !== 'undefined' && this._onKeyDown) {
      window.removeEventListener('keydown', this._onKeyDown);
    }
    if (this.campusObserver && typeof this.campusObserver.disconnect === 'function') {
      this.campusObserver.disconnect();
      this.campusObserver = null;
    }
    if (this.heroObserver && typeof this.heroObserver.disconnect === 'function') {
      this.heroObserver.disconnect();
      this.heroObserver = null;
    }

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.removeEventListener('mousemove', this._onMove);
      this.renderer.domElement.removeEventListener('click', this._onClick);
      this.renderer.domElement.removeEventListener('touchstart', this._onTouchStart);
      this.renderer.domElement.removeEventListener('touchend', this._onTouchEnd);
    }
  }
}

// Global initialization
if (typeof window !== 'undefined') {
  window.Library3D = new Library3DEngine();
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Library3DEngine };
}
