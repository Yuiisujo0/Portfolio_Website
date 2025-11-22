/* main.js - rewritten with defensive checks and minor refactors */
(function () {
  let initialized = false;

  function initMain() {
    if (initialized) return;
    initialized = true;

    // ---------- DOM queries (safe: DOM parsed & loader finished) ----------
    const pic1 = document.getElementById("pic1");
    const pic1Back = document.getElementById("pic1Back");
    const kuching1 = document.getElementById("kuching1");
    const deanlist = document.getElementById("deanlist");
    const projectText = document.getElementById("projectText");
    const navbarLinks = document.querySelectorAll(".nav-link") || [];
    const underline = document.querySelector(".nav-underline");
    const sections = document.querySelectorAll(".section") || [];
    const section1 = document.querySelector(".section1");
    const section2 = document.querySelector(".section2");
    const section3 = document.querySelector(".section3");
    const section4 = document.querySelector(".section4"); // "more"
    const section5 = document.querySelector(".section5"); // contact
    const topLeftMotto = document.querySelector(".top-left-motto");
    const mainMotto = document.querySelector(".main-motto");
    const webAnimation = document.getElementById("webAnimation");
    const arrow = document.getElementById("arrow");

    // ---------- viewport & state ----------
    let vw = window.innerWidth;
    let vh = window.innerHeight;
    let scaleCover = 1;
    let latestScrollY = window.scrollY || 0;
    let ticking = false;

    // ---------- helpers ----------
    function safeForEach(nodeList, fn) {
      if (!nodeList) return;
      // NodeList supports forEach; if it's not, convert to array
      if (typeof nodeList.forEach === "function") nodeList.forEach(fn);
      else Array.from(nodeList).forEach(fn);
    }

    // return natural dimensions safely
    function nat(img, fw = 1600, fh = 900) {
      if (!img) return { w: fw, h: fh };
      return {
        w: img.naturalWidth || img.width || fw,
        h: img.naturalHeight || img.height || fh
      };
    }

    // safe function to set multiple style props
    function setStyles(el, obj) {
      if (!el) return;
      for (const k in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (Object.prototype.hasOwnProperty.call(obj, k)) el.style[k] = obj[k];
      }
    }

    // get a reasonable nav container rect to position underline
    function getNavContainerRect(link) {
      if (!link) return { left: 0, top: 0 };
      // Try offsetParent first (most robust for positioned nav)
      const container = link.offsetParent || link.closest("nav") || link.parentElement;
      return container ? container.getBoundingClientRect() : link.parentElement.getBoundingClientRect();
    }

    // ---------- layout updates ----------
    function updateSectionHeight() {
      if (section1) section1.style.height = `${vh}px`;
      if (section3) section3.style.minHeight = `${Math.round(vh * 1.2)}px`;
    }

    // Update underline based on section in center of viewport
    function updateUnderline() {
      if (!navbarLinks || navbarLinks.length === 0 || !underline) return;

      const centerY = (window.scrollY || 0) + vh / 2;
      let activeLink = null;

      for (const link of navbarLinks) {
        const href = link.getAttribute("href") || "";
        if (!href.startsWith("#")) continue;
        const id = href.slice(1);
        const target = document.getElementById(id);
        if (!target) continue;
        const top = target.offsetTop;
        const height = target.offsetHeight || target.clientHeight || 0;
        if (centerY >= top && centerY < top + height) {
          activeLink = link;
          break;
        }
      }

      if (!activeLink) {
        // fallback: choose last link whose section top <= centerY
        let lastMatch = null;
        for (const link of navbarLinks) {
          const href = link.getAttribute("href") || "";
          if (!href.startsWith("#")) continue;
          const id = href.slice(1);
          const target = document.getElementById(id);
          if (!target) continue;
          if (target.offsetTop <= centerY) lastMatch = link;
        }
        activeLink = lastMatch || (navbarLinks[0] || null);
      }

      // update classes
      safeForEach(navbarLinks, (link) => link.classList && link.classList.remove("active"));
      if (activeLink && activeLink.classList) activeLink.classList.add("active");

      // position underline beneath the active link
      if (activeLink) {
        const linkRect = activeLink.getBoundingClientRect();
        const navRect = getNavContainerRect(activeLink);
        const left = linkRect.left - navRect.left;
        setStyles(underline, {
          width: `${Math.round(linkRect.width)}px`,
          left: `${Math.round(left)}px`,
          backgroundColor: (activeLink.getAttribute("href") === "#home") ? "white" : "#b7b4b4"
        });
      }
    }

    // ---------- initial cover scale ----------
    (function initCoverScale() {
      if (!pic1) return;
      const n = nat(pic1);
      const sx = vw / n.w;
      const sy = vh / n.h;
      scaleCover = Math.max(sx, sy);
      setStyles(pic1, {
        transform: `translate3d(-50%,-50%,0) scale(${scaleCover})`
      });
      if (pic1Back) {
        setStyles(pic1Back, {
          transform: `translate3d(-50%,-50%,0) scale(${scaleCover}) rotateY(180deg)`
        });
      }
    })();

    // ---------- constants (kept from your original) ----------
    const scaleFinal = 0.40;
    const finalZoomScale = 0.63;
    const topStart = 65;
    const topFinal2 = 65;
    const topCenter3 = 53;
    const section4FadeStart = 0.87;

    let imagesHidden = false;
    let hideTimeoutId = null;

    function fadeOutFixedImagesQuick() {
      if (imagesHidden) return;
      if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

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
        hideTimeoutId = null;
      }, 120);
    }

    function fadeInFixedImagesQuick() {
      // If already visible and no pending timeout -> noop
      if (!imagesHidden && !hideTimeoutId) return;
      if (hideTimeoutId) { clearTimeout(hideTimeoutId); hideTimeoutId = null; }

      [pic1, pic1Back, kuching1, deanlist].forEach(el => {
        if (!el) return;
        el.style.display = '';
        el.classList.remove('hidden-after-fade');
        el.removeAttribute('aria-hidden');
        // force reflow to ensure transitions start
        // eslint-disable-next-line no-unused-expressions
        el.offsetHeight;
        el.classList.remove('quick-fade');
        el.style.willChange = 'transform, top, left, opacity';
        el.style.pointerEvents = 'auto';
      });

      imagesHidden = false;
    }

    // ---------- scroll handling (batch reads then writes) ----------
    window.addEventListener('scroll', () => {
      latestScrollY = window.scrollY || 0;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(processScroll);
      }
    }, { passive: true });

    function processScroll() {
      ticking = false;
      const scrollY = latestScrollY;

      // ---------- batch reads ----------
      const section2Top = section2 ? section2.offsetTop : Infinity;
      const sec2H = section2 ? section2.offsetHeight || 1 : 1;
      const sec2Rect = section2 ? section2.getBoundingClientRect() : { top: Infinity, height: 1 };
      const sec3Rect = section3 ? section3.getBoundingClientRect() : { top: Infinity, height: 1 };
      const sec4Rect = section4 ? section4.getBoundingClientRect() : { top: Infinity };

      // Navbar color update
      if (section2 && typeof scrollY === "number" && scrollY < section2Top) {
        safeForEach(navbarLinks, l => l.style && (l.style.color = "#fff"));
      } else {
        safeForEach(navbarLinks, l => l.style && (l.style.color = "#b7b4b4"));
      }

      // Motto fade effect
      const section1Height = section1 ? (section1.offsetHeight || vh) : vh;
      const mottoProgress = Math.min((scrollY) / (section1Height * 0.7), 1);
      if (mainMotto) mainMotto.style.opacity = `${1 - mottoProgress}`;
      if (topLeftMotto) topLeftMotto.style.opacity = `${1 - mottoProgress}`;

      // SECTION 1 -> 2 zoom out calculations
      const progress = Math.min((scrollY) / (sec2H * 0.7), 1);
      const scaleTarget = scaleCover - (scaleCover - scaleFinal) * progress;
      const currentTopTarget = topStart + (topFinal2 - topStart) * progress;
      const shiftXTarget = progress * 10;

      let applyTop = currentTopTarget;
      let applyScale = scaleTarget;
      let applyShiftX = shiftXTarget;
      let applyRot = 0;
      let applyBackRot = 180;

      // SECTION 3 ZOOM IN + FLIP (when section3 top enters viewport)
      if (sec3Rect.top < vh) {
        const p = 1 - (sec3Rect.top / vh);
        const eased = Math.max(0, Math.min(1, p * p * (3 - 2 * p))); // smoothstep clamped
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

      // KUCHING / deanlist opacity and placement calculations
      const kuchingProgress = Math.min(Math.max(progress - 0.15, 0) / 0.4, 1);
      const section3Overlap = 1 - (sec3Rect.top / vh);
      const fadeOut = Math.max(1 - ((section3Overlap - 0.3) / 0.4), 0);
      const finalOpacity = Math.min(kuchingProgress, fadeOut);

      // ABOUT toggles
      const aboutTitle = document.querySelector(".about-title");
      const aboutDesc = document.querySelector(".about-description");
      if (aboutTitle && aboutDesc) {
        if (finalOpacity > 0) {
          aboutTitle.classList.add("visible");
          aboutDesc.classList.add("visible");
        } else {
          aboutTitle.classList.remove("visible");
          aboutDesc.classList.remove("visible");
        }
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

      // ---------- batch writes ----------
      if (pic1 && !imagesHidden) {
        setStyles(pic1, {
          top: `${applyTop}%`,
          transform: `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyRot}deg)`,
          opacity: pic1.classList.contains('quick-fade') ? '' : '1'
        });
      }
      if (pic1Back && !imagesHidden) {
        setStyles(pic1Back, {
          top: `${applyTop}%`,
          transform: `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyBackRot}deg)`,
          opacity: pic1Back.classList.contains('quick-fade') ? '' : '1'
        });
      }

      if (kuching1) {
        if (finalOpacity > 0.01 && !imagesHidden) {
          kuching1.style.opacity = `${finalOpacity}`;
          kuching1.style.left = `${50 + 33 * kuchingProgress}%`;
          const rect = (pic1 && typeof pic1.getBoundingClientRect === "function") ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
          // Ensure kuching1.offsetHeight read is safe (if not yet in DOM it will be 0)
          const kh = kuching1.offsetHeight || 0;
          kuching1.style.top = `${(rect.bottom || (vh / 2)) - (kh * 0.95)}px`;
        } else {
          kuching1.style.opacity = "0";
        }
      }

      if (deanlist) {
        deanlist.style.opacity = `${finalOpacity}`;
        deanlist.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
      }

      if (arrow) {
        arrow.style.opacity = `${finalOpacity}`;
        arrow.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
      }

      updateUnderline();
    }

    // ---------- image load handling ----------
    if (pic1) {
      pic1.addEventListener("load", () => {
        const n = nat(pic1);
        const sx = window.innerWidth / n.w;
        const sy = window.innerHeight / n.h;
        scaleCover = Math.max(sx, sy) * 1.05;
        latestScrollY = window.scrollY || 0;
        if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
      });
      // if it's already loaded
      if (pic1.complete) {
        // trigger load handler asynchronously to avoid sync reflow
        setTimeout(() => pic1.dispatchEvent(new Event('load')), 0);
      }
    } else {
      latestScrollY = window.scrollY || 0;
      if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
    }

    // ---------- resize handling ----------
    window.addEventListener("resize", () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      updateSectionHeight();
      updateUnderline();

      if (pic1) {
        const n = nat(pic1);
        const sx = window.innerWidth / n.w;
        const sy = window.innerHeight / n.h;
        scaleCover = Math.max(sx, sy);
        setStyles(pic1, { transform: `translate3d(-50%,-50%,0) scale(${scaleCover})` });
        if (pic1Back) setStyles(pic1Back, { transform: `translate3d(-50%,-50%,0) scale(${scaleCover}) rotateY(180deg)` });
      }
      // recompute a final scroll pass in case layout changed
      latestScrollY = window.scrollY || 0;
      if (!ticking) { ticking = true; requestAnimationFrame(processScroll); }
    }, { passive: true });

    // ---------- initial layout run ----------
    updateSectionHeight();
    updateUnderline();

    // end initMain
  } // initMain

  // ---------- schedule initialization (handles loader presence safely) ----------
  function scheduleInit() {
    const mainElWhenCalled = document.getElementById('mainContent');

    if (document.readyState === 'loading') {
      // Wait for DOMContentLoaded and then check mainContent's .hidden state freshly
      document.addEventListener('DOMContentLoaded', () => {
        const mainEl = document.getElementById('mainContent');
        const mainHidden = mainEl && mainEl.classList.contains('hidden');
        if (mainHidden) {
          // wait for app loader done
          document.addEventListener('app:loaderDone', initMain, { once: true });
        } else {
          initMain();
        }
      }, { once: true });
    } else {
      // DOM already ready: check if loader is active on #mainContent now
      const mainEl = document.getElementById('mainContent') || mainElWhenCalled;
      const mainHidden = mainEl && mainEl.classList.contains('hidden');
      if (mainHidden) {
        document.addEventListener('app:loaderDone', initMain, { once: true });
      } else {
        initMain();
      }
    }
  }

  scheduleInit();
})();
