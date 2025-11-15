// Diagnostic helper: run from Console or include temporarily in page.
// Usage: open Console and paste `diag()` or include this file and call diag()
function diag() {
  const img = document.getElementById('mainPortrait');
  console.log('--- DIAG START ---');
  if (!img) {
    console.error('No element with id #mainPortrait found in DOM.');
  } else {
    console.log('img.complete:', img.complete);
    console.log('img.naturalWidth:', img.naturalWidth);
    console.log('img.naturalHeight:', img.naturalHeight);
    console.log('img.src:', img.src);
    if (!img.complete || img.naturalWidth === 0) {
      console.warn('Image not loaded or has zero dimensions. Try opening the image URL above in a new tab.');
    } else {
      console.log('Image loaded ok.');
    }
  }
  // check if split overlay covers content
  const split = document.getElementById('splitReveal');
  if (split) {
    const style = window.getComputedStyle(split);
    console.log('split exists. visible:', style.visibility !== 'hidden', 'opacity:', style.opacity, 'clipPath:', style.clipPath);
  } else {
    console.log('split not present.');
  }
  // check for JS errors (last)
  console.log('Check console for runtime errors above this message.');
  console.log('--- DIAG END ---');
  return { img, split };
}