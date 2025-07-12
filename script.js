const content = [
    "Content 1", "Content 2", "Content 3", "Content 4",
    "Content 5", "Content 6", "Content 7", "Content 8",
    "Content 9", "Content 10", "Content 11", "Content 12"
];

const wheel = document.querySelector('.wheel');
const gridItems = document.querySelectorAll('.grid-item');

// Populate wheel with content
for (let i = 0; i < content.length; i++) {
    const angle = (i / content.length) * 360;
    const item = document.createElement('div');
    item.className = 'wheel-item';
    item.style.transform = `rotate(${angle}deg) translate(150px) rotate(-${angle}deg)`;
    item.textContent = content[i];
    wheel.appendChild(item);
}

// GSAP Animations
gsap.to(wheel, {
    rotation: 360,
    duration: 10,
    ease: "none",
    repeat: -1
});

gridItems.forEach(item => {
    item.addEventListener('mouseenter', () => {
        gsap.to(item, {
            scale: 1.1,
            backgroundColor: '#ffcc00',
            duration: 0.3
        });
    });
    item.addEventListener('mouseleave', () => {
        gsap.to(item, {
            scale: 1,
            backgroundColor: '#ccc',
            duration: 0.3
        });
    });
});
