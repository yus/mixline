// Initialize everything
document.addEventListener('DOMContentLoaded', () => {
    console.log('Mixline initialized');
    
    // Add port event listeners
    document.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('port')) {
            const port = e.target;
            const nodeId = parseInt(port.dataset.node);
            const portIndex = parseInt(port.dataset.port);
            const isOutput = port.classList.contains('output');
            
            connectionSystem.startConnection(nodeId, portIndex, isOutput);
            e.preventDefault();
        }
    });
    
    document.addEventListener('mousemove', (e) => {
        connectionSystem.updateDrag(e.clientX, e.clientY);
    });
    
    document.addEventListener('mouseup', (e) => {
        if (connectionSystem.draggingConnection) {
            if (e.target.classList.contains('port')) {
                const port = e.target;
                const nodeId = parseInt(port.dataset.node);
                const portIndex = parseInt(port.dataset.port);
                const isOutput = port.classList.contains('output');
                
                connectionSystem.endConnection(nodeId, portIndex, isOutput);
            } else {
                connectionSystem.draggingConnection = null;
            }
        }
    });
});

// Global functions for toolbar
function addNode(type) {
    const x = 100 + Math.random() * 200;
    const y = 100 + Math.random() * 200;
    nodeSystem.addNode(type, x, y);
}

function clearSelection() {
    nodeSystem.clearSelection();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
        clearSelection();
    }
    
    if (e.key === ' ' && !e.repeat) {
        canvas.isPanning = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === ' ') {
        canvas.isPanning = false;
    }
});
