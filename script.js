const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 40;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function handleMouseMove(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    drawGrid();

    const nearX = Math.round(mouseX / gridSize) * gridSize;
    const nearY = Math.round(mouseY / gridSize) * gridSize;

    const gradientX = ctx.createRadialGradient(nearX, mouseY, 0, nearX, mouseY, gridSize * 3);
    gradientX.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    gradientX.addColorStop(1, 'rgba(0, 0, 0, 0)');

    const gradientY = ctx.createRadialGradient(mouseX, nearY, 0, mouseX, nearY, gridSize * 3);
    gradientY.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
    gradientY.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradientX;
    ctx.fillRect(nearX - gridSize * 3, mouseY - gridSize * 3, gridSize * 6, gridSize * 6);

    ctx.fillStyle = gradientY;
    ctx.fillRect(mouseX - gridSize * 3, nearY - gridSize * 3, gridSize * 6, gridSize * 6);
}

window.addEventListener('resize', () => {
    resizeCanvas();
    drawGrid();
});

window.addEventListener('mousemove', handleMouseMove);

resizeCanvas();
drawGrid();

gsap.registerPlugin(Draggable);

Draggable.create(".draggable-element", {
    type: "x,y",
    edgeResistance: 0.65,
    bounds: "body",
    inertia: true,
    onDragStart: function() {
        gsap.to(this.target, {
            scale: 1.1,
            boxShadow: '0px 0px 30px 10px rgba(0,0,0,0.2)'
        });
    },
    onDragEnd: function() {
        gsap.to(this.target, {
            scale: 1,
            boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)'
        });
    }
});

const creativeText = document.createElement('div');
creativeText.className = 'creative-text';
creativeText.textContent = 'A space for ideas to grow.';
document.body.appendChild(creativeText);
