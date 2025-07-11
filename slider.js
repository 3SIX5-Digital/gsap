document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.slider-container');
  const slidesWrapper = document.querySelector('.slides-wrapper');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (!sliderContainer || !slidesWrapper || slides.length === 0 || !prevBtn || !nextBtn) {
    console.error('Slider elements not found. Make sure your HTML structure is correct.');
    return;
  }

  let currentIndex = 0;
  const totalSlides = slides.length;

  // Function to update slider position
  function goToSlide(index) {
    if (index < 0) {
      index = totalSlides - 1; // Loop to last slide
    } else if (index >= totalSlides) {
      index = 0; // Loop to first slide
    }
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    currentIndex = index;
    updateNavButtons();
  }

  // Update navigation button states (optional, for disabling at ends if not looping)
  function updateNavButtons() {
    // If you don't want looping, you can disable buttons at the ends:
    // prevBtn.disabled = currentIndex === 0;
    // nextBtn.disabled = currentIndex === totalSlides - 1;
  }

  // Event listeners for nav buttons
  prevBtn.addEventListener('click', () => {
    goToSlide(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    goToSlide(currentIndex + 1);
  });

  // Initialize slider
  goToSlide(0); // Start at the first slide

  // Optional: Autoplay functionality
  let autoplayInterval = null;
  const autoplaySpeed = 3000; // 3 seconds

  function startAutoplay() {
    stopAutoplay(); // Clear any existing interval
    autoplayInterval = setInterval(() => {
      goToSlide(currentIndex + 1);
    }, autoplaySpeed);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  // To enable autoplay by default:
  // startAutoplay();

  // Optional: Pause autoplay on hover
  // sliderContainer.addEventListener('mouseenter', stopAutoplay);
  // sliderContainer.addEventListener('mouseleave', startAutoplay);


  // --- Responsive adjustments ---
  // This is a basic example. For more complex responsive behaviors (e.g. showing multiple slides),
  // you might need to recalculate slide widths and offsets.
  // The current CSS handles basic responsiveness by making each slide 100% width.

  // Example: Recalculate something on resize if needed
  // window.addEventListener('resize', () => {
  //   // If you were dynamically setting slide widths or something similar
  //   // you would update it here and then call goToSlide(currentIndex)
  //   // to ensure the view is correct.
  //   // For this simple translateX(-100% * index), it's often fine.
  // });

  console.log('Slider initialized.');
});
