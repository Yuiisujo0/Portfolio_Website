// mobile.js
document.addEventListener('DOMContentLoaded', () => {
  const mobileBreakpoint = 768; // px
  if (window.innerWidth <= mobileBreakpoint) {
    // Add mobile layout class
    document.body.classList.add('mobile-layout');

    // Show mobile container
    const mobileContainer = document.getElementById('mobile-container');
    if (mobileContainer) mobileContainer.style.display = 'block';

    // Hide desktop sections
    document.querySelectorAll('.section1, .section2, .section3, .section4, .section5')
      .forEach(el => el.style.display = 'none');

    // Hide fixed elements
    const rightStationary = document.getElementById('right-stationary');
    if (rightStationary) rightStationary.style.display = 'none';
    const navbar = document.querySelector('.navbar');
    if (navbar) navbar.style.display = 'none';
  }
});
