/**
 * three-scene.js
 * ES6 Module responsible for the Hero 3D Playing Cards Showcase (A♠, K♠, Q♠),
 * procedural high-DPI card face/back textures, felt surface shader / gold particles,
 * mouse parallax tilt, raycasted card flipping, and graceful CSS3D fallback.
 */

const HERO_CARDS_DATA = [
  { rank: 'A', suit: '♠', name: 'Ace of Spades', color: '#0F172A', basePos: { x: -2.05, y: 0.08, z: 0.15 }, baseRot: { x: 0.04, y: 0.22, z: 0.16 } },
  { rank: 'K', suit: '♠', name: 'King of Spades', color: '#0F172A', basePos: { x: 0.0, y: 0.22, z: 0.45 }, baseRot: { x: 0.0, y: 0.0, z: 0.0 } },
  { rank: 'Q', suit: '♠', name: 'Queen of Spades', color: '#0F172A', basePos: { x: 2.05, y: 0.08, z: 0.15 }, baseRot: { x: 0.04, y: -0.22, z: -0.16 } }
];

/**
 * Generates a crisp HTML5 Canvas texture for the front face of a playing card.
 */
function createCardFrontTexture(THREE, cardInfo) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 736;
  const ctx = canvas.getContext('2d');

  // Card Parchment / Luxury Ivory Gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 736);
  grad.addColorStop(0, '#FFFFFF');
  grad.addColorStop(0.65, '#F8FAFC');
  grad.addColorStop(1, '#E2E8F0');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 736);

  // Outer Gold Metallic Frame
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 14;
  ctx.strokeRect(18, 18, 512 - 36, 736 - 36);

  // Subtle Inner Filigree Border
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, 512 - 68, 736 - 68);

  // Top-Left Corner Rank & Suit
  ctx.fillStyle = cardInfo.color;
  ctx.font = 'bold 76px "Cinzel", Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(cardInfo.rank, 86, 114);
  ctx.font = '64px serif';
  ctx.fillText(cardInfo.suit, 86, 178);

  // Bottom-Right Corner Rank & Suit (Rotated 180 deg)
  ctx.save();
  ctx.translate(512 - 86, 736 - 114);
  ctx.rotate(Math.PI);
  ctx.font = 'bold 76px "Cinzel", Georgia, serif';
  ctx.fillText(cardInfo.rank, 0, 0);
  ctx.font = '64px serif';
  ctx.fillText(cardInfo.suit, 0, 64);
  ctx.restore();

  // Center Royal Emblem & Pip
  ctx.save();
  ctx.translate(256, 368);

  // Golden Halo Ring
  ctx.beginPath();
  ctx.arc(0, 0, 128, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.55)';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 112, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(212, 175, 55, 0.08)';
  ctx.fill();

  // Large Center Suit Pip
  ctx.fillStyle = '#0F172A';
  ctx.font = '175px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(cardInfo.suit, 0, 8);

  // Royal Crown / Rank Watermark
  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 30px "Cinzel", serif';
  ctx.fillText(cardInfo.name.toUpperCase(), 0, 165);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Generates an ornate Obsidian & Metallic Gold luxury back texture for the 3D cards.
 */
function createCardBackTexture(THREE) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 736;
  const ctx = canvas.getContext('2d');

  // Deep Obsidian to Emerald Gradient
  const grad = ctx.createRadialGradient(256, 368, 30, 256, 368, 420);
  grad.addColorStop(0, '#093124');
  grad.addColorStop(0.6, '#0A0E17');
  grad.addColorStop(1, '#050608');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 736);

  // Gold Outer & Inner Borders
  ctx.strokeStyle = '#D4AF37';
  ctx.lineWidth = 16;
  ctx.strokeRect(20, 20, 512 - 40, 736 - 40);

  ctx.strokeStyle = 'rgba(255, 191, 0, 0.5)';
  ctx.lineWidth = 4;
  ctx.strokeRect(42, 42, 512 - 84, 736 - 84);

  // Geometric Diamond Lattice
  ctx.strokeStyle = 'rgba(212, 175, 55, 0.16)';
  ctx.lineWidth = 2;
  const step = 44;
  for (let x = -736; x < 1024; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 42);
    ctx.lineTo(x + 650, 736 - 42);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x + 650, 42);
    ctx.lineTo(x, 736 - 42);
    ctx.stroke();
  }

  // Center Royal Medallion
  ctx.save();
  ctx.translate(256, 368);
  ctx.beginPath();
  ctx.arc(0, 0, 96, 0, Math.PI * 2);
  ctx.fillStyle = '#0A0B0E';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#D4AF37';
  ctx.stroke();

  ctx.fillStyle = '#D4AF37';
  ctx.font = 'bold 84px serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♠', 0, 4);

  ctx.font = 'bold 20px "Cinzel", serif';
  ctx.fillText('TEEN PATTI ROYALE', 0, 132);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.anisotropy = 4;
  return texture;
}

