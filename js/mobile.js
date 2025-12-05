/* mobile.js - mobile-specific scroll and scaling logic */
document.addEventListener('DOMContentLoaded', () => {
  const pic1 = document.getElementById("pic1");
  const pic1Back = document.getElementById("pic1Back");
  const kuching1 = document.getElementById("kuching1");
  const deanlist = document.getElementById("deanlist");
  const arrow = document.getElementById("arrow");
  const vh = window.innerHeight;

  function processMobileScroll() {
    const scrollY = window.scrollY;

    const baseTop = 50; // start vertical position %
    const shiftAmount = Math.min(scrollY / vh * 50, 50); // max 50% upwards

    if (pic1) pic1.style.top = `${baseTop - shiftAmount}%`;
    if (pic1Back) pic1Back.style.top = `${baseTop - shiftAmount}%`;

    // kuching1 fade in
    const kuchingOpacity = Math.min(scrollY / (vh * 0.5), 1);
    if (kuching1) {
      kuching1.style.opacity = kuchingOpacity;
      kuching1.style.transform = 'translate(-50%, -50%) scale(0.65)';
    }

    if (deanlist) deanlist.style.opacity = kuchingOpacity;
    if (arrow) arrow.style.opacity = kuchingOpacity;
  }

  window.addEventListener('scroll', processMobileScroll, { passive: true });
  processMobileScroll(); // initial call
});
