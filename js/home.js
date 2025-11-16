// Robust reveal logic. This will:
// - wait for loader.hidden OR time out after 1200ms,
// - animate split reveal and then rotate/fade in portrait & motto,
// - log to console useful diagnostics if something fails.

(function () {
  const split = document.getElementById('splitReveal');
  const portrait = document.getElementById('mainPortrait'); // <img>
  const motto = document.querySelector('.main-motto');
  const mainContent = document.getElementById('mainContent');
  let revealed = false;

  function debugLog(...args) { console.log('[home.js]', ...args); }

  // Helper to produce the reveal transform that preserves the portrait offset variable.
  function revealTransform() {
    // Use CSS variable for portrait offset so the JS doesn't need to hardcode px/vh values.
    return 'rotateY(0deg) scale(1) translateY(var(--portrait-offset))';
  }

  function showPortraitAndMotto() {
    if (revealed) return;
    revealed = true;
    // ensure main content visible
    if (mainContent && mainContent.classList.contains('hidden')) {
      mainContent.classList.remove('hidden');
      debugLog('Removed .hidden from #mainContent');
    }
    // hide the split
    if (split) {
      split.classList.add('hidden');
      debugLog('Hid split overlay');
    }
    // reveal portrait (if exists)
    if (portrait) {
      portrait.style.opacity = '1';
      // set transform including the translateY(var(--portrait-offset)) used in CSS
      portrait.style.transform = revealTransform();
      debugLog('Portrait reveal triggered');
    } else {
      debugLog('Portrait element not found: #mainPortrait');
    }
    // reveal motto
    if (motto) {
      setTimeout(() => { motto.style.opacity = '1'; }, 200);
      debugLog('Motto reveal triggered');
    }
  }

  // Execute with an animation: split expands then show portrait
  function runSplitSequence() {
    if (!split) { showPortraitAndMotto(); return; }
    // animate clipPath via Web Animations API if supported
    try {
      const anim = split.animate([
        { clipPath: 'inset(0 50vw 0 50vw)' },
        { clipPath: 'inset(0 0vw 0 0vw)' }
      ], {
        duration: 900,
        easing: 'cubic-bezier(.7,0,.3,1)',
        fill: 'forwards'
      });
      anim.onfinish = () => {
        split.classList.add('hidden');
        showPortraitAndMotto();
      };
    } catch (err) {
      // fallback: just hide split and show portrait
      console.warn('[home.js] split animation failed, fallback', err);
      split.classList.add('hidden');
      showPortraitAndMotto();
    }
  }

  // Listen for loader hidden (MutationObserver), or fallback to timeout
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
    // safety fallback: if loader doesn't hide in 1.5s, proceed anyway
    setTimeout(() => {
      if (!revealed) {
        debugLog('Loader did not hide in 1500ms; proceeding anyway');
        runSplitSequence();
      }
    }, 1500);
  } else {
    // no loader element present, proceed immediately
    debugLog('No loader element found; proceeding immediately');
    setTimeout(runSplitSequence, 120);
  }
})();