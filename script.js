const canvas = document.getElementById('grid-canvas');
const ctx = canvas.getContext('2d');
const gridSize = 40;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function handleMouseMove(e) {
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const nearX = Math.round(mouseX / gridSize) * gridSize;
    const nearY = Math.round(mouseY / gridSize) * gridSize;

    drawGrid();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(nearX, 0);
    ctx.lineTo(nearX, canvas.height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, nearY);
    ctx.lineTo(canvas.width, nearY);
    ctx.stroke();
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
        gsap.to(this.target, { scale: 1.1, backgroundColor: '#ff4500' });
    },
    onDragEnd: function() {
        gsap.to(this.target, { scale: 1, backgroundColor: this.target.style.backgroundColor });
    }
});
