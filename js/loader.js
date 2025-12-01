/* loader.js - full-screen 3D loader with centered rings and bottom percentage */

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('loader');
  const canvasWrapper = document.getElementById('loader-canvas-wrapper');
  const loaderPercentage = document.getElementById('loader-percentage');

   // Hide both until ready
  loaderPercentage.style.opacity = 0;
  canvasWrapper.style.opacity = 0;

  document.body.classList.add('loading');

  let width = window.innerWidth;
  let height = window.innerHeight;

  // === THREE.js Setup ===
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  canvasWrapper.appendChild(renderer.domElement);

  // Fade-in rings + percentage together
  gsap.to([loaderPercentage, canvasWrapper], {
    opacity: 1,
    duration: 0.4,
    ease: "power2.out"
  });

  // === Group for rings ===
  const group = new THREE.Group();
  group.rotation.x = 0.08;
  group.rotation.z = -0.25;
  scene.add(group);

  // === Font loading ===
  try {
    if (document.fonts && document.fonts.load) {
      await document.fonts.load("1em 'Bungee', sans-serif");
      await document.fonts.load("1em 'Montserrat', sans-serif");
      await document.fonts.ready;
    }
  } catch(e) {
    console.warn('Font loading fallback', e);
    await new Promise(r => setTimeout(r, 120));
  }

  // === Text textures ===
  const titleText = "ANGEL BONG XIN TZE •";
  const bandText = "CREATIVE THINKING • USER EXPERIENCE • UI MOTION • ";

  function createSingleWrapTexture(text, opts = {}) {
    const width = opts.width || 2048;
    const height = opts.height || 1024;
    const fontFamily = opts.fontFamily || "'Bungee', sans-serif";
    let fontSize = opts.fontSize || 220;
    const color = opts.color || '#111';
    const paddingPercent = opts.paddingPercent ?? 0.02;
    const squeezeFactor = opts.squeezeFactor ?? 1.0;

    const tmp = document.createElement('canvas');
    tmp.width = width;
    tmp.height = height;
    const ctx = tmp.getContext('2d');

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px ${fontFamily}`;

    const maxTextWidth = width * (1 - paddingPercent * 2);
    let measured = ctx.measureText(text).width;
    while (measured > maxTextWidth && fontSize > 8) {
      fontSize = Math.max(8, Math.floor(fontSize * 0.92));
      ctx.font = `${fontSize}px ${fontFamily}`;
      measured = ctx.measureText(text).width;
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);
    const hScale = (width * (1 - paddingPercent * 2)) / measured * squeezeFactor;
    ctx.scale(hScale, 1);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(tmp);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
  }

  function createRepeatTextTexture(text, opts = {}) {
    const width = opts.width || 2048;
    const height = opts.height || 1024;
    const fontFamily = opts.fontFamily || "'Montserrat', sans-serif";
    let fontSize = opts.fontSize || 44;
    const color = opts.color || '#111';
    const gap = opts.gap ?? 80;
    const squeezeFactor = opts.squeezeFactor ?? 1.0;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = color;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${fontSize}px ${fontFamily}`;

    const sep = ' ';
    let chunkWidth = ctx.measureText(text + sep).width + gap;
    const repeats = Math.ceil(width / chunkWidth) + 2;

    const centerY = height / 2;
    for (let i = 0; i < repeats; i++) {
      ctx.fillText(text + sep, i * chunkWidth, centerY);
    }

    if (squeezeFactor !== 1) {
      const out = document.createElement('canvas');
      out.width = width;
      out.height = height;
      const outCtx = out.getContext('2d');
      outCtx.setTransform(squeezeFactor, 0, 0, 1, 0, 0);
      outCtx.drawImage(canvas, 0, 0);
      outCtx.setTransform(1,0,0,1,0,0);
      const tex = new THREE.CanvasTexture(out);
      tex.wrapS = THREE.RepeatWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
      tex.repeat.set(1,1);
      tex.needsUpdate = true;
      return tex;
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1,1);
    tex.needsUpdate = true;
    return tex;
  }

  const tex1 = createSingleWrapTexture(titleText, { fontSize: 220 });
  const tex2 = createRepeatTextTexture(bandText, { fontSize: 44 });

  // === Shader material ===
  const baseMaterial = new THREE.ShaderMaterial({
    uniforms: { map: { value: null } },
    vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`,
    fragmentShader: `
      uniform sampler2D map;
      varying vec2 vUv;
      void main() {
        vec4 texColor = texture2D(map, vUv);
        if (texColor.a <= 0.0001) discard;
        float alphaThreshold = 0.01;
        float alphaFactor = smoothstep(alphaThreshold, alphaThreshold+0.04, texColor.a);
        vec3 premultipliedRGB = texColor.rgb * alphaFactor;
        gl_FragColor = vec4(premultipliedRGB, texColor.a*alphaFactor);
      }`,
    transparent: true,
    side: THREE.DoubleSide
  });

  // === Spheres ===
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const mat1 = baseMaterial.clone();
  mat1.uniforms = THREE.UniformsUtils.clone(mat1.uniforms);
  mat1.uniforms.map = { value: tex1 };
  const sphere1 = new THREE.Mesh(geometry, mat1);
  sphere1.position.y = 0.18;
  group.add(sphere1);

  const mat2 = baseMaterial.clone();
  mat2.uniforms = THREE.UniformsUtils.clone(mat2.uniforms);
  mat2.uniforms.map = { value: tex2 };
  const sphere2 = new THREE.Mesh(geometry, mat2);
  sphere2.position.y = -0.18;
  group.add(sphere2);

  // === Lights ===
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(5,5,5);
  scene.add(pointLight);

  // === Mouse tilt ===
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = ((e.clientX / width) * 2 - 1) * 0.6;
    mouseY = ((e.clientY / height) * 2 - 1) * 0.6;
  });

  // === Animate ===
  let currentRot = { x:0, y:0 };
  function animate() {
    requestAnimationFrame(animate);
    currentRot.x += (mouseY - currentRot.x) * 0.06;
    currentRot.y += (mouseX - currentRot.y) * 0.06;

    const radius = 6;
    const phi = Math.PI/2 - currentRot.x;
    const theta = currentRot.y + Math.PI;
    camera.position.x = radius * Math.sin(phi) * Math.cos(theta);
    camera.position.y = radius * Math.cos(phi);
    camera.position.z = radius * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(0,0,0);

    const t = performance.now()/1000;
    sphere1.rotation.y = -t*0.6;
    sphere2.rotation.y = -t*1.0;

    renderer.render(scene, camera);
  }

  animate();

  // === GSAP loader counter & exit ===
  let percent = { value: 0 };
  gsap.to(percent, {
    value: 100,
    duration: 5,
    ease: 'power1.out',
    onUpdate: () => {
      const rounded = Math.floor(percent.value);
      loaderPercentage.textContent = `${rounded}%`;
      gsap.to(loaderPercentage, { scale: 1 + 0.03 * Math.sin(rounded/3), duration: 0.2, ease: 'power1.out' });
    },
    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          loader.style.display = 'none';
          document.body.classList.remove('loading');
        }
      });

      // Fade out percentage first
      tl.to(loaderPercentage, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.out'
      });

      // === Bottom ring falls FIRST ===
      tl.to(sphere2.position, {
        y: -10,
        duration: 1.1,
        ease: 'power4.in'
      }, "-=0.05");

      tl.to(sphere2.rotation, {
        y: Math.PI / 2,
        duration: 1.1,
        ease: 'power4.in'
      }, "<");

      // === Top ring falls shortly AFTER (better timing: 0.25s later) ===
      tl.to(sphere1.position, {
        y: -10,
        duration: 1.1,
        ease: 'power4.in'
      }, "-=0.85");  // ← key change (0.25s delay)

      tl.to(sphere1.rotation, {
        y: -Math.PI / 4,
        duration: 1.1,
        ease: 'power4.in'
      }, "<");

      // Fade loader
      tl.to(loader, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.inOut'
      }, "-=0.5");
    }
  });

  // === Handle resize ===
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
