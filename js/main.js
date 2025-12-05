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
  const section4 = document.querySelector(".section4");
  const section5 = document.querySelector(".section5");
  const topLeftMotto = document.querySelector(".top-left-motto");
  const mainMotto = document.querySelector(".main-motto");
  const arrow = document.getElementById("arrow");
  const earth = document.getElementById('earth');

  let vw = window.innerWidth, vh = window.innerHeight;
  let latestScrollY = window.scrollY;
  let ticking = false;
  let scaleCover = 1;

  // --- UTILITY FUNCTIONS ---
  function updateSectionHeight() {
    if (section1) section1.style.height = `${vh}px`;
    if (section3) section3.style.minHeight = `${vh * 1.2}px`;
  }

  function nat(img, fw = 1600, fh = 900) {
    if (!img) return { w: fw, h: fh };
    return { w: img.naturalWidth || fw, h: img.naturalHeight || fh };
  }

  function getScaleForSection(img, widthPercent = 0.45, heightPercent = 0.5) {
    const n = nat(img);
    const scaleByWidth = (vw * widthPercent) / n.w;
    const scaleByHeight = (vh * heightPercent) / n.h;
    return Math.min(scaleByWidth, scaleByHeight);
  }

  function updateUnderline() {
    const centerY = window.scrollY + vh / 2;
    let activeLink = null;

    if (section4) {
      const sec4Top = section4.offsetTop;
      const sec4Height = section4.offsetHeight;
      const sec4ZoneEnd = sec4Top + sec4Height * 0.3;
      if (centerY >= sec4Top && centerY < sec4ZoneEnd) {
        activeLink = document.querySelector('.nav-link[href="#project"]');
      }
    }

    if (!activeLink) {
      for (const link of navbarLinks) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) continue;
        const target = document.getElementById(href.slice(1));
        if (!target) continue;
        if (centerY >= target.offsetTop && centerY < target.offsetTop + target.offsetHeight) {
          activeLink = link;
          break;
        }
      }
    }

    if (!activeLink) {
      let lastMatch = null;
      for (const link of navbarLinks) {
        const href = link.getAttribute('href') || '';
        if (!href.startsWith('#')) continue;
        const target = document.getElementById(href.slice(1));
        if (!target) continue;
        if (target.offsetTop <= centerY) lastMatch = link;
      }
      activeLink = lastMatch || navbarLinks[0];
    }

    navbarLinks.forEach(link => link.classList.remove("active"));
    if (activeLink) activeLink.classList.add("active");

    if (activeLink && underline) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = activeLink.parentElement.getBoundingClientRect();
      underline.style.width = `${linkRect.width}px`;
      underline.style.left = `${linkRect.left - navRect.left}px`;
      underline.style.backgroundColor = (activeLink.getAttribute('href') === '#home') ? "white" : "#b7b4b4";
    }
  }

  function fadeOutFixedImagesQuick() {
    [pic1, pic1Back, kuching1, deanlist].forEach(el => {
      if (!el) return;
      el.classList.add('quick-fade');
      el.classList.remove('hidden-after-fade');
      el.style.willChange = 'opacity, transform';
      el.style.pointerEvents = 'none';
    });
    hideTimeoutId = setTimeout(() => {
      [pic1, pic1Back, kuching1, deanlist].forEach(el => {
        if (!el) return;
        el.classList.add('hidden-after-fade');
        el.setAttribute('aria-hidden', 'true');
        el.style.display = 'none';
      });
      imagesHidden = true;
    }, 120);
  }

  function fadeInFixedImagesQuick() {
    [pic1, pic1Back, kuching1, deanlist].forEach(el => {
      if (!el) return;
      el.style.display = '';
      el.classList.remove('hidden-after-fade', 'quick-fade');
      el.removeAttribute('aria-hidden');
      void el.offsetHeight;
      el.style.willChange = 'transform, top, left, opacity';
      el.style.pointerEvents = 'auto';
    });
    imagesHidden = false;
  }

  function updateScales() {
    if (pic1) {
      const n = nat(pic1);
      const sx = vw / n.w, sy = vh / n.h;
      scaleCover = Math.max(sx, sy) * 1.3;
      pic1.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover})`;
      if (pic1Back) pic1Back.style.transform = `translate3d(-50%,-50%,0) scale(${scaleCover}) rotateY(180deg)`;
    }
  }

  function processScroll() {
    ticking = false;
    const scrollY = latestScrollY;

    const sec2H = section2 ? section2.offsetHeight : 1;
    const sec2Rect = section2 ? section2.getBoundingClientRect() : { top: Infinity, height: 1 };
    const sec3Rect = section3 ? section3.getBoundingClientRect() : { top: Infinity, height: 1 };
    const sec4Rect = section4 ? section4.getBoundingClientRect() : { top: Infinity };

    // Navbar color
    if (section2 && scrollY < section2.offsetTop) navbarLinks.forEach(l => l.style.color = "#fff");
    else navbarLinks.forEach(l => l.style.color = "#b7b4b4");

    // Motto fade
    const section1Height = section1 ? section1.offsetHeight : vh;
    const mottoProgress = Math.min(scrollY / (section1Height * 0.7), 1);
    if (mainMotto) mainMotto.style.opacity = `${1 - mottoProgress}`;
    if (topLeftMotto) topLeftMotto.style.opacity = `${1 - mottoProgress}`;

    // SECTION 1 → 2
    const progress = Math.min(scrollY / (sec2H * 0.7), 1);
    const scaleSection2 = getScaleForSection(pic1, 0.45, 0.5);
    const scaleTarget = scaleCover - (scaleCover - scaleSection2) * progress;
    const topStart = 65;
    const topFinal2 = 65;

    // Mobile offsets
    let mobileYOffset = 0; // vertical shift
    let mobileXOffset = 0; // horizontal shift
    if (vw < 600) {
      mobileYOffset = 7;    // move down by 7%
      mobileXOffset = -33;  // move right by 33%
    }

    // Smoothly interpolate mobile offsets over progress
    let topOffset = 0;
    let shiftXOffset = 0;
    if (vw < 600) {
      // Only interpolate while in section 2 scroll
      topOffset = mobileYOffset * progress;
      shiftXOffset = mobileXOffset * progress;
    }

    let currentTopTarget = topStart + (topFinal2 - topStart) * progress + topOffset;
    let shiftXTarget = progress * 10 + shiftXOffset;

    let applyTop = currentTopTarget;
    let applyScale = scaleTarget;
    let applyShiftX = shiftXTarget;
    let applyRot = 0;
    let applyBackRot = 180;

    // SECTION 3 zoom/flip dynamically
if (sec3Rect.top < vh) {
  const p = 1 - (sec3Rect.top / vh);
  const eased = p * p * (3 - 2 * p);

  // Detect mobile
  const isMobile = window.innerWidth <= 600; // adjust breakpoint if needed

  // Get scale range for the section
  // Make the final scale smaller on mobile
  const minScale = isMobile ? 0.65 : 0.75; // smaller on mobile
  const maxScale = isMobile ? 0.75 : 0.85; // smaller on mobile
  const scaleSection3 = getScaleForSection(pic1, minScale, maxScale);

  const zoom = scaleTarget + (scaleSection3 - scaleTarget) * eased;

  const topCenter3 = 53;
  const topMove = topFinal2 + (topCenter3 - topFinal2) * eased;

  const shiftX3 = 10 * (1 - eased) + (3 * eased);
  const rot = eased * 180;

  applyScale = zoom;
  applyTop = topMove;
  applyShiftX = shiftX3;
  applyRot = rot;
  applyBackRot = 180 + rot;
}

    // KUCHING / deanlist
    let kuchingProgress = Math.min(Math.max(progress - 0.15, 0) / 0.4, 1);
    let section3Overlap = 1 - (sec3Rect.top / vh);
    let fadeOut = Math.max(1 - (section3Overlap - 0.3) / 0.4, 0);
    let finalOpacity = Math.min(kuchingProgress, fadeOut);

    const aboutTitle = document.querySelector(".about-title");
    const aboutDesc = document.querySelector(".about-description");
    if (aboutTitle && aboutDesc) {
      if (finalOpacity > 0) { aboutTitle.classList.add("visible"); aboutDesc.classList.add("visible"); }
      else { aboutTitle.classList.remove("visible"); aboutDesc.classList.remove("visible"); }
    }

    // SECTION 3 animations
    if (section3) {
      const p = Math.min(Math.max((vh - sec3Rect.top) / vh, 0), 1);

      if (projectText) {
        const moveY = -40 * p;
        projectText.style.opacity = p;
        projectText.style.transform =
          `translate(calc(-50%), calc(-50% + ${moveY}px)) rotate(-90deg) scale(${0.8 + 0.2 * p})`;
      }
      const icon1 = document.getElementById("icon1");
      if (icon1) { icon1.style.opacity = p; icon1.style.transform = `translateY(${-60 * p}px) scale(${0.8 + 0.2 * p})`; }
      const quote = document.getElementById("quote");
      if (quote) { quote.style.opacity = p; quote.style.transform = `translateY(${-30 * p}px) scale(${0.8 + 0.2 * p})`; }
      if (earth) { earth.style.opacity = p; earth.style.transform = `translate(-50%, calc(-50% + ${-50 * p}px)) scale(${0.8 + 0.2 * p})`; }
    }

    // Fade pic1/pic1Back
    const section4FadeStart = 0.87;
    const shouldFade = sec4Rect.top < vh * section4FadeStart;
    if (shouldFade) fadeOutFixedImagesQuick();
    else fadeInFixedImagesQuick();

    // Apply transforms
    if (pic1 && !imagesHidden) pic1.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyRot}deg)`;
    if (pic1Back && !imagesHidden) pic1Back.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyBackRot}deg)`;
    if (pic1) pic1.style.top = `${applyTop}%`; if (pic1Back) pic1Back.style.top = `${applyTop}%`;

    if (kuching1) {
      if (finalOpacity > 0 && !imagesHidden) {
        kuching1.style.opacity = `${finalOpacity}`;

        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight * 0.95}px`;

        // Mobile vs desktop X position
        let leftValue;
        if (vw < 600) {
          // Mobile: smaller movement
          leftValue = 50 + 18 * kuchingProgress; // adjust 18 as needed
        } else {
          // Desktop: original movement
          leftValue = 50 + 33 * kuchingProgress;
        }
        kuching1.style.left = `${leftValue}%`;

      } else {
        kuching1.style.opacity = "0";
      }
    }

    if (deanlist) deanlist.style.opacity = `${finalOpacity}`;
    if (deanlist) deanlist.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
    if (arrow) { arrow.style.opacity = `${finalOpacity}`; arrow.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)"; }

    updateUnderline();
  }

  // --- EVENT LISTENERS ---
  window.addEventListener("resize", () => {
    vw = window.innerWidth; vh = window.innerHeight;
    updateSectionHeight();
    updateUnderline();
    updateScales();
    processScroll();
  });

  window.addEventListener('scroll', () => {
    latestScrollY = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
  }, { passive: true });

  // Initialize
  updateSectionHeight();
  updateScales();
  processScroll();
  updateUnderline();

  if (pic1) {
    pic1.addEventListener("load", () => {
      updateScales();
      if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
    });
    if (pic1.complete) pic1.dispatchEvent(new Event('load'));
  }
});
