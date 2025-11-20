/* carousel.js
   This file integrates your vertical carousel into section 4 ("more").
   - Paths to images are adjusted to assets/images/
   - Script is scoped inside DOMContentLoaded to avoid interfering with main.js
   - Keeps the same drag + momentum behavior you had, and updates the right panel content
*/

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById("carousel");
  const slides = document.querySelectorAll("#more .slide");
  const rightPanel = document.getElementById("right-panel");

  let progress = 2; // start in the middle
  let startY = 0;
  let lastY = 0;
  let dragging = false;
  let velocity = 0;

  const MIN = 0;
  const MAX = slides.length - 1;

  // colors for right panel background
  const colors = ["#e74c3c","#3498db","#2ecc71","#f1c40f","#9b59b6"];

  // INFO FOR EACH SLIDE - make sure these image files exist in assets/images/
  const slideInfo = [
    {
        name: "Project One",
        images: ["assets/images/p1-1.jpg", "assets/images/p1-2.jpg", "assets/images/p1-3.jpg"],
        overview: "This is the overview for project one.",
        typeOfWork: "UI/UX, Frontend Development"
    },
    {
        name: "Project Two",
        images: ["assets/images/p2-1.jpg", "assets/images/p2-2.jpg", "assets/images/p2-3.jpg"],
        overview: "This is the overview for project two.",
        typeOfWork: "Branding, Graphic Design"
    },
    {
        name: "Project Three",
        images: ["assets/images/p3-1.jpg", "assets/images/p3-2.jpg", "assets/images/p3-3.jpg"],
        overview: "This is the overview for project three.",
        typeOfWork: "Creative Coding, Interactive Art"
    },
    {
        name: "Project Four",
        images: ["assets/images/p4-1.jpg", "assets/images/p4-2.jpg", "assets/images/p4-3.jpg"],
        overview: "This is the overview for project four.",
        typeOfWork: "E-commerce Development"
    },
    {
        name: "Project Five",
        images: ["assets/images/p5-1.jpg", "assets/images/p5-2.jpg", "assets/images/p5-3.jpg"],
        overview: "This is the overview for project five.",
        typeOfWork: "Mobile UI, App Redesign"
    }
  ];

  // adjustable gap between slides (px)
  const SLIDE_GAP = 20;

  function render() {
    if (progress < MIN) progress = MIN;
    if (progress > MAX) progress = MAX;

    slides.forEach((slide, i) => {
      const offset = i - progress;
      const absOffset = Math.abs(offset);

      const shadowL = slide.querySelector(".shadow-left");
      const shadowR = slide.querySelector(".shadow-right");

      // no tilt, only depth layering
      let rotateY = 0;
      let translateZ = 0;

      if (absOffset < 0.5) {
          translateZ = 0;
      } else if (absOffset < 1.5) {
          translateZ = -350;
      } else {
          translateZ = -700;
      }

      const slideHeight = slide.offsetHeight || 240;
      const yShift = offset * (slideHeight + SLIDE_GAP);

      slide.style.zIndex = 1000 - Math.round(absOffset * 10);
      slide.style.transform = `translate3d(-50%, calc(-50% + ${yShift}px), ${translateZ}px) rotateY(${rotateY}deg)`;

      if (shadowL) shadowL.style.opacity = offset > 0 ? absOffset : 0;
      if (shadowR) shadowR.style.opacity = offset < 0 ? absOffset : 0;
    });

    const activeIndex = Math.round(progress);
    const info = slideInfo[activeIndex];

    // update background color (guards for out-of-range)
    rightPanel.style.background = colors[activeIndex] || "#222";

    // update panel content (guard existence)
    const nameEl = document.getElementById("project-name");
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");
    const overviewEl = document.getElementById("project-overview");
    const typeEl = document.getElementById("type-of-work");

    if (info) {
      if (nameEl) nameEl.textContent = info.name;
      if (img1) { img1.src = info.images[0]; img1.alt = info.name + " image 1"; }
      if (img2) { img2.src = info.images[1]; img2.alt = info.name + " image 2"; }
      if (img3) { img3.src = info.images[2]; img3.alt = info.name + " image 3"; }
      if (overviewEl) overviewEl.textContent = info.overview;
      if (typeEl) typeEl.textContent = info.typeOfWork;
    }
  }

  render();

  // DRAG HANDLERS
  function startDrag(y) {
    dragging = true;
    startY = y;
    lastY = y;
    if (carousel) carousel.classList.add("dragging");
  }

  function onDrag(y) {
    if (!dragging) return;
    const dy = lastY - y; // reversed direction (drag up -> increase progress)
    lastY = y;

    progress += dy / 150;
    velocity = dy / 10;

    if (progress < MIN - 0.4) progress = MIN - 0.4;
    if (progress > MAX + 0.4) progress = MAX + 0.4;

    render();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (carousel) carousel.classList.remove("dragging");
    momentum();
  }

  // MOUSE EVENTS
  carousel.addEventListener("mousedown", e => startDrag(e.clientY));
  window.addEventListener("mousemove", e => onDrag(e.clientY));
  window.addEventListener("mouseup", endDrag);

  // TOUCH EVENTS
  carousel.addEventListener("touchstart", e => startDrag(e.touches[0].clientY), {passive:true});
  window.addEventListener("touchmove", e => {
    if (e.touches && e.touches[0]) onDrag(e.touches[0].clientY);
  }, {passive:true});
  window.addEventListener("touchend", endDrag);

  // MOMENTUM
  function momentum() {
    if (Math.abs(velocity) < 0.2) {
      progress = Math.round(progress);
      if (progress < MIN) progress = MIN;
      if (progress > MAX) progress = MAX;
      render();
      return;
    }
    progress += velocity * 0.1;
    velocity *= 0.8;

    if (progress < MIN - 0.5) progress = MIN - 0.5;
    if (progress > MAX + 0.5) progress = MAX + 0.5;

    render();
    requestAnimationFrame(momentum);
  }

  // keyboard accessibility: up/down to navigate
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { progress = Math.max(MIN, progress - 1); render(); }
    if (e.key === 'ArrowDown') { progress = Math.min(MAX, progress + 1); render(); }
  });
});