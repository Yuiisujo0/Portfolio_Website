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
      scaleCover = Math.max(sx, sy) * 1.5;
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
    const scaleSection2 = (vw < 600) ? 0.15 : getScaleForSection(pic1, 0.45, 0.5); // Force scale for mobile

    const scaleTarget = scaleCover - (scaleCover - scaleSection2) * progress;
    const topStart = (vw < 600) ? 50 : 65; // If it's a small screen, start at 50%
    const topFinal2 = (vw < 600) ? 50 : 65; // Similarly, adjust the final position for smaller screens
    const currentTopTarget = topStart + (topFinal2 - topStart) * progress;
    const shiftXTarget = (vw < 600) ? progress * 25 : progress * 10; 

    let applyTop = currentTopTarget;
    let applyScale = scaleTarget;
    let applyShiftX = shiftXTarget;
    let applyRot = 0;
    let applyBackRot = 180;

    // SECTION 3 zoom/flip dynamically
    if (sec3Rect.top < vh) {
      const p = 1 - (sec3Rect.top / vh);
      const eased = p * p * (3 - 2 * p);
      const scaleSection3 = getScaleForSection(pic1, (vw < 600) ? 0.5 : 0.75, (vw < 600) ? 0.6 : 0.85);  
      const zoom = scaleTarget + (scaleSection3 - scaleTarget) * eased;
      const topCenter3 = (vw < 600) ? 50 : 50;
      const topMove = topFinal2 + (topCenter3 - topFinal2) * eased;
      const shiftX3 = (vw < 600) ? 25 * (1 - eased) + (3 * eased) : 10 * (1 - eased) + (3 * eased);  // Adjust for mobile shift
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
    
    if (vw < 600) { // For mobile
        // Get the bottom of Section 2 and the top of Section 3
        const sec2Bottom = section2 ? section2.getBoundingClientRect().bottom : 0;  // Bottom of Section 2
        const sec3Top = section3 ? section3.getBoundingClientRect().top : vh;  // Top of Section 3

        // Calculate the progress between Section 2 and Section 3
        const sectionProgress = Math.min(Math.max((sec2Bottom - sec3Top) / (sec2H * 0.7), 0), 1); 

        // Initial top position is 50% (at the bottom of Section 2), it should move upwards to 0% (center) as you scroll into Section 3
        const initialTopPosition = 55; // Start at 50% of the viewport height (bottom of Section 2)
        const verticalScrollEffect = sectionProgress * 50;  // Move 50% upwards as you scroll
        applyTop = initialTopPosition - verticalScrollEffect;  // Apply the scroll effect to make the image rise

        const scaleForMobile = 0.3;  // Scale down to 30% for mobile
        const shiftXForMobile = 30;  // Move pic1 30% to the right

    }

    // Apply transforms for Section 1 → Section 2 and Section 3 transitions
    if (pic1 && !imagesHidden) {
      pic1.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyRot}deg)`;
      pic1.style.top = `${applyTop}%`;  // Apply top position here
    }
    if (pic1Back && !imagesHidden) {
      pic1Back.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyBackRot}deg)`;
      pic1Back.style.top = `${applyTop}%`;  // Apply top position for pic1Back as well
    }

    // Apply transforms
    if (pic1 && !imagesHidden) pic1.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyRot}deg)`;
    if (pic1Back && !imagesHidden) pic1Back.style.transform = `translate3d(calc(-50% + ${applyShiftX}vw), -50%, 0) scale(${applyScale}) rotateY(${applyBackRot}deg)`;

    if (pic1) pic1.style.top = `${applyTop}%`; 
    if (pic1Back) pic1Back.style.top = `${applyTop}%`;

    // KUCHING / deanlist
    if (kuching1) {
      // Handle Kuching image positioning based on screen size
      if (vw < 600) { // For Mobile
        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.opacity = `${finalOpacity}`;
        kuching1.style.left = `50%`; // Center horizontally
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight * 0.82}px`; // Adjust top (higher on the screen)
        kuching1.style.transform = 'translateX(-73%) scale(0.65)'; // Increase size and center horizontally
      } else if (vw < 900) { // For Tablet (optional tweak)
        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.opacity = `${finalOpacity}`;
        kuching1.style.left = `50%`; // Center horizontally
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight * 0.5}px`; // Adjust top position
        kuching1.style.transform = 'translateX(-50%) scale(1)'; // Keep original size for tablet
      } else { // For Desktop
        kuching1.style.opacity = `${finalOpacity}`;
        kuching1.style.left = `${50 + 33 * kuchingProgress}%`; // Default left position for desktop
        const rect = pic1 ? pic1.getBoundingClientRect() : { bottom: vh / 2 };
        kuching1.style.top = `${rect.bottom - kuching1.offsetHeight * 0.95}px`; // Adjust top position on desktop
      }
    }

    if (deanlist) deanlist.style.opacity = `${finalOpacity}`;
    if (deanlist) deanlist.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)";
    if (arrow) { arrow.style.opacity = `${finalOpacity}`; arrow.style.transform = finalOpacity > 0 ? "translateY(0)" : "translateY(20px)"; }

    updateUnderline();
  }

  // --- EVENT LISTENERS ---
  let resizeTimeout;
  window.addEventListener("resize", () => {
    if (resizeTimeout) clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      updateSectionHeight();
      updateUnderline();
      updateScales();
      processScroll();
    }, 150); // Throttle resize event handling
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
