/* loader.js — rewritten, optimized, crisp-text + improved ring timing */

document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("loader");
  const canvasWrapper = document.getElementById("loader-canvas-wrapper");
  const loaderPercentage = document.getElementById("loader-percentage");

  loaderPercentage.textContent = '0%';
  loaderPercentage.style.opacity = 0;
  canvasWrapper.style.opacity = 0;
  document.body.classList.add("loading");

  let width = window.innerWidth;
  let height = window.innerHeight;

  /* --------------------------------------------
   * THREE.js Setup
   * -------------------------------------------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  // After appending renderer
  canvasWrapper.appendChild(renderer.domElement);

  // Fade in BOTH at the same time
  gsap.to([loaderPercentage, canvasWrapper], {
    opacity: 1,
    duration: 0.6,
    ease: "power2.out"
  });

  const group = new THREE.Group();
  group.rotation.x = 0.08;
  group.rotation.z = -0.25;
  scene.add(group);

  /* --------------------------------------------
   * Font Loading
   * -------------------------------------------- */
  try {
    if (document.fonts) {
      await document.fonts.load("700 1em 'Montserrat'");
      await document.fonts.ready;
    }
  } catch (e) {
    console.warn("Font load fallback");
    await new Promise(r => setTimeout(r, 200));
  }

  /* --------------------------------------------
   * TEXTURE GENERATION (HIGH-RES & BOLD)
   * -------------------------------------------- */
  const titleText = "ANGEL BONG XIN TZE •";
  const bandText = "CREATIVE THINKING • USER EXPERIENCE • UI MOTION • ";

  function createSingleWrapTexture(text, opts = {}) {
    const width = opts.width || 6144;      // 3× resolution
    const height = opts.height || 3072;
    const fontFamily = "'Montserrat', sans-serif";
    let fontSize = opts.fontSize || 600;   // large for crisp bold
    const color = opts.color || "#c39ad7ff";
    const paddingPercent = opts.paddingPercent ?? 0.02;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${fontSize}px ${fontFamily}`; // BOLD

    const maxTextWidth = width * (1 - paddingPercent * 2);
    let measured = ctx.measureText(text).width;

    while (measured > maxTextWidth && fontSize > 8) {
      fontSize = Math.floor(fontSize * 0.92);
      ctx.font = `800 ${fontSize}px ${fontFamily}`;
      measured = ctx.measureText(text).width;
    }

    ctx.save();
    ctx.translate(width / 2, height / 2);
    const hScale = maxTextWidth / measured;
    ctx.scale(hScale, 1);
    ctx.fillText(text, 0, 0);
    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.ClampToEdgeWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.needsUpdate = true;

    return tex;
  }

  function createRepeatTextTexture(text, opts = {}) {
    const width = opts.width || 4096;
    const height = opts.height || 2048;
    const fontFamily = "'Montserrat', sans-serif";
    const fontSize = opts.fontSize || 90;
    const color = opts.color || "#dcd9d9ff";
    const gap = opts.gap ?? 80;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Clear fully transparent
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = color;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${fontSize}px ${fontFamily}`;

    const chunkWidth = ctx.measureText(text).width + gap;
    const repeats = Math.ceil(width / chunkWidth) + 2;

    const centerY = height / 2;
    for (let i = 0; i < repeats; i++) {
      ctx.fillText(text, i * chunkWidth, centerY);
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    tex.repeat.set(1, 1);
    tex.needsUpdate = true;

    return tex;
  }

  const texTop = createSingleWrapTexture(titleText);
  const texBottom = createRepeatTextTexture(bandText);

  /* --------------------------------------------
   * Materials + Spheres
   * -------------------------------------------- */
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
        if (texColor.a < 0.0001) discard;
        gl_FragColor = texColor;
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
    alphaTest: 0.01 
  });

  const geo = new THREE.SphereGeometry(1.1, 64, 64);

  const matTop = baseMaterial.clone();
  matTop.uniforms.map.value = texTop;
  const sphereTop = new THREE.Mesh(geo, matTop);
  sphereTop.scale.y = 1.2;   // stretch vertically by 50%
  sphereTop.position.y = 0.2;
  group.add(sphereTop);

  const matBottom = baseMaterial.clone();
  matBottom.uniforms.map.value = texBottom;
  const sphereBottom = new THREE.Mesh(geo, matBottom);
  sphereBottom.scale.y = 1.2;  // same vertical stretch
  sphereBottom.position.y = -0.2;
  group.add(sphereBottom);

  /* --------------------------------------------
   * Lights
   * -------------------------------------------- */
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const light = new THREE.PointLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  /* --------------------------------------------
   * Mouse Tilt
   * -------------------------------------------- */
  let mouseX = 0, mouseY = 0;
  window.addEventListener("mousemove", (e) => {
    mouseX = ((e.clientX / width) * 2 - 1) * 0.6;
    mouseY = ((e.clientY / height) * 2 - 1) * 0.6;
  });

  let currentRot = { x: 0, y: 0 };

  function animate() {
    requestAnimationFrame(animate);

    currentRot.x += (mouseY - currentRot.x) * 0.06;
    currentRot.y += (mouseX - currentRot.y) * 0.06;

    const r = 6;
    const phi = Math.PI / 2 - currentRot.x;
    const theta = currentRot.y + Math.PI;

    camera.position.set(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta)
    );
    camera.lookAt(0, 0, 0);

    const t = performance.now() / 1000;
    sphereTop.rotation.y = -t * 0.6;
    sphereBottom.rotation.y = -t * 1.0;

    renderer.render(scene, camera);
  }
  animate();

  /* --------------------------------------------
   * GSAP Percentage Counter + Exit Animation
   * -------------------------------------------- */
  let percent = { value: 0 };

  gsap.to(percent, {
    value: 100,
    duration: 7,
    ease: "power1.out",
    onUpdate: () => {
      const p = Math.floor(percent.value);
      loaderPercentage.textContent = `${p}%`;
      gsap.to(loaderPercentage, {
        scale: 1 + Math.sin(p / 3) * 0.03,
        duration: 0.2,
        ease: "power1.out"
      });
    },

    onComplete: () => {
      const tl = gsap.timeline({
        onComplete: () => {
          loader.remove();
          document.body.classList.remove("loading");
        }
      });

      tl.to(loaderPercentage, {
        opacity: 0,
        duration: 0.4,
        ease: "power2.out"
      });

      // bottom ring falls first
      tl.to(sphereBottom.position, {
        y: -10,
        duration: 1.1,
        ease: "power4.in"
      }, "-=0.05");

      tl.to(sphereBottom.rotation, {
        y: Math.PI / 2,
        duration: 1.1,
        ease: "power4.in"
      }, "<");

      // top ring falls slightly after
      tl.to(sphereTop.position, {
        y: -10,
        duration: 1.1,
        ease: "power4.in"
      }, "-=0.78");

      tl.to(sphereTop.rotation, {
        y: -Math.PI / 4,
        duration: 1.1,
        ease: "power4.in"
      }, "<");

      // fade loader bg
      tl.to(loader, {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
      }, "-=0.4");
    }
  });

  /* --------------------------------------------
   * Resize Handling
   * -------------------------------------------- */
  window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
});
