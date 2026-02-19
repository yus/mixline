class ConnectionSystem {
    constructor() {
        this.connections = [];
        this.draggingConnection = null;
    }

    startConnection(nodeId, portIndex, isOutput) {
        const node = nodeSystem.getNodeById(nodeId);
        if (!node) return;
        
        const port = isOutput ? node.outputs[portIndex] : node.inputs[portIndex];
        this.draggingConnection = {
            fromNode: isOutput ? nodeId : null,
            fromPort: isOutput ? portIndex : null,
            toNode: !isOutput ? nodeId : null,
            toPort: !isOutput ? portIndex : null,
            startX: port.x,
            startY: port.y,
            currentX: port.x,
            currentY: port.y
        };
    }

    updateDrag(x, y) {
        if (this.draggingConnection) {
            this.draggingConnection.currentX = x;
            this.draggingConnection.currentY = y;
            this.render();
        }
    }

    endConnection(nodeId, portIndex, isOutput) {
        if (!this.draggingConnection) return;

        const sourceNode = isOutput ? 
            nodeSystem.getNodeById(nodeId) : 
            nodeSystem.getNodeById(this.draggingConnection.fromNode);
        const destNode = !isOutput ? 
            nodeSystem.getNodeById(nodeId) : 
            nodeSystem.getNodeById(this.draggingConnection.fromNode);

        // Validate connection
        if (sourceNode && destNode && sourceNode.id !== destNode.id) {
            // Check if compatible (output to input)
            if ((isOutput && this.draggingConnection.fromNode) || 
                (!isOutput && this.draggingConnection.fromNode)) {
                
                const sourcePort = isOutput ? 
                    sourceNode.outputs[portIndex] : 
                    sourceNode.outputs[this.draggingConnection.fromPort];
                const destPort = !isOutput ? 
                    destNode.inputs[portIndex] : 
                    destNode.inputs[this.draggingConnection.toPort];

                // Create connection
                const connection = {
                    id: `${sourceNode.id}-${destNode.id}-${Date.now()}`,
                    fromNode: sourceNode.id,
                    fromPort: this.draggingConnection.fromPort,
                    toNode: destNode.id,
                    toPort: portIndex,
                    sourcePort: sourcePort,
                    destPort: destPort
                };

                // Try audio connection
                if (sourceNode.audioNode && destNode.audioNode) {
                    const success = audio.connect(
                        sourceNode.audioNode.output,
                        destNode.audioNode.node
                    );
                    
                    if (success) {
                        this.connections.push(connection);
                    }
                }
            }
        }

        this.draggingConnection = null;
        this.render();
    }

    removeConnectionsForNode(nodeId) {
        this.connections = this.connections.filter(c => 
            c.fromNode !== nodeId && c.toNode !== nodeId
        );
    }

    render() {
        const canvas = document.getElementById('mainCanvas');
        const ctx = canvas.getContext('2d');
        
        // Clear and redraw all connections
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw existing connections
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = '#00ff00';
        
        this.connections.forEach(conn => {
            const fromNode = nodeSystem.getNodeById(conn.fromNode);
            const toNode = nodeSystem.getNodeById(conn.toNode);
            
            if (fromNode && toNode && fromNode.outputs[conn.fromPort] && toNode.inputs[conn.toPort]) {
                const startX = fromNode.outputs[conn.fromPort].x;
                const startY = fromNode.outputs[conn.fromPort].y;
                const endX = toNode.inputs[conn.toPort].x;
                const endY = toNode.inputs[conn.toPort].y;
                
                this.drawCurve(ctx, startX, startY, endX, endY);
            }
        });
        
        // Draw dragging connection
        if (this.draggingConnection) {
            ctx.strokeStyle = '#ffaa00';
            ctx.setLineDash([5, 5]);
            this.drawCurve(
                ctx, 
                this.draggingConnection.startX, 
                this.draggingConnection.startY,
                this.draggingConnection.currentX, 
                this.draggingConnection.currentY
            );
            ctx.setLineDash([]);
        }
    }

    drawCurve(ctx, x1, y1, x2, y2) {
        ctx.beginPath();
        const cp1 = { x: x1 + (x2 - x1) * 0.5, y: y1 };
        const cp2 = { x: x2 - (x2 - x1) * 0.5, y: y2 };
        ctx.moveTo(x1, y1);
        ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, x2, y2);
        ctx.stroke();
    }
}

window.connectionSystem = new ConnectionSystem();
