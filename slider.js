document.addEventListener('DOMContentLoaded', () => {
  const sliderContainer = document.querySelector('.advanced-slider-container');
  const viewport = document.querySelector('.slider-viewport');
  const track = document.querySelector('.slider-track');
  let slides = Array.from(track.querySelectorAll('.slide-item'));
  const prevBtn = document.querySelector('.slider-nav.prev');
  const nextBtn = document.querySelector('.slider-nav.next');

  if (!sliderContainer || !viewport || !track || !prevBtn || !nextBtn) {
    console.error('Slider critical elements not found. Check HTML structure.');
    return;
  }
  if (slides.length === 0) {
    console.error('No slides found in the track.');
    if(prevBtn) prevBtn.disabled = true;
    if(nextBtn) nextBtn.disabled = true;
    return;
  }

  const NUM_VISIBLE_THUMBNAILS = 3;
  let currentIndex = slides.findIndex(slide => slide.classList.contains('active'));
  if (currentIndex < 0 || currentIndex >= slides.length) {
    currentIndex = Math.max(0, slides.length - 1); // Default to last original slide
  }

  let isTransitioning = false;
  const fixedActiveViewWidth = 500; // From CSS, or measure activeSlide.querySelector('.active-view').offsetWidth
  let isMobileView = window.innerWidth <= 767;

  // --- Infinite Loop Setup: Cloning Slides (Only for Desktop) ---
  let originalSlidesCount = slides.length; // Count before cloning
  const clonesToPrepend = [];
  const clonesToAppend = [];

  function setupDesktopClones() {
    if (slides.length > originalSlidesCount) return; // Clones already set up

    for (let i = 0; i < NUM_VISIBLE_THUMBNAILS + 1; i++) {
      const slideIndex = (originalSlidesCount - 1 - i + originalSlidesCount) % originalSlidesCount;
      const originalSlideToClone = slides.find(s => parseInt(s.dataset.slideIndex) === slideIndex && !s.classList.contains('cloned')); // Find original
      if(originalSlideToClone){
        const clone = originalSlideToClone.cloneNode(true);
        clone.classList.add('cloned', 'cloned-prepended');
        clone.classList.remove('active');
        clone.dataset.originalIndex = originalSlideToClone.dataset.slideIndex;
        track.insertBefore(clone, track.firstChild);
        clonesToPrepend.push(clone);
      }
    }

    for (let i = 0; i < NUM_VISIBLE_THUMBNAILS + 1 + 1; i++) {
      const originalSlideToClone = slides.find(s => parseInt(s.dataset.slideIndex) === (i % originalSlidesCount) && !s.classList.contains('cloned')); // Find original
       if(originalSlideToClone){
        const clone = originalSlideToClone.cloneNode(true);
        clone.classList.add('cloned', 'cloned-appended');
        clone.classList.remove('active');
        clone.dataset.originalIndex = originalSlideToClone.dataset.slideIndex;
        track.appendChild(clone);
        clonesToAppend.push(clone);
       }
    }
    // Update slides array to include clones
    slides = Array.from(track.querySelectorAll('.slide-item'));
  }

  function removeDesktopClones() {
      slides.filter(s => s.classList.contains('cloned')).forEach(clone => clone.remove());
      slides = Array.from(track.querySelectorAll('.slide-item:not(.cloned)')); // Revert to original slides
      // Ensure originalSlidesCount is accurate if this function is ever called multiple times
      originalSlidesCount = slides.length;
  }


  function initializeSliderState() {
    isMobileView = window.innerWidth <= 767;

    // Clear existing clones if switching from desktop to mobile or vice-versa to avoid issues
    slides.filter(s => s.classList.contains('cloned')).forEach(clone => clone.remove());
    slides = Array.from(track.querySelectorAll('.slide-item:not(.cloned)')); // Reset to originals
    originalSlidesCount = slides.length; // Recalculate original count

    if (!isMobileView && originalSlidesCount > 0) { // Min slides for cloning to make sense
      setupDesktopClones(); // Re-setup clones for desktop
      // Adjust currentIndex to point to the first non-cloned instance of the active slide
      const currentActiveOriginalIndex = parseInt(slides[currentIndex]?.dataset.originalIndex || slides[currentIndex]?.dataset.slideIndex || '0');
      currentIndex = slides.findIndex(s => !s.classList.contains('cloned') && parseInt(s.dataset.slideIndex) === currentActiveOriginalIndex);
      if (currentIndex === -1) currentIndex = clonesToPrepend.length; // Default to first original if not found
    } else {
      // For mobile, ensure currentIndex is within bounds of original slides
      const currentActiveOriginalIndex = parseInt(slides[currentIndex]?.dataset.originalIndex || slides[currentIndex]?.dataset.slideIndex || '0');
      currentIndex = slides.findIndex(s => parseInt(s.dataset.slideIndex) === currentActiveOriginalIndex);
      if (currentIndex === -1) currentIndex = Math.max(0, originalSlidesCount - 1);

      track.style.transform = 'none'; // Reset track transform for mobile
    }

    // Ensure only one slide is active
    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));

    if (!isMobileView) {
      positionTrackForActiveSlide(true);
    }
  }


  function updateSlider(newDirectionOrIndex, isInitialization = false) {
    if (isTransitioning && !isInitialization) return;
    if (!isMobileView) isTransitioning = true;

    let newActiveIndex = currentIndex; // This will be the actual index in the 'slides' array
    const currentLogicalIndex = parseInt(slides[currentIndex].dataset.originalIndex || slides[currentIndex].dataset.slideIndex);

    if (typeof newDirectionOrIndex === 'number') { // Direct jump to an original slide index
        const targetOriginalIndex = newDirectionOrIndex;
        // On desktop, find the first non-cloned instance. On mobile, find the direct slide.
        const targetSlide = slides.find(s =>
            (isMobileView || !s.classList.contains('cloned')) &&
            parseInt(s.dataset.slideIndex) === targetOriginalIndex
        );
        if (targetSlide) {
            newActiveIndex = slides.indexOf(targetSlide);
        } else if (!isMobileView) { // Fallback for desktop if non-cloned not found, try cloned
            const clonedTarget = slides.find(s => s.classList.contains('cloned') && parseInt(s.dataset.originalIndex) === targetOriginalIndex);
            if(clonedTarget) newActiveIndex = slides.indexOf(clonedTarget);
            else { if (!isMobileView) isTransitioning = false; return; }
        } else {
             if (!isMobileView) isTransitioning = false; return; // No valid target on mobile
        }
    } else { // Direction based ('prev' or 'next')
        const direction = newDirectionOrIndex;
        let newLogicalIdx = currentLogicalIndex;
        if (direction === 'next') {
            newLogicalIdx = (currentLogicalIndex + 1) % originalSlidesCount;
        } else { // prev
            newLogicalIdx = (currentLogicalIndex - 1 + originalSlidesCount) % originalSlidesCount;
        }
        // Find the corresponding actual slide (non-cloned for desktop reference, any for mobile)
        const firstInstanceOfNewLogical = slides.find(s =>
            (isMobileView || !s.classList.contains('cloned')) &&
            parseInt(s.dataset.slideIndex) === newLogicalIdx
        );
        if(firstInstanceOfNewLogical){
            newActiveIndex = slides.indexOf(firstInstanceOfNewLogical);
             // For desktop prev/next, we actually want to move along the cloned track, so adjust if needed
            if(!isMobileView && direction === 'next' && newActiveIndex < currentIndex) newActiveIndex += originalSlidesCount;
            if(!isMobileView && direction === 'prev' && newActiveIndex > currentIndex) newActiveIndex -= originalSlidesCount;
            // A simpler way for desktop prev/next on cloned track:
            if(!isMobileView) newActiveIndex = currentIndex + (direction === 'next' ? 1 : -1);


        } else { // Should ideally not happen
             newActiveIndex = currentIndex + (direction === 'next' ? 1 : -1);
        }
    }

    // Boundary checks for newActiveIndex within the full 'slides' array (including clones on desktop)
    if (newActiveIndex < 0 || newActiveIndex >= slides.length) {
        // This case should be handled by checkAndReset or indicates an issue
        console.warn("newActiveIndex out of bounds", newActiveIndex);
        if (!isMobileView) isTransitioning = false;
        return;
    }

    slides[currentIndex].classList.remove('active');
    slides[newActiveIndex].classList.add('active');
    currentIndex = newActiveIndex;

    if (!isMobileView) {
        positionTrackForActiveSlide(isInitialization);
        const trackTransitionDuration = parseFloat(window.getComputedStyle(track).transitionDuration) * 1000 || 600;
        setTimeout(() => {
          checkAndResetToOriginalSlide();
          isTransitioning = false;
        }, trackTransitionDuration);
    } else {
        // On mobile, no track positioning, browser handles scroll.
        // We might want to scroll the new active item into view.
        slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function checkAndResetToOriginalSlide() {
    if (isMobileView) return; // No cloning or track reset on mobile

    const currentSlide = slides[currentIndex];
    if (currentSlide.classList.contains('cloned')) {
      const originalIndex = parseInt(currentSlide.dataset.originalIndex);
      const originalSlideInstance = slides.find(s =>
        !s.classList.contains('cloned') &&
        parseInt(s.dataset.slideIndex) === originalIndex
      );
      if (originalSlideInstance) {
        currentIndex = slides.indexOf(originalSlideInstance);
        slides.forEach(s => s.classList.remove('active')); // Ensure only one is active
        slides[currentIndex].classList.add('active');

        track.style.transition = 'none';
        positionTrackForActiveSlide(true);
        track.offsetHeight; // Force repaint
        track.style.transition = 'transform 0.6s ease-in-out';
      }
    }
  }

  function positionTrackForActiveSlide(isImmediate = false) {
    if (isMobileView) {
      track.style.transform = 'none'; // Ensure no transform on mobile
      return;
    }
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;

    const viewportWidth = viewport.offsetWidth;
    const activeContentView = activeSlide.querySelector('.active-view');
    const activeContentEffectiveWidth = activeContentView ? parseFloat(window.getComputedStyle(activeContentView).width) : fixedActiveViewWidth;

    const desiredActiveLeftEdge = Math.max(0, viewportWidth - activeContentEffectiveWidth - 20); // 20 for some right padding
    const actualActiveOffsetLeft = activeSlide.offsetLeft;

    let targetTranslateX = desiredActiveLeftEdge - actualActiveOffsetLeft;
    targetTranslateX = Math.min(0, targetTranslateX);

    if (isImmediate) {
        const currentTransition = track.style.transition;
        track.style.transition = 'none';
        track.style.transform = `translateX(${targetTranslateX}px)`;
        track.offsetHeight;
        track.style.transition = currentTransition || 'transform 0.6s ease-in-out';
    } else {
        track.style.transform = `translateX(${targetTranslateX}px)`;
    }
  }

  slides.forEach((slide) => { // Original non-cloned slides for click events
    if(!slide.classList.contains('cloned')){
        slide.addEventListener('click', () => {
            const targetOriginalIndex = parseInt(slide.dataset.slideIndex);
            const currentActiveOriginalIndex = parseInt(slides[currentIndex].dataset.originalIndex || slides[currentIndex].dataset.slideIndex);
            if (targetOriginalIndex !== currentActiveOriginalIndex) {
                updateSlider(targetOriginalIndex);
            }
        });
    }
  });

  prevBtn.addEventListener('click', () => updateSlider('prev'));
  nextBtn.addEventListener('click', () => updateSlider('next'));

  // Initial setup
  initializeSliderState(); // This sets up clones for desktop if needed

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const previouslyMobile = isMobileView;
      isMobileView = window.innerWidth <= 767;
      if (previouslyMobile !== isMobileView) {
        initializeSliderState(); // Re-initialize if breakpoint is crossed
      } else if (!isMobileView) {
        positionTrackForActiveSlide(true);
      }
    }, 250);
  });

  console.log('Advanced slider (Mobile Adjust V1) initialized.');
});
