const wrapper = document.querySelector('.organ-cell-wrapper');
const text = document.querySelector('.what-we-detect');
const image = document.querySelector('.organ-image');

wrapper.addEventListener('mouseenter', () => {
    gsap.to(text.children, {
        opacity: 1,
        y: 0,
        stagger: {
            each: 0.1,
            from: 'start'
        },
        duration: 0.4,
        ease: 'power1.inOut'
    });

    gsap.to(image, {
        scale: 1.05,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.to('.ripple', {
        width: '200px',
        height: '200px',
        duration: 1,
        ease: 'power2.out'
    });
});

wrapper.addEventListener('mouseleave', () => {
    gsap.to(text.children, {
        opacity: 0,
        y: 20,
        duration: 0.4,
        ease: 'power1.inOut'
    });

    gsap.to(image, {
        scale: 1,
        duration: 1,
        ease: 'power2.out'
    });

    gsap.to('.ripple', {
        width: '0px',
        height: '0px',
        duration: 1,
        ease: 'power2.out'
    });
});

// Initial state
gsap.set(text.children, { opacity: 0, y: 20 });
