/* main.js */

document.addEventListener('DOMContentLoaded', () => {
  // DOM elements
  const pic1 = document.getElementById("pic1");
  const pic1Back = document.getElementById("pic1Back");
  const kuching1 = document.getElementById("kuching1");
  const deanlist = document.getElementById("deanlist");
  const projectText = document.getElementById("projectText");
  const navbarLinks = document.querySelectorAll(".nav-link");
  const underline = document.querySelector(".nav-underline");
  const sections = document.querySelectorAll(".section");
  const section1 = document.querySelector(".section1");
  const section2 = document.querySelector(".section2");
  const section3 = document.querySelector(".section3");
  const section4 = document.querySelector(".section4"); // "more"
  const section5 = document.querySelector(".section5"); // contact
  const topLeftMotto = document.querySelector(".top-left-motto");
  const mainMotto = document.querySelector(".main-motto");
  const webAnimation = document.getElementById("webAnimation");
  const arrow = document.getElementById("arrow");
  
  let vw = window.innerWidth, vh = window.innerHeight;
  let scaleCover = 1;
  let latestScrollY = window.scrollY;
  let ticking = false;

  // Update section height based on viewport
  function updateSectionHeight() {
    if (section1) section1.style.height = `${vh}px`;
    if (section3) section3.style.minHeight = `${vh * 1.2}px`;
  }

  window.addEventListener("resize", () => {
    vw = window.innerWidth; vh = window.innerHeight;
    updateSectionHeight();
    updateUnderline();
    if (pic1) {
      const n = nat(pic1);
      const sx = window.innerWidth / n.w, sy = window.innerHeight / n.h;
      scaleCover = Math.max(sx, sy);
      pic1.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover})`;
      if (pic1Back) pic1Back.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover}) rotateY(180deg)`;
    }
  });

  updateSectionHeight();

  // Dynamic underline update based on section visibility
  function updateUnderline() {
    const centerY = window.scrollY + vh / 2;
    let activeLink = null;

    // --- CUSTOM RULE: Only the TOP 30% of Section 4 proxies to Section 3 ---
    if (section4) {
      const sec4Top = section4.offsetTop;
      const sec4Height = section4.offsetHeight;
      const sec4ZoneEnd = sec4Top + sec4Height * 0.3; // only top 30%

      // If the viewport center is inside TOP 30% of Section 4 → highlight PROJECT
      if (centerY >= sec4Top && centerY < sec4ZoneEnd) {
        activeLink = document.querySelector('.nav-link[href="#project"]');
      }
    }

    // Normal detection only if we didn't manually override
    if (!activeLink) {
      // Find link whose target section contains the center of the viewport
      for (const link of navbarLinks) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) continue;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) continue;

        const top = target.offsetTop;
        const height = target.offsetHeight;

        if (centerY >= top && centerY < top + height) {
          activeLink = link;
          break;
        }
      }
    }

    // If still no match, use fallback (last section above center)
    if (!activeLink) {
      let lastMatch = null;
      for (const link of navbarLinks) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) continue;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) continue;

        if (target.offsetTop <= centerY) lastMatch = link;
      }
      activeLink = lastMatch || navbarLinks[0];
    }

    // Update active class
    navbarLinks.forEach(link => link.classList.remove("active"));
    if (activeLink) activeLink.classList.add("active");

    // Move underline
    if (activeLink && underline) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = activeLink.parentElement.getBoundingClientRect();

      underline.style.width = `${linkRect.width}px`;
      underline.style.left = `${linkRect.left - navRect.left}px`;

      underline.style.backgroundColor =
        (activeLink.getAttribute('href') === '#home')
          ? "white"
          : "#b7b4b4";
    }
  }

  window.addEventListener("scroll", updateUnderline, { passive: true });
  updateUnderline();

  // Safe natural dimensions for scaling
  function nat(img, fw = 1600, fh = 900) {
    if (!img) return { w: fw, h: fh };
    return { w: img.naturalWidth || fw, h: img.naturalHeight || fh };
  }

  // Initial cover scale and position
  if (pic1) {
    const n = nat(pic1);
    const sx = vw / n.w, sy = vh / n.h;
    scaleCover = Math.max(sx, sy);
    pic1.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover})`;
    if (pic1Back) pic1Back.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover}) rotateY(180deg)`;
  }

  // Constants for zoom and transform animations
  const scaleFinal = 0.40;
  const finalZoomScale = 0.63;
  const topStart = 65;
  const topFinal2 = 65;
  const topCenter3 = 53;

  // Fade threshold for section4 ("more") — images start disappearing before section3 ends
  const section4FadeStart = 0.87;

  let imagesHidden = false;
  let hideTimeoutId = null;

  // Fade out fixed images quickly
  function fadeOutFixedImagesQuick() {
    if (imagesHidden) return;
    if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

    [pic1, pic1Back, kuching1, deanlist].forEach(el => {
      if (!el) return;
      el.classList.add('quick-fade');
      el.classList.remove('hidden-after-fade');
      el.style.willChange = 'opacity, transform';
      el.style.pointerEvents = 'none'; // prevent click/drag
    });

    hideTimeoutId = setTimeout(() => {
      [pic1, pic1Back, kuching1, deanlist].forEach(el => {
        if (!el) return;
        el.classList.add('hidden-after-fade');
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';  // completely remove from layout
      });
      imagesHidden = true;
      hideTimeoutId = null;
    }, 120);
  }

  // Fade in fixed images quickly
  function fadeInFixedImagesQuick() {
    if (!imagesHidden && !hideTimeoutId) return;
    if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

    [pic1, pic1Back, kuching1, deanlist].forEach(el => {
      if (!el) return;
      el.style.display = '';  // restore display
      el.classList.remove('hidden-after-fade');
      el.removeAttribute('aria-hidden');
      void el.offsetHeight;  // force reflow
      el.classList.remove('quick-fade');
      el.style.willChange = 'transform, top, left, opacity';
      el.style.pointerEvents = 'auto'; // restore interactivity
    });

    imagesHidden = false;
  }

  // Scroll event handling
  window.addEventListener('scroll', () => {
    latestScrollY = window.scrollY;
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(processScroll);
    }
  }, { passive: true });

  function processScroll() {
    ticking = false;
    const scrollY = latestScrollY;

    // BATCH READS
    const section2Top = section2 ? section2.offsetTop : 0;
    const sec2H = section2 ? section2.offsetHeight : 1;
    const sec2Rect = section2 ? section2.getBoundingClientRect() : { top: Infinity, height: 1 };
    const sec3Rect = section3 ? section3.getBoundingClientRect() : { top: Infinity, height: 1 };
    const sec4Rect = section4 ? section4.getBoundingClientRect() : { top: Infinity };

    // Navbar color change on scroll
    if (section2 && scrollY < section2Top) navbarLinks.forEach(l => l.style.color = "#fff");
    else navbarLinks.forEach(l => l.style.color = "#b7b4b4");

    // Motto fade effect
    const section1Height = section1 ? section1.offsetHeight : vh;
    const mottoProgress = Math.min(scrollY / (section1Height * 0.7), 1);
    if (mainMotto) mainMotto.style.opacity = `${1 - mottoProgress}`;
    if (topLeftMotto) topLeftMotto.style.opacity = `${1 - mottoProgress}`;

    // SECTION 1 -> 2 zoom out
    const progress = Math.min(scrollY / (sec2H * 0.7), 1);
    const scaleTarget = scaleCover - (scaleCover - scaleFinal) * progress;
    const currentTopTarget = topStart + (topFinal2 - topStart) * progress;
    const shiftXTarget = progress * 10;

    let applyTop = currentTopTarget;
    let applyScale = scaleTarget;
    let applyShiftX = shiftXTarget;
    let applyRot = 0;
    let applyBackRot = 180;

    // SECTION 3 ZOOM IN + FLIP
    if (sec3Rect.top < vh) {
      const p = 1 - (sec3Rect.top / vh);
      const eased = p * p * (3 - 2 * p); // smoothstep
      const zoom = scaleFinal + (finalZoomScale - scaleFinal) * eased;
      const topMove = topFinal2 + (topCenter3 - topFinal2) * eased;
      const shiftX3 = 10 * (1 - eased) + (3 * eased);
      const rot = eased * 180;

      applyScale = zoom;
      applyTop = topMove;
      applyShiftX = shiftX3;
      applyRot = rot;
      applyBackRot = 180 + rot;
    }

    // KUCHING / deanlist opacity and placement
    let kuchingProgress = Math.min(Math.max(progress - 0.15, 0) / 0.4, 1);
    let section3Overlap = 1 - (sec3Rect.top / vh);
    let fadeOut = Math.max(1 - (section3Overlap - 0.3) / 0.4, 0);
    let finalOpacity = Math.min(kuchingProgress, fadeOut);

    // ABOUT toggles
    const aboutTitle = document.querySelector(".about-title");
    const aboutDesc = document.querySelector(".about-description");
    if (aboutTitle && aboutDesc) {
      if (finalOpacity > 0) { aboutTitle.classList.add("visible"); aboutDesc.classList.add("visible"); }
      else { aboutTitle.classList.remove("visible"); aboutDesc.classList.remove("visible"); }
    }

    // PROJECT text / webAnimation / icon behavior
    if (projectText) {
      if (sec3Rect.top < vh * 0.8) projectText.classList.add('visible');
      else projectText.classList.remove('visible');
    }

    const icon1 = document.getElementById('icon1');
    if (icon1) {
      if (sec3Rect.top < vh * 0.7) icon1.classList.add('visible');
      else icon1.classList.remove('visible');
    }

    const earth = document.getElementById('earth');
    if (earth) {
      if (sec3Rect.top < vh * 0.7) earth.classList.add('visible');
      else earth.classList.remove('visible');
    }

    const quote = document.getElementById('quote');
    if (quote) {
      if (sec3Rect.top < vh * 0.8) quote.classList.add("visible");
      else quote.classList.remove("visible");
    }

    // Fade pic1/pic1Back quickly when entering section4 (more)
    const shouldFade = sec4Rect.top < vh * section4FadeStart;
    if (shouldFade) fadeOutFixedImagesQuick();
    else fadeInFixedImagesQuick();

    // BATCH WRITES — apply transforms immediately (no lerp)
    if (pic1 && !imagesHidden) {
      pic1.style.top = `${applyTop}%`;
      pic1.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyRot}deg)`;
      pic1.style.opacity = pic1.classList.contains('quick-fade') ? '' : '1';
    }
    if (pic1Back && !imagesHidden) {
      pic1Back.style.top = `${applyTop}%`;
      pic1Back.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyBackRot}deg)`;
      pic1Back.style.opacity = pic1Back.classList.contains('quick-fade') ? '' : '1';
    }

    // kuching placement + opacity immediate
    if (kuching1) {
      if (finalOpacity > 0.01 && !imagesHidden) {
        kuching1.style.opacity = `${finalOpacity}`;
        kuching1.style.left = `${50 + 33 * kuchingProgress}%`;
        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight * 0.95}px`;
      } else {
        kuching1.style.opacity = "0";
      }
    }

    // deanlist immediate
    if (deanlist) {
      deanlist.style.opacity = `${finalOpacity}`;
      deanlist.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
    }

    // arrow immediate
    if (arrow) {
      arrow.style.opacity = `${finalOpacity}`;
      arrow.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
    }

    updateUnderline();
  }

  // Handle images loading
  if (pic1) {
    pic1.addEventListener("load", () => {
      const n = nat(pic1);
      const sx = window.innerWidth / n.w, sy = window.innerHeight / n.h;
      scaleCover = Math.max(sx, sy) * 1.05;
      latestScrollY = window.scrollY;
      if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
    });
    if (pic1.complete) pic1.dispatchEvent(new Event('load'));
  } else {
    latestScrollY = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
  }

});
