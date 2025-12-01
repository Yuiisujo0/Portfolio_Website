/* carousel.js
   This file integrates your vertical carousel into section 4 ("more").
   - Paths to images are adjusted to assets/images/
   - Script is scoped inside DOMContentLoaded to avoid interfering with main.js
   - Keeps the same drag + momentum behavior you had, and updates the right panel content
*/

document.addEventListener('DOMContentLoaded', () => {
  const carousel = document.getElementById("carousel");
  const slides = document.querySelectorAll("#more .slide");
  const rightPanel = document.getElementById("right-panel");

  let progress = 2; // start in the middle
  let startY = 0;
  let lastY = 0;
  let dragging = false;
  let velocity = 0;

  const MIN = 0;
  const MAX = slides.length - 1;

  // colors for right panel background
  const colors = ["transparent","transparent","transparent","transparent","transparent"];

  // INFO FOR EACH SLIDE - make sure these image files exist in assets/images/
  const slideInfo = [
    {
        name: "Autonomous Rapid Transit (ART) Mobile App [Map]",
        images: ["assets/images/webp/section4/uiux/uiux1.webp", "assets/images/webp/section4/uiux/uiux1.webp", "assets/images/webp/section4/uiux/uiux1.webp"],
        overview: "· Designed an ART mobile app prototype applying UI/UX design methods.\n\n· Improved the initial concept into a more functional and user-friendly interface using Figma and iterative prototyping",
        typeOfWork: "UI/UX, Frontend Development",
        backgroundImage: "assets/images/webp/section4/uiux/background_05.webp" // Add background image for the right panel
    },
    {
        name: "ZoomRentals Database System Using MySQL",
        images: ["assets/images/webp/section4/database/database1.webp", "assets/images/webp/section4/database/database2.webp", "assets/images/webp/section4/database/database3.webp"],
        overview: "· Draw the Crow’s Foot Entity Relationship Diagram (ERD) to represent the structure and relationship among the entities virtually.\n\n· Developed a MySQL database and managed data using command-line operations to support the system requirements.",
        typeOfWork: "MySQL, Database",
        backgroundImage: "assets/images/webp/section4/database/background_04.webp" // Add background image for the right panel
    },
    {
        name: "DICE COMPETITION",
        images: ["assets/images/webp/section4/dice/dice_1.webp", "assets/images/webp/section4/dice/dice_2.webp"],
        overview: "· Designed an interactive user interface prototype in Figma, focusing on intuitive navigation and visual consistency.\n\n· Developed and implemented the application’s user interface (UI) in Unity, collaborating with team members on AR features.\n\n· Silver Award in AR/VR category of Digital Innovation Creativepreneur (DICE) 3.0 at Persada Johor International Convention Centre, Johor Bahru",
        typeOfWork: "Creative Coding, Interactive Art",
        backgroundImage: "assets/images/webp/section4/dice/background_03.webp" // Add background image for the right panel
    },
    {
        name: "Mental Health Quiz Application",
        images: ["assets/images/webp/section4/java/java1.webp", "assets/images/webp/section4/java/java2.webp", "assets/images/webp/section4/java/java3.webp"],
        overview: "· Created the home page + quiz part for the application, include multiple-choice, true/false and fill-in the blank questions.\n\n· Designed and developed a Java-based application using object-oriented programming principles with a user-friendly interface.",
        typeOfWork: "Leaning Module, Quiz",
        backgroundImage: "assets/images/webp/section4/java/background_06.webp" // Add background image for the right panel
    },
    {
        name: "Autonomous Rapid Transit (ART) Mobile App [Booking]",
        images: ["assets/images/webp/section4/art/art1.webp", "assets/images/webp/section4/art/art2.webp", "assets/images/webp/section4/art/art3.webp"],
        overview: "· Designed an ART mobile app prototype applying Human Computer Interaction (HCI) principles using Figma.\n\n· Turning the initial concept into a more functional and user-friendly interface using Figma.",
        typeOfWork: "Mobile UI, App Redesign",
        backgroundImage: "assets/images/webp/section4/art/background_07.webp" // Add background image for the right panel
    }
  ];

  // adjustable gap between slides (px)
  const SLIDE_GAP = 20;

  function render() {
    if (progress < MIN) progress = MIN;
    if (progress > MAX) progress = MAX;

    slides.forEach((slide, i) => {
      const offset = i - progress;
      const absOffset = Math.abs(offset);

      const shadowL = slide.querySelector(".shadow-left");
      const shadowR = slide.querySelector(".shadow-right");

      // no tilt, only depth layering
      let rotateY = 0;
      let translateZ = 0;

      if (absOffset < 0.5) {
          translateZ = 0;
      } else if (absOffset < 1.5) {
          translateZ = -350;
      } else {
          translateZ = -700;
      }

      const slideHeight = slide.offsetHeight || 240;
      const yShift = offset * (slideHeight + SLIDE_GAP);

      slide.style.zIndex = 1000 - Math.round(absOffset * 10);
      slide.style.transform = `translate3d(-50%, calc(-50% + ${yShift}px), ${translateZ}px) rotateY(${rotateY}deg)`;

      if (shadowL) shadowL.style.opacity = offset > 0 ? absOffset : 0;
      if (shadowR) shadowR.style.opacity = offset < 0 ? absOffset : 0;
    });

    const activeIndex = Math.round(progress);
    const info = slideInfo[activeIndex];

    // update background color and image for the right panel
    rightPanel.style.background = `url('${info.backgroundImage}') no-repeat center center, ${colors[activeIndex] || "#222"}`;
    rightPanel.style.backgroundSize = 'cover';  // Ensures the image covers the panel

    // update panel content (guard existence)
    const nameEl = document.getElementById("project-name");
    const img1 = document.getElementById("img1");
    const img2 = document.getElementById("img2");
    const img3 = document.getElementById("img3");
    const overviewEl = document.getElementById("project-overview");
    const projectDescriptionEl = document.getElementById("project-description");
    const typeEl = document.getElementById("type-of-work");

    if (info) {
      if (nameEl) nameEl.textContent = info.name;
      if (img1) { img1.src = info.images[0]; img1.alt = info.name + " image 1"; }
      if (img2) { img2.src = info.images[1]; img2.alt = info.name + " image 2"; }
      
      // Conditionally show img3 based on the number of images
      if (img3) {
        if (info.images.length > 2) {
          img3.src = info.images[2];
          img3.alt = info.name + " image 3";
          img3.style.display = 'block'; // Ensure img3 is visible if there are 3 images
        } else {
          img3.style.display = 'none'; // Hide img3 if there are only 2 images
        }
      }

      // Populate project description (scrollable content)
      if (projectDescriptionEl) {
        // Replace the newlines with <br> tags for HTML rendering
        projectDescriptionEl.innerHTML = info.overview.replace(/\n/g, "<br>");
      }

      if (overviewEl) overviewEl.textContent = info.overview;
      if (typeEl) typeEl.textContent = info.typeOfWork;
    }
  }

  render();

  // Modal Elements
  const modal = document.getElementById("image-modal");
  const modalImage = document.getElementById("modal-image");
  const closeModal = document.querySelector(".close");

  // Function to open modal with enlarged image
  function openModal(imageSrc) {
    modal.style.display = "flex"; // Show the modal
    modalImage.src = imageSrc;   // Set the source of the image in the modal
    modalImage.style.transform = "scale(1)"; // Reset zoom when opening modal
  }

  // Function to close modal (when user clicks outside or on the close button)
  function closeModalHandler() {
    modal.style.display = "none"; // Hide the modal
    modalImage.style.transform = "scale(1)"; // Reset zoom when modal is closed
  }

  // Event listeners for image clicks (enlarge image)
  const allImages = document.querySelectorAll("#image-row img");
  allImages.forEach(img => {
    img.addEventListener("click", () => {
      openModal(img.src); // Open modal with clicked image
    });
  });

  // Event listener to close modal when user clicks the X button
  closeModal.addEventListener("click", closeModalHandler);

  // Event listener to close modal when user clicks outside of the image
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModalHandler(); // Close modal when clicking outside the image
    }
  });

  // Zoom effect when image in modal is clicked
  modalImage.addEventListener("click", () => {
    // Toggle zoom in and out
    const currentScale = modalImage.style.transform === "scale(1)" ? 1.5 : 1;
    modalImage.style.transform = `scale(${currentScale})`; // Apply the zoom scale
  });

  // DRAG HANDLERS
  function startDrag(y) {
    dragging = true;
    startY = y;
    lastY = y;
    if (carousel) carousel.classList.add("dragging");
  }

  function onDrag(y) {
    if (!dragging) return;
    const dy = lastY - y; // reversed direction (drag up -> increase progress)
    lastY = y;

    progress += dy / 150;
    velocity = dy / 10;

    if (progress < MIN - 0.4) progress = MIN - 0.4;
    if (progress > MAX + 0.4) progress = MAX + 0.4;

    render();
  }

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    if (carousel) carousel.classList.remove("dragging");
    momentum();
  }

  // MOUSE EVENTS
  carousel.addEventListener("mousedown", e => startDrag(e.clientY));
  window.addEventListener("mousemove", e => onDrag(e.clientY));
  window.addEventListener("mouseup", endDrag);

  // TOUCH EVENTS
  carousel.addEventListener("touchstart", e => startDrag(e.touches[0].clientY), {passive:true});
  window.addEventListener("touchmove", e => {
    if (e.touches && e.touches[0]) onDrag(e.touches[0].clientY);
  }, {passive:true});
  window.addEventListener("touchend", endDrag);

  // MOMENTUM
  function momentum() {
    if (Math.abs(velocity) < 0.2) {
      progress = Math.round(progress);
      if (progress < MIN) progress = MIN;
      if (progress > MAX) progress = MAX;
      render();
      return;
    }
    progress += velocity * 0.1;
    velocity *= 0.8;

    if (progress < MIN - 0.5) progress = MIN - 0.5;
    if (progress > MAX + 0.5) progress = MAX + 0.5;

    render();
    requestAnimationFrame(momentum);
  }

  // keyboard accessibility: up/down to navigate
  carousel.addEventListener('keydown', e => {
    if (e.key === 'ArrowUp') { progress = Math.max(MIN, progress - 1); render(); }
    if (e.key === 'ArrowDown') { progress = Math.min(MAX, progress + 1); render(); }
  });
});