document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.querySelector('.grid-container');
    const modeToggle = document.getElementById('mode-toggle');
    const toggleLabel = document.querySelector('.toggle-label');
    const modal = document.getElementById('challenge-modal');
    const modalContent = document.getElementById('challenge-details');
    const closeButton = document.querySelector('.close-button');
    const respinButton = document.getElementById('respin-button');
    const spinButton = document.getElementById('spin-button');

    const challenges = [
        "Create a piece of art using only circles.",
        "Write a short story that starts with the line 'The last thing I expected to see was...'",
        "Design a logo for a fictional company called 'Cosmic Cookies'.",
        "Compose a short piece of music using only sounds from your kitchen.",
        "Choreograph a 30-second dance to your favorite song.",
        "Build a sculpture out of recycled materials.",
        "Write a poem about the color blue.",
        "Take a photo of something ordinary from an extraordinary angle.",
        "Create a new recipe using only 5 ingredients.",
        "Draw a map of a fictional city.",
        "Invent a new board game.",
        "Write a thank-you note to someone who has inspired you."
    ];

    function generateGrid() {
        gridContainer.innerHTML = '';
        const numItems = challenges.length;
        gridContainer.style.setProperty('--angle-step', `${360 / numItems}deg`);
        challenges.forEach((challenge, index) => {
            const item = document.createElement('div');
            item.classList.add('grid-item');
            item.dataset.index = index;
            item.dataset.challenge = challenge;
            item.textContent = index + 1;
            item.style.setProperty('--i', index);
            gridContainer.appendChild(item);
        });
    }

    function openModal(challenge) {
        modalContent.textContent = challenge;
        modal.style.display = 'block';
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    // Event Listeners
    modeToggle.addEventListener('change', () => {
        const items = Array.from(gridContainer.children);
        const state = Flip.getState(items);

        gridContainer.classList.toggle('wheel-view');

        if (modeToggle.checked) {
            toggleLabel.textContent = 'Switch to Grid View';
        } else {
            toggleLabel.textContent = 'Switch to Spinning Wheel';
        }

        Flip.from(state, {
            duration: 1,
            ease: "power1.inOut",
            absolute: true, // because we change position from static to absolute
        });
    });

    gridContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('grid-item')) {
            const challenge = e.target.dataset.challenge;
            openModal(challenge);
        }
    });

    closeButton.addEventListener('click', closeModal);
    respinButton.addEventListener('click', () => {
        closeModal();
        setTimeout(() => {
            // Only trigger a respin if we are in wheel view
            if (modeToggle.checked) {
                spinButton.click();
            }
        }, 300); // A small delay to allow the modal to close
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    spinButton.addEventListener('click', () => {
        // Prevent spinning if an animation is already in progress
        if (gsap.isTweening(gridContainer)) {
            return;
        }

        spinButton.disabled = true;
        const items = Array.from(gridContainer.children);
        const winnerIndex = Math.floor(Math.random() * items.length);
        const winner = items[winnerIndex];

        const angleStep = parseFloat(gridContainer.style.getPropertyValue('--angle-step'));
        const rotation = -winnerIndex * angleStep;
        const randomSpins = 5 * 360; // 5 full rotations for drama

        gsap.to(gridContainer, {
            rotation: randomSpins + rotation + "_short",
            duration: 4,
            ease: 'power3.out',
            onComplete: () => {
                spinButton.disabled = false;
                gsap.to(winner, {
                    scale: 1.15,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 3,
                    ease: 'power2.inOut',
                    onComplete: () => {
                        openModal(winner.dataset.challenge);
                        gsap.set(winner, { clearProps: 'scale' });
                    }
                });
            }
        });
    });


    // Initial setup
    generateGrid();
});
