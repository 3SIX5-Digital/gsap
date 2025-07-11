document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggers = document.querySelectorAll('[data-tooltip-trigger]');

    if (tooltipTriggers.length === 0) {
        return;
    }

    const tooltipElement = document.createElement('div');
    tooltipElement.classList.add('gsap-tooltip');
    document.body.appendChild(tooltipElement);

    // Create the sheen pseudo-element reference if you want to directly animate it with JS
    // However, it's often easier to animate CSS variables or direct properties of the main element.
    // For this, we'll animate the ::after pseudo-element's opacity and transform via its parent.
    // GSAP can animate pseudo-elements directly but it's a bit more setup.
    // We will animate the opacity of the ::after element via CSS and control its position via CSS variables updated by GSAP.

    gsap.set(tooltipElement, {
        opacity: 0,
        visibility: 'hidden',
        rotateX: 0,
        rotateY: 0,
        // CSS Variables for sheen position, initially centered (won't be visible due to opacity 0)
        '--sheen-x': '50%',
        '--sheen-y': '50%'
    });
    // Also set initial opacity for sheen via CSS variable if preferred, or use direct style as below
    gsap.set(tooltipElement, { '--sheen-opacity': 0 });


    // --- Enhanced CSS for sheen using CSS variables ---
    // This should be in your CSS file, but for clarity if you can't edit CSS easily right now:
    // .gsap-tooltip::after {
    //   opacity: var(--sheen-opacity);
    //   background: radial-gradient(circle at var(--sheen-x) var(--sheen-y), rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 50%);
    // }
    // Make sure your .gsap-tooltip::after CSS uses these variables.
    // Let's assume the CSS is already updated like this:
    // .gsap-tooltip::after {
    //   ...
    //   opacity: var(--sheen-opacity, 0); /* Default to 0 if not set */
    //   background: radial-gradient(circle at var(--sheen-x, 50%) var(--sheen-y, 50%), ...);
    // }


    let currentTween;
    let currentTrigger = null; // To keep track of the active trigger for mousemove

    const handleMouseMove = (e) => {
        if (!currentTrigger || !tooltipElement.style.visibility || tooltipElement.style.visibility === 'hidden') {
            return;
        }

        const triggerRect = currentTrigger.getBoundingClientRect();

        // Calculate mouse position relative to the center of the trigger
        const mouseX = e.clientX - triggerRect.left;
        const mouseY = e.clientY - triggerRect.top;

        // For 3D Tilt:
        // Map mouse position to rotation values. Adjust maxRotation for more/less effect.
        const maxRotation = 8; // Max degrees of rotation
        const rotateY = (mouseX / triggerRect.width - 0.5) * 2 * maxRotation;
        const rotateX = -(mouseY / triggerRect.height - 0.5) * 2 * maxRotation;

        // For Sheen Effect:
        // Map mouse position on trigger to sheen position on tooltip
        // The sheen is 200% width/height and absolutely positioned, so 0-100% covers it.
        const sheenX = (mouseX / triggerRect.width) * 100;
        const sheenY = (mouseY / triggerRect.height) * 100;

        gsap.to(tooltipElement, {
            duration: 0.6, // A bit slower for smoother following
            rotateX: rotateX,
            rotateY: rotateY,
            '--sheen-x': `${sheenX}%`,
            '--sheen-y': `${sheenY}%`,
            ease: 'power2.out'
        });
    };


    tooltipTriggers.forEach(trigger => {
        const tooltipText = trigger.getAttribute('data-tooltip-text');

        if (!tooltipText) {
            console.warn('Tooltip trigger is missing data-tooltip-text attribute:', trigger);
            return;
        }

        trigger.addEventListener('mouseenter', function (e) {
            currentTrigger = trigger; // Set current trigger
            document.addEventListener('mousemove', handleMouseMove);


            if (currentTween) {
                currentTween.kill();
            }

            tooltipElement.textContent = tooltipText;

            const triggerRect = trigger.getBoundingClientRect();

            const initialVisibility = tooltipElement.style.visibility;
            const initialOpacity = tooltipElement.style.opacity;
            tooltipElement.style.visibility = 'visible';
            tooltipElement.style.opacity = '1'; // Ensure it has dimensions
            // Temporarily reset transforms that affect size/position for measurement
            gsap.set(tooltipElement, {rotateX:0, rotateY:0, y:0});

            const tooltipRect = tooltipElement.getBoundingClientRect();

            tooltipElement.style.visibility = initialVisibility;
            tooltipElement.style.opacity = initialOpacity;

            let top = triggerRect.top + window.scrollY - tooltipRect.height - 10;
            let left = triggerRect.left + window.scrollX + (triggerRect.width / 2) - (tooltipRect.width / 2);

            if (left < 5) left = 5;
            if (left + tooltipRect.width > window.innerWidth - 5) left = window.innerWidth - tooltipRect.width - 5;

            let finalYAnim = -8;

            if (top < window.scrollY + 5) {
                top = triggerRect.bottom + window.scrollY + 10;
                finalYAnim = 8;
            }

            // Set initial position and reset y (for slide) and rotations (for 3D)
            gsap.set(tooltipElement, {
                top: `${top}px`,
                left: `${left}px`,
                y: 0,
                rotateX: 0, // Start flat for the show animation
                rotateY: 0,
                '--sheen-opacity': 0 // Sheen starts hidden
            });

            currentTween = gsap.to(tooltipElement, {
                duration: 0.4, // Slightly longer for a smoother feel
                opacity: 1,
                visibility: 'visible',
                y: finalYAnim,
                '--sheen-opacity': 1, // Fade in sheen
                ease: 'power3.out',
                overwrite: 'auto',
                onComplete: () => {
                    // Start the 3D tilt from a neutral position once shown
                    // Or allow mousemove to handle it immediately
                }
            });
        });

        trigger.addEventListener('mouseleave', function () {
            document.removeEventListener('mousemove', handleMouseMove);
            currentTrigger = null; // Clear current trigger

            if (currentTween) {
                currentTween.kill();
            }
            currentTween = gsap.to(tooltipElement, {
                duration: 0.3, // Slightly faster hide
                opacity: 0,
                // visibility: 'hidden', // Delay visibility for fade out
                y: 0,
                rotateX: 0, // Reset rotation
                rotateY: 0,
                '--sheen-opacity': 0, // Fade out sheen
                ease: 'power3.in',
                onComplete: () => {
                    gsap.set(tooltipElement, { visibility: 'hidden' }); // Hide after fade
                }
            });
        });
    });
});
