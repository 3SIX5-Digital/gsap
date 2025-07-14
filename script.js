const wrapper = document.querySelector('.organ-cell-wrapper');
const text = document.querySelector('.what-we-detect');
const image = document.querySelector('.organ-image');

const tl = gsap.timeline({ paused: true });

tl.to(text.children, {
    opacity: 1,
    filter: 'blur(0px)',
    stagger: {
        each: 0.05,
        from: 'start'
    },
    duration: 0.2,
    ease: 'power1.inOut'
})
.to(image, {
    scale: 1.05,
    duration: 1,
    ease: 'power2.out'
}, 0)
.to('.ripple', {
    width: '200px',
    height: '200px',
    duration: 1,
    ease: 'power2.out'
}, 0);

wrapper.addEventListener('mouseenter', () => {
    tl.timeScale(1).play();
});

wrapper.addEventListener('mouseleave', () => {
    tl.timeScale(2).reverse();
});

// Initial state
gsap.set(text.children, { opacity: 0, filter: 'blur(20px)' });
