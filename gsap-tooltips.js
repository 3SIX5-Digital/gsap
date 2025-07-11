document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip-trigger]');

    if (tooltipTriggers.length === 0) {
        return; // No tooltip triggers found
    }

    // Create a single tooltip element to be reused.
    // This is more efficient than creating one for each trigger.
    const tooltipElement = document.createElement('div');
    tooltipElement.classList.add('gsap-tooltip');
    document.body.appendChild(tooltipElement);

    // Hide tooltip initially using GSAP for consistency
    gsap.set(tooltipElement, { opacity: 0, visibility: 'hidden' });

    tooltipTriggers.forEach(trigger => {
        const tooltipText = trigger.getAttribute('data-tooltip-text');

        if (!tooltipText) {
            console.warn('Tooltip trigger is missing data-tooltip-text attribute:', trigger);
            return;
        }

        let currentTween; // To store the current animation

        trigger.addEventListener('mouseenter', function (e) {
            if (currentTween) {
                currentTween.kill(); // Kill any ongoing hiding animation
            }

            tooltipElement.textContent = tooltipText;

            // Calculate position - default to above the trigger
            const triggerRect = trigger.getBoundingClientRect();
            const tooltipRect = tooltipElement.getBoundingClientRect(); // Get its current dimensions

            let top = triggerRect.top + window.scrollY - tooltipRect.height - 10; // 10px offset
            let left = triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

            // Adjust if tooltip goes off-screen (simple example)
            if (left < 0) {
                left = 5; // Small padding from edge
            }
            if (left + tooltipRect.width > window.innerWidth) {
                left = window.innerWidth - tooltipRect.width - 5;
            }
            if (top < 0) { // If it goes off the top, position it below
                top = triggerRect.bottom + window.scrollY + 10;
                 currentTween = gsap.to(tooltipElement, {
                    duration: 0.3,
                    opacity: 1,
                    visibility: 'visible',
                    y: 0, // Animate from a slight offset if desired, e.g. from y: 10
                    ease: 'power2.out',
                    overwrite: 'auto',
                    onStart: () => { // Update position just before animating
                        gsap.set(tooltipElement, { top: `${top}px`, left: `${left}px` });
                    }
                });
            } else {
                 currentTween = gsap.to(tooltipElement, {
                    duration: 0.3,
                    opacity: 1,
                    visibility: 'visible',
                    y: -8, // Animate upwards slightly
                    ease: 'power2.out',
                    overwrite: 'auto',
                    onStart: () => { // Update position just before animating
                        gsap.set(tooltipElement, { top: `${top}px`, left: `${left}px`, y:0 }); // Reset y before animating to new y
                    }
                });
            }
        });

        trigger.addEventListener('mouseleave', function () {
            if (currentTween) {
                currentTween.kill(); // Kill any ongoing showing animation
            }
            currentTween = gsap.to(tooltipElement, {
                duration: 0.2,
                opacity: 0,
                visibility: 'hidden',
                y: 0, // Return to original y position
                ease: 'power1.in'
            });
        });
    });
});