/**
 * Initializes the Hero 3D Scene (or activates interactive CSS 3D fallback if WebGL is unavailable).
 */
export function initHero3DScene({ onCardFlipSound, onCardDealSound } = {}) {
  const container = document.getElementById('hero-3d-canvas-container');
  const fallbackContainer = document.getElementById('hero-fallback-cards');
  const telemetryEl = document.getElementById('hero-card-telemetry');
  const statusBadge = document.getElementById('webgl-status-badge');

  if (!container) return null;

  // Helper to update telemetry HUD
  const updateTelemetry = (tiltX, tiltY, extraNote = 'PURE SEQUENCE (90% RANK)') => {
    if (telemetryEl) {
      telemetryEl.textContent = `TILT: ${tiltX.toFixed(1)}° , ${tiltY.toFixed(1)}° | HAND: ${extraNote}`;
    }
  };

  // Check if Three.js & WebGL context are available
  let renderer = null;
  const THREE = window.THREE;

  if (THREE) {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch (err) {
      renderer = null;
    }
  }

  // Graceful Fallback to Interactive CSS-3D Cards if WebGL is disabled/unavailable
  if (!THREE || !renderer) {
    if (statusBadge) {
      statusBadge.textContent = 'CSS 3D Fallback Active';
      statusBadge.className = 'px-2 py-0.5 rounded bg-amber-500/15 text-amberGlow border border-amber-500/30 text-[11px]';
    }
    return initCSS3DFallback({ container, fallbackContainer, updateTelemetry, onCardFlipSound, onCardDealSound });
  }

  // Configure WebGLRenderer
  const width = container.clientWidth || 560;
  const height = container.clientHeight || 420;
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';
  container.insertBefore(renderer.domElement, container.firstChild);

  // Create Scene & Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
  camera.position.set(0, 0.15, 6.6);

  // Lighting Setup (Luxury Gold + Emerald Rim + Soft Ambient)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.82);
  scene.add(ambientLight);

  const goldPointLight = new THREE.PointLight(0xffbf00, 1.35, 18);
  goldPointLight.position.set(3.5, 3.2, 4.5);
  scene.add(goldPointLight);

  const emeraldPointLight = new THREE.PointLight(0x10b981, 1.0, 16);
  emeraldPointLight.position.set(-4.0, -2.5, 3.5);
  scene.add(emeraldPointLight);

  // Custom GLSL Felt Surface Shader (Radial Emerald Casino Spotlight + Procedural Felt Weave + Gold Vignette)
  const feltGeo = new THREE.PlaneGeometry(16, 10, 32, 32);
  const feltUniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(0, 0) }
  };
  const feltMat = new THREE.ShaderMaterial({
    uniforms: feltUniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      varying vec2 vUv;

      // High-frequency procedural hash for felt fiber micro-texture
      float hash21(vec2 p) {
        p = fract(p * vec2(234.34, 435.345));
        p += dot(p, p + 34.23);
        return fract(p.x * p.y);
      }

      void main() {
        vec2 centered = vUv - 0.5;
        vec2 hotspot = centered - uPointer * 0.12;
        float dist = length(hotspot * vec2(1.35, 1.0));

        vec3 emeraldCore = vec3(0.055, 0.255, 0.180);
        vec3 emeraldDeep = vec3(0.024, 0.137, 0.098);
        vec3 obsidianEdge = vec3(0.031, 0.039, 0.055);
        vec3 goldTint = vec3(0.831, 0.686, 0.216);

        float radialGlow = smoothstep(0.78, 0.0, dist);
        vec3 baseColor = mix(obsidianEdge, emeraldDeep, smoothstep(0.95, 0.25, dist));
        baseColor = mix(baseColor, emeraldCore, radialGlow * 0.85);

        // Subtle gold rim aura following pointer
        float goldHalo = exp(-dist * 4.2) * (0.09 + 0.02 * sin(uTime * 1.8));
        baseColor += goldTint * goldHalo;

        // Procedural felt weave grain
        float grain = (hash21(vUv * 420.0) - 0.5) * 0.028;
        baseColor += grain;

        gl_FragColor = vec4(baseColor, 1.0);
      }
    `
  });
  const feltMesh = new THREE.Mesh(feltGeo, feltMat);
  feltMesh.position.z = -1.6;
  scene.add(feltMesh);

  // Floating Gold Dust Particles
  const particleCount = 65;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 9;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 3 - 0.3;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0xd4af37,
    size: 0.055,
    transparent: true,
    opacity: 0.65
  });
  const particleSystem = new THREE.Points(particleGeo, particleMat);
  scene.add(particleSystem);

  // Create Group for the 3 Cards (A♠, K♠, Q♠)
  const cardsGroup = new THREE.Group();
  scene.add(cardsGroup);

  const backTexture = createCardBackTexture(THREE);
  const edgeMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    metalness: 0.75,
    roughness: 0.25
  });

  const cardMeshes = [];
  const cardGeo = new THREE.BoxGeometry(1.75, 2.52, 0.035);

  HERO_CARDS_DATA.forEach((data, idx) => {
    const frontTexture = createCardFrontTexture(THREE, data);
    const frontMaterial = new THREE.MeshStandardMaterial({
      map: frontTexture,
      roughness: 0.28,
      metalness: 0.08
    });
    const backMaterial = new THREE.MeshStandardMaterial({
      map: backTexture,
      roughness: 0.32,
      metalness: 0.22
    });

    // BoxGeometry material order: [right, left, top, bottom, front, back]
    const materials = [
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      edgeMaterial,
      frontMaterial,
      backMaterial
    ];

    const mesh = new THREE.Mesh(cardGeo, materials);
    mesh.position.set(data.basePos.x, data.basePos.y, data.basePos.z);
    mesh.rotation.set(data.baseRot.x, data.baseRot.y, data.baseRot.z);

    mesh.userData = {
      index: idx,
      name: data.name,
      rank: data.rank,
      suit: data.suit,
      isFlipped: false,
      targetRotY: data.baseRot.y,
      basePos: { ...data.basePos },
      baseRot: { ...data.baseRot }
    };

    cardsGroup.add(mesh);
    cardMeshes.push(mesh);
  });

  // Mouse Parallax State
  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const normY = -((clientY - rect.top) / rect.height) * 2 + 1;

    pointer.targetX = Math.max(-1, Math.min(1, normX));
    pointer.targetY = Math.max(-1, Math.min(1, normY));
    updateTelemetry(pointer.targetY * 15, pointer.targetX * 18);
  };

  const onPointerLeave = () => {
    pointer.targetX = 0;
    pointer.targetY = 0;
    updateTelemetry(0, 0);
  };

  // Click / Tap Raycasting to Flip Individual 3D Cards
  const onPointerClick = (e) => {
    const rect = container.getBoundingClientRect();
    const clientX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.changedTouches ? e.changedTouches[0].clientY : e.clientY;

    mouseNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouseNDC, camera);
    const hits = raycaster.intersectObjects(cardMeshes);
    if (hits.length > 0) {
      const hitMesh = hits[0].object;
      toggleCardFlip(hitMesh);
    }
  };

  function toggleCardFlip(mesh) {
    mesh.userData.isFlipped = !mesh.userData.isFlipped;
    const flipOffset = mesh.userData.isFlipped ? Math.PI : 0;
    mesh.userData.targetRotY = mesh.userData.baseRot.y + flipOffset;

    if (typeof onCardFlipSound === 'function') onCardFlipSound();

    if (window.gsap) {
      window.gsap.to(mesh.rotation, {
        y: mesh.userData.targetRotY,
        duration: 0.65,
        ease: 'back.out(1.5)'
      });
      window.gsap.fromTo(
        mesh.position,
        { z: mesh.userData.basePos.z + 0.35 },
        { z: mesh.userData.basePos.z, duration: 0.5, ease: 'power2.out' }
      );
    } else {
      mesh.rotation.y = mesh.userData.targetRotY;
    }

    updateTelemetry(
      pointer.targetY * 15,
      pointer.targetX * 18,
      `FLIPPED ${mesh.userData.rank}${mesh.userData.suit}`
    );
  }

  container.addEventListener('mousemove', onPointerMove);
  container.addEventListener('touchmove', onPointerMove, { passive: true });
  container.addEventListener('mouseleave', onPointerLeave);
  container.addEventListener('click', onPointerClick);

  // Public Controls
  function flipAllCards() {
    if (typeof onCardFlipSound === 'function') onCardFlipSound();
    cardMeshes.forEach((mesh, i) => {
      mesh.userData.isFlipped = !mesh.userData.isFlipped;
      const flipOffset = mesh.userData.isFlipped ? Math.PI : 0;
      mesh.userData.targetRotY = mesh.userData.baseRot.y + flipOffset;
      if (window.gsap) {
        window.gsap.to(mesh.rotation, {
          y: mesh.userData.targetRotY,
          duration: 0.65,
          delay: i * 0.08,
          ease: 'back.out(1.4)'
        });
      } else {
        mesh.rotation.y = mesh.userData.targetRotY;
      }
    });
  }

  function dealAndFanCards() {
    if (typeof onCardDealSound === 'function') onCardDealSound();
    cardMeshes.forEach((mesh, i) => {
      mesh.userData.isFlipped = false;
      mesh.userData.targetRotY = mesh.userData.baseRot.y;
      if (window.gsap) {
        window.gsap.fromTo(
          mesh.position,
          { x: 0, y: -2.4, z: -1.0 },
          {
            x: mesh.userData.basePos.x,
            y: mesh.userData.basePos.y,
            z: mesh.userData.basePos.z,
            duration: 0.75,
            delay: i * 0.12,
            ease: 'back.out(1.3)'
          }
        );
        window.gsap.fromTo(
          mesh.rotation,
          { x: 0.5, y: Math.PI, z: 0 },
          {
            x: mesh.userData.baseRot.x,
            y: mesh.userData.baseRot.y,
            z: mesh.userData.baseRot.z,
            duration: 0.75,
            delay: i * 0.12,
            ease: 'power3.out'
          }
        );
      }
    });
    updateTelemetry(0, 0, 'ROYAL PURE SEQUENCE DEALT');
  }

  function resetHeroView() {
    pointer.targetX = 0;
    pointer.targetY = 0;
    cardMeshes.forEach((mesh) => {
      mesh.userData.isFlipped = false;
      mesh.userData.targetRotY = mesh.userData.baseRot.y;
      if (window.gsap) {
        window.gsap.to(mesh.position, {
          x: mesh.userData.basePos.x,
          y: mesh.userData.basePos.y,
          z: mesh.userData.basePos.z,
          duration: 0.5
        });
        window.gsap.to(mesh.rotation, {
          x: mesh.userData.baseRot.x,
          y: mesh.userData.baseRot.y,
          z: mesh.userData.baseRot.z,
          duration: 0.5
        });
      }
    });
    updateTelemetry(0, 0, 'PURE SEQUENCE (90% RANK)');
  }

  // Responsive Resize Handler
  const onResize = () => {
    const newW = container.clientWidth || 560;
    const newH = container.clientHeight || 420;
    camera.aspect = newW / newH;
    // Slightly pull camera back on narrow mobile viewports so all 3 cards fit comfortably
    camera.position.z = newW < 450 ? 8.2 : 6.6;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, newH);
  };
  onResize();
  window.addEventListener('resize', onResize);

  // 60fps Animation Loop + WebGL Context Loss Resilience
  let clockStart = performance.now();
  let rafId = null;
  let contextLost = false;
  let fallbackController = null;

  renderer.domElement.addEventListener(
    'webglcontextlost',
    (e) => {
      e.preventDefault();
      contextLost = true;
      if (rafId) cancelAnimationFrame(rafId);
      renderer.domElement.style.display = 'none';
      if (statusBadge) {
        statusBadge.textContent = 'CSS 3D Fallback Active';
        statusBadge.className =
          'px-2 py-0.5 rounded bg-amber-500/15 text-amberGlow border border-amber-500/30 text-[11px]';
      }
      if (!fallbackController) {
        fallbackController = initCSS3DFallback({
          container,
          fallbackContainer,
          updateTelemetry,
          onCardFlipSound,
          onCardDealSound
        });
      }
    },
    false
  );

  renderer.domElement.addEventListener(
    'webglcontextrestored',
    () => {
      contextLost = false;
      renderer.domElement.style.display = 'block';
      if (fallbackContainer) {
        fallbackContainer.classList.add('hidden');
        fallbackContainer.classList.remove('flex');
      }
      if (statusBadge) {
        statusBadge.textContent = '3D WebGL Active';
        statusBadge.className =
          'px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[11px]';
      }
      rafId = requestAnimationFrame(animate);
    },
    false
  );

  function animate(now) {
    if (contextLost) return;
    rafId = requestAnimationFrame(animate);
    const elapsed = (now - clockStart) * 0.001;

    // Smoothly interpolate mouse parallax
    pointer.x += (pointer.targetX - pointer.x) * 0.08;
    pointer.y += (pointer.targetY - pointer.y) * 0.08;

    feltUniforms.uTime.value = elapsed;
    feltUniforms.uPointer.value.set(pointer.x, pointer.y);

    cardsGroup.rotation.y = pointer.x * 0.38;
    cardsGroup.rotation.x = -pointer.y * 0.28;

    // Gentle floating levitation for each card
    cardMeshes.forEach((mesh, i) => {
      const floatOffset = Math.sin(elapsed * 2.1 + i * 1.1) * 0.07;
      if (!window.gsap || !window.gsap.isTweening(mesh.position)) {
        mesh.position.y = mesh.userData.basePos.y + floatOffset;
      }
    });

    // Subtle rotation on gold particle dust
    particleSystem.rotation.y = elapsed * 0.05;

    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(animate);

  return {
    flipAllCards: () => (contextLost && fallbackController ? fallbackController.flipAllCards() : flipAllCards()),
    dealAndFanCards: () => (contextLost && fallbackController ? fallbackController.dealAndFanCards() : dealAndFanCards()),
    resetHeroView: () => (contextLost && fallbackController ? fallbackController.resetHeroView() : resetHeroView())
  };
}

/**
 * Interactive CSS-3D Fallback if WebGL is unavailable in the browser environment.
 */
function initCSS3DFallback({ container, fallbackContainer, updateTelemetry, onCardFlipSound, onCardDealSound }) {
  if (!fallbackContainer) return null;
  fallbackContainer.classList.remove('hidden');
  fallbackContainer.classList.add('flex');

  fallbackContainer.innerHTML = HERO_CARDS_DATA.map(
    (c, idx) => `
    <div class="card-3d-wrapper hero-fallback-card" data-idx="${idx}" style="transform: rotate(${(idx - 1) * 8}deg);">
      <div class="card-3d-inner">
        <div class="card-face card-face-front suit-black">
          <div class="text-left leading-none">
            <div class="font-heading font-bold text-lg">${c.rank}</div>
            <div class="text-sm">${c.suit}</div>
          </div>
          <div class="text-center text-4xl my-auto">${c.suit}</div>
          <div class="text-right leading-none rotate-180">
            <div class="font-heading font-bold text-lg">${c.rank}</div>
            <div class="text-sm">${c.suit}</div>
          </div>
        </div>
        <div class="card-face card-face-back"></div>
      </div>
    </div>
  `
  ).join('');

  const cardEls = Array.from(fallbackContainer.querySelectorAll('.hero-fallback-card'));
  cardEls.forEach((el) => {
    el.addEventListener('click', () => {
      el.classList.toggle('is-flipped');
      if (typeof onCardFlipSound === 'function') onCardFlipSound();
    });
  });

  container.addEventListener('mousemove', (e) => {
    const rect = container.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    fallbackContainer.style.transform = `rotateY(${nx * 14}deg) rotateX(${ny * 10}deg)`;
    updateTelemetry(ny * 10, nx * 14);
  });

  return {
    flipAllCards() {
      if (typeof onCardFlipSound === 'function') onCardFlipSound();
      cardEls.forEach((el) => el.classList.toggle('is-flipped'));
    },
    dealAndFanCards() {
      if (typeof onCardDealSound === 'function') onCardDealSound();
      cardEls.forEach((el) => el.classList.remove('is-flipped'));
    },
    resetHeroView() {
      fallbackContainer.style.transform = 'rotateY(0deg) rotateX(0deg)';
      cardEls.forEach((el) => el.classList.remove('is-flipped'));
      updateTelemetry(0, 0);
    }
  };
}
