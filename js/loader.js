// script.js — Canvas-generated text textures (no external image files required)
// Updated: Title texture is now a single, non-repeating wrap (no duplicate prints).
// The title is scaled horizontally to exactly fill the texture width so there is
// no gap between the end and start. Band (secondary) remains a repeating band.

(function () {
  const loaderEl = document.getElementById('loader');
  const counterEl = document.getElementById('loaderCounter');
  const canvasContainer = document.getElementById('canvasContainer');
  const mainContent = document.getElementById('mainContent');
  const header = document.querySelector('.header') || document.querySelector('.navbar');
  const hero   = document.querySelector('.hero')   || document.querySelector('.hero-home');
  const footer = document.querySelector('.footer') || document.querySelector('footer');

  let scene, camera, renderer, group;
  let sphere1, sphere2;
  let animId;
  let mouse = { x: 0, y: 0 };
  let targetRot = { x: 0, y: 0 };
  let currentRot = { x: 0, y: 0 };

  init();

  async function init() {
    // ----------------------
    // Preload loader background image
    // ----------------------
    const bgImg = new Image();
    bgImg.src = 'your-image.jpg'; // replace with your actual image path
    bgImg.onload = () => {
      loaderEl.style.backgroundImage = `url(${bgImg.src})`;
      loaderEl.style.backgroundSize = 'cover';
      loaderEl.style.backgroundPosition = 'center';
    };

    // Wait for webfonts to be ready so measureText & pixel rendering are accurate
    try {
      if (document.fonts && document.fonts.load) {
        const fontsToLoad = [
          "1em 'Bungee', sans-serif",
          "1em 'Montserrat', sans-serif"
        ];
        await Promise.all(fontsToLoad.map(f => document.fonts.load(f)));
        await document.fonts.ready;
      } else if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
    } catch (e) {
      console.warn('Font loading fallback', e);
      await new Promise(r => setTimeout(r, 120));
    }

    // Texts
    const titleText = "ANGEL BONG XIN TZE •"; // test variants here
    const bandText = "CREATIVE THINKING • USER EXPERIENCE • UI MOTION • ";

    // Create a single-wrap title texture (no repetition)
    const tex1 = createSingleWrapTexture(titleText, {
      fontFamily: "'Bungee', sans-serif",
      fontSize: 220,      // nominal font size; function will scale horizontally to fill width
      color: '#3734dbff',
      width: 2048,
      height: 1024,
      paddingPercent: 0.02, // 2% padding left/right
      squeezeFactor: 0.96   // slight horizontal squeeze if desired for thinner feel
    });

    // Keep the band as repeating strip
    const tex2 = createRepeatTextTexture(bandText, {
      fontFamily: "'Montserrat', sans-serif",
      fontSize: 44,
      color: '#b37cddff',
      width: 2048,
      height: 1024,
      gap: 80,
      rows: 1,
      squeezeFactor: 0.98
    });

    // THREE.JS scene
    scene = new THREE.Scene();
    const aspect = canvasContainer.clientWidth / canvasContainer.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    camera.position.set(0, 0, 6);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvasContainer.clientWidth, canvasContainer.clientHeight);
    renderer.setClearColor(0x000000, 0); // fully transparent
    canvasContainer.appendChild(renderer.domElement);

    // Group with a subtle, stationary left-leaning tilt
    group = new THREE.Group();
    group.rotation.x = 0.08;
    group.rotation.z = -0.25;
    scene.add(group);

    // Shader material
    const baseMaterial = new THREE.ShaderMaterial({
      uniforms: { map: { value: null } },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D map;
        varying vec2 vUv;
        void main() {
          vec4 texColor = texture2D(map, vUv);
          if (texColor.a <= 0.0001) discard;
          float alphaThreshold = 0.01;
          float alphaFactor = smoothstep(alphaThreshold, alphaThreshold + 0.04, texColor.a);
          vec3 premultipliedRGB = texColor.rgb * alphaFactor;
          gl_FragColor = vec4(premultipliedRGB, texColor.a * alphaFactor);
        }
      `,
      transparent: true,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.SphereGeometry(1, 64, 64);

    // Sphere 1: title (single wrap)
    const mat1 = baseMaterial.clone();
    mat1.uniforms = THREE.UniformsUtils.clone(mat1.uniforms);
    mat1.uniforms.map = { value: tex1 };
    sphere1 = new THREE.Mesh(geometry, mat1);
    sphere1.position.y = 0.18;
    group.add(sphere1);

    // Sphere 2: repeating band
    const mat2 = baseMaterial.clone();
    mat2.uniforms = THREE.UniformsUtils.clone(mat2.uniforms);
    mat2.uniforms.map = { value: tex2 };
    sphere2 = new THREE.Mesh(geometry, mat2);
    sphere2.position.y = -0.18;
    group.add(sphere2);

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (!e.touches || e.touches.length === 0) return;
      onMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
    }, { passive: true });

    animate();
    startLoaderTimeline();
  }

  function onResize() {
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  }

  function onMouseMove(e) {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    mouse.x = nx;
    mouse.y = ny;
    targetRot.y = mouse.x * 0.6;
    targetRot.x = mouse.y * 0.6;
  }

  function animate() {
    animId = requestAnimationFrame(animate);
    currentRot.x += (targetRot.x - currentRot.x) * 0.06;
    currentRot.y += (targetRot.y - currentRot.y) * 0.06;

    const radius = 6;
    const phi = Math.PI / 2 - currentRot.x;
    const theta = currentRot.y + Math.PI;
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(0, 0, 0);

    const t = performance.now() / 1000;
    if (sphere1) sphere1.rotation.y = -t * 0.6;
    if (sphere2) sphere2.rotation.y = -t * 1.0;

    renderer.render(scene, camera);
  }

  function startLoaderTimeline() {
    gsap.to(counterEl, { opacity: 1, duration: 0.25 });
    const obj = { value: 1 };
    counterEl.textContent = '1%';
    gsap.to(obj, {
      value: 100,
      duration: 6,
      ease: 'power3.out',
      onUpdate: () => { counterEl.textContent = Math.round(obj.value) + '%'; },
      onComplete: () => { exitLoaderSequence(); }
    });
  }

  function exitLoaderSequence() {
    const tl = gsap.timeline();
    tl.to(counterEl, { opacity: 0, duration: 0.4 });
    tl.to(sphere2.position, { y: -10, duration: 1.2, ease: 'power4.in' }, '-=0.2');
    tl.to(sphere1.position, { y: -10, duration: 1.2, ease: 'power4.in' }, '-=1.1');
    tl.to(loaderEl, { opacity: 0, duration: 0.6, ease: 'power2.out', onComplete: () => {
      loaderEl.classList.add('hidden');
    }}, '-=0.6');

    tl.call(() => { mainContent.classList.remove('hidden'); }, null, '>-0.2');
    tl.to(header, { opacity: 1, pointerEvents: 'auto', duration: 0.8 }, '>-0.1');
    tl.to(hero, { opacity: 1, pointerEvents: 'auto', duration: 1 }, '-=0.5');
    tl.to('.section', { opacity: 1, pointerEvents: 'auto', duration: 1, stagger: 0.08 }, '-=0.6');
    tl.to(footer, { opacity: 1, pointerEvents: 'auto', duration: 0.8 }, '-=0.6');
  }

  /* =================
     Texture helpers
     ================= */

  // Create a single, non-repeating wrap texture where the provided text
  // is scaled horizontally to fill the full texture width (no repeats).
  function createSingleWrapTexture(text, opts = {}) {
    const width = opts.width || 2048;
    const height = opts.height || 1024;
    const fontFamily = opts.fontFamily || "'Bungee', sans-serif";
    let fontSize = opts.fontSize || 220;
    const color = opts.color || '#111';
    const paddingPercent = (typeof opts.paddingPercent === 'number') ? opts.paddingPercent : 0.02;
    const squeezeFactor = (typeof opts.squeezeFactor === 'number') ? opts.squeezeFactor : 1.0;

    // prepare canvas
    const tmp = document.createElement('canvas');
    tmp.width = width;
    tmp.height = height;
    const ctx = tmp.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    // Prepare text and font
    let chunk = String(text).trim();
    // Start with given fontSize and compute measured width
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px ${fontFamily}`;
    // If text is too long compared to width, we can reduce fontSize until it fits comfortably
    const maxTextWidth = width * (1 - paddingPercent * 2);
    let measured = ctx.measureText(chunk).width;
    if (measured === 0) measured = 1;
    // If measured width smaller than desired, we will scale horizontally (so text fills width)
    // But if measured > maxTextWidth, reduce fontSize until it fits inside maxTextWidth
    while (measured > maxTextWidth && fontSize > 8) {
      fontSize = Math.max(8, Math.floor(fontSize * 0.92));
      ctx.font = `${fontSize}px ${fontFamily}`;
      measured = ctx.measureText(chunk).width;
    }

    // Draw the text centered with baseline in the vertical center
    ctx.save();
    ctx.translate(width / 2, height / 2);
    // horizontal scaling to force the text to occupy the full width (minus padding)
    const targetTextWidth = width * (1 - paddingPercent * 2);
    const hScale = targetTextWidth / measured;
    const appliedScale = hScale * squeezeFactor; // allow a slight squeeze
    ctx.scale(appliedScale, 1);
    ctx.fillText(chunk, 0, 0);
    ctx.restore();

    // Create THREE texture from tmp and set non-repeating wrapping (single wrap)
    const tex = new THREE.CanvasTexture(tmp);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  // Existing repeating-band texture generator (keeps working for bandText)
  function createRepeatTextTexture(text, opts = {}) {
    const width = opts.width || 2048;
    const height = opts.height || 1024;
    const fontFamily = opts.fontFamily || "'Montserrat', sans-serif";
    let fontSize = opts.fontSize || 44;
    const color = opts.color || '#111';
    const gap = typeof opts.gap === 'number' ? opts.gap : 80;
    const rows = Math.max(1, opts.rows || 1);
    const tighten = !!opts.tighten;
    const squeezeFactor = (typeof opts.squeezeFactor === 'number') ? opts.squeezeFactor : 1.0;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px ${fontFamily}`;

    let chunk = String(text);
    if (tighten) chunk = chunk.trim().replace(/\s{2,}/g, ' ');
    const sep = ' ';

    ctx.font = `${fontSize}px ${fontFamily}`;
    let chunkWidth = ctx.measureText(chunk + sep).width;
    if (chunkWidth < 10) chunkWidth = 10;
    const textWidthWithGap = chunkWidth + gap;

    const repeatsPerRow = Math.ceil(width / textWidthWithGap) + 2;

    const centerY = height / 2;
    const rowYs = [];
    if (rows === 1) {
      rowYs.push(centerY);
    } else {
      const spacingY = 120;
      const total = rows;
      const start = centerY - ((total - 1) * spacingY) / 2;
      for (let r = 0; r < rows; r++) rowYs.push(start + r * spacingY);
    }

    for (let r = 0; r < rowYs.length; r++) {
      const y = rowYs[r];
      const offset = (r % 2) * (textWidthWithGap / 2);
      for (let i = 0; i < repeatsPerRow; i++) {
        const x = -offset + i * textWidthWithGap;
        ctx.fillText(chunk + sep, x, y);
      }
    }

    // Apply horizontal squeeze if requested
    if (squeezeFactor !== 1.0) {
      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      const outCtx = out.getContext('2d');
      const sx = squeezeFactor;
      const dx = (width - width * sx) / 2;
      outCtx.setTransform(sx, 0, 0, 1, 0, 0);
      outCtx.drawImage(canvas, dx / sx, 0, width, height);
      outCtx.setTransform(1, 0, 0, 1, 0, 0);
      const tex = new THREE.CanvasTexture(out);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1, 1);
      tex.needsUpdate = true;
      return tex;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    tex.needsUpdate = true;
    return tex;
  }

})();