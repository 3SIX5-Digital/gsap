document.addEventListener("DOMContentLoaded", function() {
    const canvas = document.getElementById('grid-canvas');
    const ctx = canvas.getContext('2d');
    const gridSize = 40;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
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

        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gridSize * 2);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(mouseX - gridSize * 2, mouseY - gridSize * 2, gridSize * 4, gridSize * 4);
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        drawGrid();
    });

    window.addEventListener('mousemove', handleMouseMove);

    resizeCanvas();
    drawGrid();

    gsap.registerPlugin(Draggable);

    // Initialize Draggable after a short delay to ensure elements are positioned
    setTimeout(() => {
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
    }, 100);


    const creativeText = document.createElement('div');
    creativeText.className = 'creative-text';
    creativeText.textContent = 'A space for ideas to grow.';
    document.body.appendChild(creativeText);
});
