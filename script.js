const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');
const navLinks = gsap.utils.toArray('.mobile-nav a');

const tl = gsap.timeline({ paused: true, reversed: true });

tl.to(mobileNav, {
    right: 0,
    duration: 0.5,
    ease: 'power2.inOut',
    visibility: 'visible'
});

tl.to(navLinks, {
    opacity: 1,
    y: 0,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power2.inOut'
}, "-=0.2");

menuButton.addEventListener('click', () => {
    tl.reversed() ? tl.play() : tl.reverse();
});
