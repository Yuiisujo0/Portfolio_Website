/* main.js
   Updated:
   - Added a separate contact section (section5) in HTML.
   - Improved underline logic so nav links map to their target sections (robust when you add extra sections).
   - Keeps the faster fade/hide behavior for pic1 / pic1Back so they don't linger into the next sections.
*/

document.addEventListener('DOMContentLoaded', () => {
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

  
  let vw = window.innerWidth, vh = window.innerHeight;

  function updateSectionHeight() {
    if (section1) section1.style.height = `${vh}px`;
    if (section3) section3.style.height = `${vh * 1.4}px`;
  }

  window.addEventListener("resize", () => {
    vw = window.innerWidth; vh = window.innerHeight;
    updateSectionHeight();
    updateUnderline();

    if (pic1) {
      const n = nat(pic1);
      const sx = window.innerWidth / n.w, sy = window.innerHeight / n.h;
      scaleCover = Math.max(sx, sy) ;
    }
  });

  updateSectionHeight();

  // More robust underline logic:
  // Instead of assuming a 1:1 mapping between .section and .nav-link,
  // map each nav-link to the element referenced by its href (e.g. #about).
  // That way adding new sections won't shift the nav indexing.
  function updateUnderline() {
    const centerY = window.scrollY + vh / 2;
    let activeLink = null;

    // Find link whose target section contains viewport center
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

    // If no exact match, pick the last link whose section top is <= centerY,
    // otherwise default to the first link.
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

    // Update classes
    navbarLinks.forEach(link => link.classList.remove("active"));
    if (activeLink) activeLink.classList.add("active");

    // Position underline under the active link
    if (activeLink && underline) {
      const linkRect = activeLink.getBoundingClientRect();
      const navRect = activeLink.parentElement.getBoundingClientRect();
      underline.style.width = `${linkRect.width}px`;
      underline.style.left = `${linkRect.left - navRect.left}px`;
      // change color for home vs others to keep previous behavior
      underline.style.backgroundColor = (activeLink.getAttribute('href') === '#home') ? "white" : "#b7b4b4";
    }
  }
  window.addEventListener("scroll", updateUnderline, { passive: true });
  updateUnderline();

  // safe natural dimensions
  function nat(img, fw = 1600, fh = 900) {
    if (!img) return { w: fw, h: fh };
    return { w: img.naturalWidth || fw, h: img.naturalHeight || fh };
  }

  // initial cover scale
  let scaleCover = 1;
  if (pic1) {
    const n = nat(pic1);
    const sx = vw / n.w, sy = vh / n.h;
    const sc = Math.max(sx, sy);
    scaleCover = sc;
    pic1.style.transform = `translate3d(-50%,-50%,0) scale(${sc})`;
    if (pic1Back) pic1Back.style.transform = `translate3d(-50%,-50%,0) scale(${sc}) rotateY(180deg)`;
  }

  // constants
  const scaleFinal = 0.30;
  const finalZoomScale = 0.6;
  const topStart = 65;
  const topFinal2 = 70;
  const topCenter3 = 50;

  // fade threshold for section4 ("more") — images will start disappearing before the end of section3
  const section4FadeStart = 1.25;

  let imagesHidden = false;
  let hideTimeoutId = null;

  function fadeOutFixedImagesQuick() {
    if (imagesHidden) return;
    if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

    [pic1, pic1Back, kuching1].forEach(el => {
      if (!el) return;
      el.classList.add('quick-fade');
      el.classList.remove('hidden-after-fade');
      el.style.willChange = 'opacity';
    });

    hideTimeoutId = setTimeout(() => {
      [pic1, pic1Back, kuching1].forEach(el => {
        if (!el) return;
        el.classList.add('hidden-after-fade');
        el.setAttribute('aria-hidden', 'true');
      });
      imagesHidden = true;
      hideTimeoutId = null;
    }, 120);
  }

  function fadeInFixedImagesQuick() {
    if (!imagesHidden && !hideTimeoutId) return;
    if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

    [pic1, pic1Back, kuching1].forEach(el => {
      if (!el) return;
      el.classList.remove('hidden-after-fade');
      el.removeAttribute('aria-hidden');
      // force reflow
      void el.offsetHeight;
      el.classList.remove('quick-fade');
      el.style.willChange = 'transform, top, left, opacity';
    });

    imagesHidden = false;
  }

  let latestScrollY = window.scrollY;
  let ticking = false;

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

    // navbar color immediate
    if (section2 && scrollY < section2Top) navbarLinks.forEach(l => l.style.color = "#fff");
    else navbarLinks.forEach(l => l.style.color = "#b7b4b4");

    // motto fade
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
      const shiftX3 = 10 * (1 - eased) +3;
      const rot = eased * 180;

      applyScale = zoom;
      applyTop = topMove;
      applyShiftX = shiftX3;
      applyRot = rot;
      applyBackRot = 180 + rot;
    }

    // KUCHING / deanlist opacity
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

    if (webAnimation) {
      if (sec3Rect.top < vh * 0.8) webAnimation.classList.add("visible");
      else webAnimation.classList.remove("visible");
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
        kuching1.style.left = `${50 + 30 * kuchingProgress}%`;
        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight}px`;
      } else {
        kuching1.style.opacity = "0";
      }
    }

    // deanlist immediate
    if (deanlist) {
      deanlist.style.opacity = `${finalOpacity}`;
      deanlist.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
    }

    updateUnderline();
  }

  // initialization
  if (pic1) {
    pic1.addEventListener("load", () => {
      const n = nat(pic1);
      const sx = window.innerWidth / n.w, sy = window.innerHeight / n.h;
      scaleCover = Math.max(sx, sy)* 1.05;
      latestScrollY = window.scrollY;
      if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
    });
    if (pic1.complete) pic1.dispatchEvent(new Event('load'));
  } else {
    latestScrollY = window.scrollY;
    if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
  }
});