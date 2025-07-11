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

  let currentIndex = initialActiveIndex; // This will be updated after cloning for desktop
  let isTransitioning = false;
  const fixedActiveViewWidth = 500;
  let isMobileView = window.innerWidth <= 767;

  let originalSlidesCount = slides.length;
  const clonesToPrepend = [];
  const clonesToAppend = [];

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

    for (let i = 0; i < NUM_VISIBLE_THUMBNAILS + 1 + 1; i++) { // +1 for active, +1 for buffer
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

    slides = Array.from(track.querySelectorAll('.slide-item')); // Should be originals only now
    originalSlidesCount = slides.length;
    if (originalSlidesCount === 0) return;

    let logicalCurrentIndex = slides.findIndex(slide => slide.classList.contains('active'));
    if (logicalCurrentIndex < 0 || logicalCurrentIndex >= originalSlidesCount) {
        logicalCurrentIndex = initialActiveIndex; // Use the initially set active index
        if (logicalCurrentIndex < 0 || logicalCurrentIndex >= originalSlidesCount) {
             logicalCurrentIndex = Math.max(0, originalSlidesCount - 1);
        }
    }

    if (!isMobileView) {
      setupDesktopClones();
      currentIndex = slides.findIndex(s => !s.classList.contains('cloned') && parseInt(s.dataset.slideIndex) === logicalCurrentIndex);
      if (currentIndex === -1 && slides.length > 0) {
          currentIndex = clonesToPrepend.length + logicalCurrentIndex;
          if(currentIndex >= slides.length || currentIndex < 0) currentIndex = clonesToPrepend.length; // further fallback
      }
    } else {
      currentIndex = logicalCurrentIndex;
      if(track) track.style.transform = 'none';
    }

    slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));

    if (!isMobileView) {
      positionTrackForActiveSlide(true);
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
        // Attempt to recover for desktop if out of bounds during prev/next on clones
        if(!isMobileView){
            if(newActiveActualIndex < 0) newActiveActualIndex = slides.length -1;
            else if (newActiveActualIndex >= slides.length) newActiveActualIndex = 0;
        } else {
            if (!isMobileView) isTransitioning = false;
            return;
        }
    }

    slides[currentIndex].classList.remove('active');
    slides[newActiveActualIndex].classList.add('active');
    currentIndex = newActiveActualIndex;

    if (!isMobileView) {
        positionTrackForActiveSlide(isInitialization);
        const trackTransitionDuration = parseFloat(window.getComputedStyle(track).transitionDuration) * 1000 || 600;
        setTimeout(() => {
          checkAndResetToOriginalSlide(); // This will also set isTransitioning = false eventually
        }, trackTransitionDuration);
    } else {
        if(slides[currentIndex]) slides[currentIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // isTransitioning is not used for mobile scrolling in this way
    }
  }

  function checkAndResetToOriginalSlide() {
    if (isMobileView || !slides[currentIndex]) {
        isTransitioning = false; // Ensure flag is reset
        return;
    }

    const currentSlideNode = slides[currentIndex];
    if (currentSlideNode.classList.contains('cloned')) {
      const originalIndexToFind = parseInt(currentSlideNode.dataset.originalIndex);
      const originalSlideInstance = slides.find(s =>
        !s.classList.contains('cloned') &&
        parseInt(s.dataset.slideIndex) === originalIndexToFind
      );

      if (originalSlideInstance) {
        const newOriginalActualIndex = slides.indexOf(originalSlideInstance);

        track.style.transition = 'none';

        // Critical: Update active class and currentIndex *before* repositioning
        currentSlideNode.classList.remove('active'); // Deactivate clone
        originalSlideInstance.classList.add('active'); // Activate original
        currentIndex = newOriginalActualIndex;      // Update global currentIndex

        positionTrackForActiveSlide(true); // Recalculate and snap based on the *original* slide

        track.offsetHeight;
        track.style.transition = 'transform 0.6s ease-in-out';
      } else {
        console.warn("Original slide for reset not found:", originalIndexToFind);
      }
    }
    isTransitioning = false; // Reset flag after check/reset or if not a clone
  }

  function positionTrackForActiveSlide(isImmediate = false) {
    if (isMobileView || !slides[currentIndex]) {
      if(track) track.style.transform = 'none';
      return;
    }
    const activeSlide = slides[currentIndex]; // Now correctly points to the target slide (original or clone)
    if (!activeSlide) return;

    const viewportWidth = viewport.offsetWidth;
    const activeContentView = activeSlide.querySelector('.active-view');
    const activeContentEffectiveWidth = activeContentView ? parseFloat(window.getComputedStyle(activeContentView).width) : fixedActiveViewWidth;

    const desiredActiveLeftEdgeInViewport = Math.max(0, viewportWidth - activeContentEffectiveWidth - 20);
    const actualActiveOffsetLeft = activeSlide.offsetLeft;

    let targetTranslateX = desiredActiveLeftEdgeInViewport - actualActiveOffsetLeft;
    targetTranslateX = Math.min(0, targetTranslateX);

    if (isImmediate && track.style.transition !== 'none') { // Only override if not already 'none'
        const currentTransitionSetting = track.style.transition;
        track.style.transition = 'none';
        track.style.transform = `translateX(${targetTranslateX}px)`;
        track.offsetHeight;
        track.style.transition = currentTransitionSetting || 'transform 0.6s ease-in-out';
    } else if (isImmediate && track.style.transition === 'none') { // If already 'none', just set transform
        track.style.transform = `translateX(${targetTranslateX}px)`;
    }
    else { // Animated
        track.style.transform = `translateX(${targetTranslateX}px)`;
    }
  }

  track.addEventListener('click', function(event){
      const clickedSlide = event.target.closest('.slide-item');
      if(clickedSlide && slides.includes(clickedSlide)){
          const targetOriginalIndex = parseInt(clickedSlide.dataset.originalIndex || clickedSlide.dataset.slideIndex);
          const currentActiveOriginalIndex = parseInt(slides[currentIndex].dataset.originalIndex || slides[currentIndex].dataset.slideIndex);
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
        positionTrackForActiveSlide(true);
      }
    }, 250);
  });

  console.log('Advanced slider (Refined Reset Logic) initialized.');
});
