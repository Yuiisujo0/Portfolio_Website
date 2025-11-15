// home.js — improved debug + single-image hero + robust about transition
(function () {
  const split = document.getElementById('splitReveal');
  const portrait = document.getElementById('mainPortrait'); // hero <img> (single source)
  const motto = document.querySelector('.main-motto');
  const mainContent = document.getElementById('mainContent');

  // DEBUG HUD: on-page status (very small). Also log to console.
  const debugHud = (function () {
    const el = document.createElement('div');
    el.id = 'home-debug-hud';
    el.style.position = 'fixed';
    el.style.right = '12px';
    el.style.top = '12px';
    el.style.zIndex = '99999';
    el.style.background = 'rgba(0,0,0,0.6)';
    el.style.color = '#fff';
    el.style.fontSize = '12px';
    el.style.padding = '8px 10px';
    el.style.borderRadius = '8px';
    el.style.maxWidth = '320px';
    el.style.lineHeight = '1.2';
    el.style.fontFamily = 'monospace';
    el.style.pointerEvents = 'none';
    el.innerText = 'home.js: initializing...';
    document.body.appendChild(el);
    function log(msg) {
      console.log('[home.js]', msg);
      el.innerText = `[home.js] ${msg}`;
    }
    return { log, el };
  })();

  function debugLog(...args) { debugHud.log(args.join(' ')); }

  // reveal logic
  let revealed = false;
  function showPortraitAndMotto() {
    if (revealed) return;
    revealed = true;
    if (mainContent && mainContent.classList.contains('hidden')) mainContent.classList.remove('hidden');
    if (split) split.classList.add('hidden');
    if (portrait) {
      // Use class to reveal (CSS handles transform/opacity)
      portrait.classList.add('revealed');
      debugLog('Portrait reveal triggered (portrait.revealed added)');
    } else {
      debugLog('No hero portrait element (#mainPortrait) found');
    }
    if (motto) {
      setTimeout(() => { motto.style.opacity = '1'; debugLog('Motto shown'); }, 200);
    }
  }

  function runSplitSequence() {
    if (!split) { showPortraitAndMotto(); return; }
    try {
      const anim = split.animate([
        { clipPath: 'inset(0 50vw 0 50vw)' },
        { clipPath: 'inset(0 0vw 0 0vw)' }
      ], { duration: 900, easing: 'cubic-bezier(.7,0,.3,1)', fill: 'forwards' });
      anim.onfinish = () => {
        split.classList.add('hidden'); showPortraitAndMotto();
      };
    } catch (err) {
      console.warn('[home.js] split animation failed', err);
      split.classList.add('hidden'); showPortraitAndMotto();
    }
  }

  // loader detection (unchanged)
  const loader = document.getElementById('loader');
  if (loader) {
    const mo = new MutationObserver((mutations) => {
      if (loader.classList.contains('hidden')) {
        debugLog('Detected loader.hidden');
        runSplitSequence();
        mo.disconnect();
      }
    });
    mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
    setTimeout(() => { if (!revealed) { debugLog('Loader timeout'); runSplitSequence(); } }, 1500);
  } else {
    debugLog('No loader found — proceeding');
    setTimeout(runSplitSequence, 120);
  }

  // ----- ABOUT transition -----
  document.addEventListener('DOMContentLoaded', () => {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) { debugLog('No #about section in DOM'); return; }

    const hero = document.querySelector('.hero-home');
    const frame = document.querySelector('.hero-portrait-wrap > .frame'); // should be full-bleed frame
    const aboutCenter = document.getElementById('aboutCenter'); // placeholder container in about layout
    const aboutPortrait = document.getElementById('aboutPortrait');

    if (!frame) debugLog('Warning: hero frame not found (.hero-portrait-wrap > .frame).');

    let inAbout = false;
    const observer = new IntersectionObserver(onAboutIntersect, { root: null, threshold: [0, 0.18] });
    observer.observe(aboutSection);
    debugLog('IntersectionObserver attached for #about');

    function onAboutIntersect(entries) {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.18 && !inAbout) {
          inAbout = true;
          debugLog('About section intersecting; starting transition');
          startTransition();
        } else if ((!entry.isIntersecting || entry.intersectionRatio <= 0.01) && inAbout) {
          inAbout = false;
          debugLog('Scrolled back above About; reverting transition');
          revertTransition();
        }
      }
    }

    function removeExistingClones() {
      const existing = document.querySelectorAll('.clone-frame');
      existing.forEach(n => n.remove());
      if (existing.length) debugLog(`Removed ${existing.length} stray clones`);
    }

    function startTransition() {
      removeExistingClones();

      // 1) fade hero text
      document.querySelectorAll('.main-motto, .hero-home .top-left-motto').forEach(el => el.classList.add('fade-away'));
      debugLog('Motto elements faded');

      // 2) set hero to about state (white background)
      if (hero) hero.classList.add('to-about');

      // 3) clone the actual frame element (the single image source)
      if (!frame) {
        if (aboutPortrait) { aboutPortrait.classList.add('visible'); debugLog('No frame — revealed about portrait fallback'); }
        return;
      }

      const frameRect = frame.getBoundingClientRect();
      const clone = frame.cloneNode(true);
      clone.classList.add('clone-frame');
      clone.style.position = 'fixed';
      clone.style.left = `${frameRect.left}px`;
      clone.style.top = `${frameRect.top}px`;
      clone.style.width = `${frameRect.width}px`;
      clone.style.height = `${frameRect.height}px`;
      clone.style.margin = '0';
      document.body.appendChild(clone);
      frame.style.visibility = 'hidden';
      debugLog(`Clone inserted at ${frameRect.left.toFixed(0)}x${frameRect.top.toFixed(0)} size ${frameRect.width.toFixed(0)}x${frameRect.height.toFixed(0)}`);

      // target: the actual aboutCenter placement (center the clone over it)
      const targetSize = { width: 320, height: 320 }; // match .medium-frame
      let targetLeft, targetTop;
      if (aboutCenter) {
        const rect = aboutCenter.getBoundingClientRect();
        targetLeft = rect.left + (rect.width - targetSize.width) / 2;
        targetTop = rect.top + (rect.height - targetSize.height) / 2;
        debugLog(`Target rect found for about center: ${Math.round(targetLeft)}, ${Math.round(targetTop)}`);
      } else {
        targetLeft = (window.innerWidth - targetSize.width) / 2;
        const bottomGap = 72;
        targetTop = window.innerHeight - targetSize.height - bottomGap;
        debugLog('About center not found — using fallback center-bottom');
      }

      // animate (CSS transitions on clone-frame)
      requestAnimationFrame(() => {
        clone.style.left = `${Math.max(8, targetLeft)}px`;
        clone.style.top = `${Math.max(8, targetTop)}px`;
        clone.style.width = `${targetSize.width}px`;
        clone.style.height = `${targetSize.height}px`;
      });

      // after animation complete, reveal about portrait and remove clone
      const cleanupDelay = 980;
      setTimeout(() => {
        if (aboutPortrait) aboutPortrait.classList.add('visible');
        removeExistingClones();
        // restore original frame (but hero background is white now)
        frame.style.visibility = '';
        debugLog('Transition complete: about portrait visible, clone removed');
      }, cleanupDelay);

      // ensure page background becomes white
      document.documentElement.style.background = '#fff';
      document.body.style.background = '#fff';
    }

    function revertTransition() {
      removeExistingClones();
      if (hero) hero.classList.remove('to-about');
      document.querySelectorAll('.main-motto, .hero-home .top-left-motto').forEach(el => el.classList.remove('fade-away'));
      if (aboutPortrait) aboutPortrait.classList.remove('visible');
      document.documentElement.style.background = '';
      document.body.style.background = '';
      const frameOrig = document.querySelector('.hero-portrait-wrap > .frame');
      if (frameOrig) frameOrig.style.visibility = '';
      if (portrait) {
        portrait.classList.add('revealed');
        debugLog('Reverted: hero portrait restored');
      }
    }
  });

  // expose debug hooks
  window.__home_debug = {
    showPortraitAndMotto,
    runSplitSequence,
    debugHud: document.getElementById('home-debug-hud'),
    portraitEl: document.getElementById('mainPortrait'),
  };
})();