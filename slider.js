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
  let initialActiveIndex = slides.findIndex(slide => slide.classList.contains('active'));
  if (initialActiveIndex < 0 || initialActiveIndex >= slides.length) {
    initialActiveIndex = Math.max(0, slides.length - 1);
  }

  let currentIndex = initialActiveIndex;
  let isTransitioning = false;
  const fixedActiveViewWidth = 800; // MATCHES NEW CSS: Increased width for active slide
  let isMobileView = window.innerWidth <= 767;

  let originalSlidesCount = slides.length;
  const clonesToPrepend = [];
  const clonesToAppend = [];
  let lastAnimatedTranslateX = 0; // For alternative reset strategy

  function setupDesktopClones() {
    if (slides.some(s => s.classList.contains('cloned'))) return;

    const originalSlidesSnapshot = Array.from(track.querySelectorAll('.slide-item:not(.cloned)'));
    originalSlidesCount = originalSlidesSnapshot.length;
    if (originalSlidesCount === 0) return;

    clonesToPrepend.length = 0;
    clonesToAppend.length = 0;

    for (let i = 0; i < NUM_VISIBLE_THUMBNAILS + 1; i++) {
      const slideIndexToClone = (originalSlidesCount - 1 - i + originalSlidesCount) % originalSlidesCount;
      const originalSlideNode = originalSlidesSnapshot[slideIndexToClone];
      if(originalSlideNode) {
        const clone = originalSlideNode.cloneNode(true);
        clone.classList.add('cloned', 'cloned-prepended');
        clone.classList.remove('active');
        clone.dataset.originalIndex = originalSlideNode.dataset.slideIndex;
        track.insertBefore(clone, track.firstChild);
        clonesToPrepend.push(clone);
      }
    }

    for (let i = 0; i < NUM_VISIBLE_THUMBNAILS + 1 + 1; i++) {
      const slideIndexToClone = i % originalSlidesCount;
      const originalSlideNode = originalSlidesSnapshot[slideIndexToClone];
      if(originalSlideNode){
        const clone = originalSlideNode.cloneNode(true);
        clone.classList.add('cloned', 'cloned-appended');
        clone.classList.remove('active');
        clone.dataset.originalIndex = originalSlideNode.dataset.slideIndex;
        track.appendChild(clone);
        clonesToAppend.push(clone);
      }
    }
    slides = Array.from(track.querySelectorAll('.slide-item'));
  }

  function removeDesktopClones() {
    slides.filter(s => s.classList.contains('cloned')).forEach(clone => clone.remove());
    slides = Array.from(track.querySelectorAll('.slide-item:not(.cloned)'));
    originalSlidesCount = slides.length;
  }

  function initializeSliderState() {
    isMobileView = window.innerWidth <= 767;
    removeDesktopClones();

    slides = Array.from(track.querySelectorAll('.slide-item'));
    originalSlidesCount = slides.length;
    if (originalSlidesCount === 0) return;

    let logicalCurrentIndex = slides.findIndex(slide => slide.classList.contains('active'));
    if (logicalCurrentIndex < 0 || logicalCurrentIndex >= originalSlidesCount) {
        logicalCurrentIndex = initialActiveIndex;
        if (logicalCurrentIndex < 0 || logicalCurrentIndex >= originalSlidesCount) {
             logicalCurrentIndex = Math.max(0, originalSlidesCount - 1);
        }
    }

    if (!isMobileView) {
      setupDesktopClones();
      currentIndex = slides.findIndex(s => !s.classList.contains('cloned') && parseInt(s.dataset.slideIndex) === logicalCurrentIndex);
      if (currentIndex === -1 && slides.length > 0) {
          currentIndex = clonesToPrepend.length + logicalCurrentIndex;
          if(currentIndex >= slides.length || currentIndex < 0) currentIndex = clonesToPrepend.length;
      }
    } else {
      currentIndex = logicalCurrentIndex;
      if(track) track.style.transform = 'none';
    }

    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));

    if (!isMobileView) {
      positionTrackForActiveSlide(true); // This sets initial lastAnimatedTranslateX
    } else {
      if(slides[currentIndex]) slides[currentIndex].scrollIntoView({ behavior: 'auto', block: 'nearest' });
    }
  }

  function updateSlider(newDirectionOrIndex, isInitialization = false) {
    if (isTransitioning && !isInitialization) return;
    if (!isMobileView) isTransitioning = true;

    let newActiveActualIndex = currentIndex;
    const currentOriginalSlideIndex = parseInt(slides[currentIndex].dataset.originalIndex || slides[currentIndex].dataset.slideIndex);
    const numOriginalSlides = track.querySelectorAll('.slide-item:not(.cloned)').length;

    if (typeof newDirectionOrIndex === 'number') {
        const targetOriginalIndex = newDirectionOrIndex;
        const targetSlideInstance = slides.find(s =>
            (isMobileView || !s.classList.contains('cloned')) &&
            parseInt(s.dataset.slideIndex) === targetOriginalIndex
        );
        if (targetSlideInstance) {
            newActiveActualIndex = slides.indexOf(targetSlideInstance);
        } else if (!isMobileView) {
            const clonedTarget = slides.find(s => s.classList.contains('cloned') && parseInt(s.dataset.originalIndex) === targetOriginalIndex);
            if(clonedTarget) newActiveActualIndex = slides.indexOf(clonedTarget);
            else { if (!isMobileView) isTransitioning = false; return; }
        } else {
             if (!isMobileView) isTransitioning = false; return;
        }
    } else {
        const direction = newDirectionOrIndex;
        if (!isMobileView) {
            newActiveActualIndex = currentIndex + (direction === 'next' ? 1 : -1);
        } else {
            let newLogicalIndex = (currentOriginalSlideIndex + (direction === 'next' ? 1 : -1) + numOriginalSlides) % numOriginalSlides;
            newActiveActualIndex = slides.findIndex(s => parseInt(s.dataset.slideIndex) === newLogicalIndex && !s.classList.contains('cloned'));
        }
    }

    if (newActiveActualIndex < 0 || newActiveActualIndex >= slides.length) {
        console.warn("newActiveActualIndex out of bounds", newActiveActualIndex, "current:", currentIndex);
        if(!isMobileView){ // Attempt to recover for desktop loop
             if (newActiveActualIndex < 0) newActiveActualIndex = slides.length - 1 - clonesToAppend.length; // Point to a prepended clone if possible
             else if (newActiveActualIndex >= slides.length) newActiveActualIndex = clonesToPrepend.length; // Point to an appended clone
             // More robustly, use the modulo of total slides length
             newActiveActualIndex = (newActiveActualIndex + slides.length) % slides.length;

        } else { // On mobile, if out of bounds, something is wrong, don't proceed
            if (!isMobileView) isTransitioning = false;
            return;
        }
    }

    slides[currentIndex].classList.remove('active');
    slides[newActiveActualIndex].classList.add('active');
    currentIndex = newActiveActualIndex;

    if (!isMobileView) {
        positionTrackForActiveSlide(isInitialization); // This calculates and stores lastAnimatedTranslateX
        const trackTransitionDuration = parseFloat(window.getComputedStyle(track).transitionDuration) * 1000 || 600;
        setTimeout(() => {
          checkAndResetToOriginalSlide();
        }, trackTransitionDuration);
    } else {
        if(slides[currentIndex]) slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function checkAndResetToOriginalSlide() {
    if (isMobileView || !slides[currentIndex]) {
        isTransitioning = false;
        return;
    }

    const currentSlideNode = slides[currentIndex]; // This is the clone that just finished animating
    if (currentSlideNode.classList.contains('cloned')) {
      const originalIndexToFind = parseInt(currentSlideNode.dataset.originalIndex);
      const originalSlideInstance = slides.find(s =>
        !s.classList.contains('cloned') &&
        parseInt(s.dataset.slideIndex) === originalIndexToFind
      );

      if (originalSlideInstance) {
        const newOriginalActualIndex = slides.indexOf(originalSlideInstance);

        // Calculate the difference in offsetLeft between the clone and its original
        const offsetLeftClone = currentSlideNode.offsetLeft;
        const offsetLeftOriginal = originalSlideInstance.offsetLeft;
        const deltaOffset = offsetLeftOriginal - offsetLeftClone;

        // The new track position is the last animated position adjusted by this delta
        const newTranslateXForOriginal = lastAnimatedTranslateX - deltaOffset;

        track.style.transition = 'none';
        track.style.transform = `translateX(${newTranslateXForOriginal}px)`; // Snap to new position

        currentSlideNode.classList.remove('active');
        originalSlideInstance.classList.add('active');
        currentIndex = newOriginalActualIndex;

        lastAnimatedTranslateX = newTranslateXForOriginal; // Update for consistency if needed, though next animation recalculates

        track.offsetHeight;
        track.style.transition = 'transform 0.6s ease-in-out';
      } else {
        console.warn("Original slide for reset not found:", originalIndexToFind);
      }
    }
    isTransitioning = false;
  }

  function positionTrackForActiveSlide(isImmediate = false) {
    if (isMobileView || !slides[currentIndex]) {
      if(track) track.style.transform = 'none';
      return;
    }
    const activeSlide = slides[currentIndex];
    if (!activeSlide) return;

    const viewportWidth = viewport.offsetWidth;
    const activeContentView = activeSlide.querySelector('.active-view');
    // Use the globally defined fixedActiveViewWidth from the top of the script
    const activeContentEffectiveWidth = activeContentView ? parseFloat(window.getComputedStyle(activeContentView).width) : fixedActiveViewWidth;

    // Ensure the right edge of active slide aligns with right edge of viewport.
    // desiredActiveLeftEdgeInViewport means where the left of the active slide should be relative to viewport 0
    const desiredActiveLeftEdgeInViewport = Math.max(0, viewportWidth - activeContentEffectiveWidth);
    const actualActiveOffsetLeft = activeSlide.offsetLeft;

    let targetTranslateX = desiredActiveLeftEdgeInViewport - actualActiveOffsetLeft;
    targetTranslateX = Math.min(0, targetTranslateX); // Don't pull track too far right

    lastAnimatedTranslateX = targetTranslateX; // Store this for the alternative reset strategy

    if (isImmediate) {
        const currentTransitionSetting = track.style.transition;
        track.style.transition = 'none';
        track.style.transform = `translateX(${targetTranslateX}px)`;
        track.offsetHeight;
        track.style.transition = currentTransitionSetting || 'transform 0.6s ease-in-out';
    } else {
        track.style.transform = `translateX(${targetTranslateX}px)`;
    }
  }

  track.addEventListener('click', function(event){
      const clickedSlide = event.target.closest('.slide-item');
      if(clickedSlide && slides.includes(clickedSlide)){
          const targetOriginalIndex = parseInt(clickedSlide.dataset.originalIndex || clickedSlide.dataset.slideIndex);
          const currentActiveSlide = slides[currentIndex];
          const currentActiveOriginalIndex = parseInt(currentActiveSlide.dataset.originalIndex || currentActiveSlide.dataset.slideIndex);

          if (targetOriginalIndex !== currentActiveOriginalIndex) {
            updateSlider(targetOriginalIndex);
          }
      }
  });

  prevBtn.addEventListener('click', () => updateSlider('prev'));
  nextBtn.addEventListener('click', () => updateSlider('next'));

  initializeSliderState();

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      const oldMobileView = isMobileView;
      isMobileView = window.innerWidth <= 767;
      if (oldMobileView !== isMobileView) {
        initializeSliderState();
      } else if (!isMobileView) {
        positionTrackForActiveSlide(true); // This will update lastAnimatedTranslateX
      }
    }, 250);
  });

  console.log('Advanced slider (Alternative Reset Strategy V1) initialized.');
});
