class CanvasController {
    constructor() {
        this.canvas = document.getElementById('mainCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isPanning = false;
        this.lastPanX = 0;
        this.lastPanY = 0;
        
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        
        // Grid settings
        this.gridSize = 20;
        this.gridDots = [];
        this.generateGrid();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight - 50;
        this.render();
    }

    generateGrid() {
        const cols = Math.ceil(this.canvas.width / this.gridSize) + 1;
        const rows = Math.ceil(this.canvas.height / this.gridSize) + 1;
        
        this.gridDots = [];
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                this.gridDots.push({
                    x: i * this.gridSize,
                    y: j * this.gridSize
                });
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid
        this.ctx.save();
        this.ctx.translate(this.offsetX, this.offsetY);
        this.ctx.scale(this.scale, this.scale);
        
        this.ctx.fillStyle = '#00ff00';
        this.gridDots.forEach(dot => {
            this.ctx.fillRect(dot.x, dot.y, 1, 1);
        });
        
        this.ctx.restore();
        
        // Update node positions
        nodeSystem.updateNodePorts();
        
        // Draw connections
        connectionSystem.render();
        
        requestAnimationFrame(() => this.render());
    }

    onWheel(e) {
        e.preventDefault();
        
        const zoomFactor = 1.1;
        const mouseX = e.clientX - this.offsetX;
        const mouseY = e.clientY - this.offsetY;
        
        if (e.deltaY < 0) {
            this.scale *= zoomFactor;
        } else {
            this.scale /= zoomFactor;
        }
        
        this.scale = Math.min(Math.max(this.scale, 0.1), 5);
        
        this.offsetX = e.clientX - mouseX * this.scale;
        this.offsetY = e.clientY - mouseY * this.scale;
        
        document.getElementById('status').textContent = 
            `Zoom: ${Math.round(this.scale * 100)}%`;
    }

    onMouseDown(e) {
        if (e.button === 1 || (e.button === 0 && e.altKey)) {
            this.isPanning = true;
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    onMouseMove(e) {
        if (this.isPanning) {
            this.offsetX += e.clientX - this.lastPanX;
            this.offsetY += e.clientY - this.lastPanY;
            
            this.lastPanX = e.clientX;
            this.lastPanY = e.clientY;
        }
    }

    onMouseUp() {
        this.isPanning = false;
        this.canvas.style.cursor = 'grab';
    }

    updateTransform() {
        nodeSystem.nodes.forEach(node => {
            const el = document.getElementById(`node-${node.id}`);
            if (el) {
                el.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
            }
        });
    }
}

window.canvas = new CanvasController();
