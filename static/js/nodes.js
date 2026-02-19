class NodeSystem {
    constructor() {
        this.nodes = [];
        this.selectedNode = null;
        this.draggingNode = false;
        this.dragOffset = { x: 0, y: 0 };
        this.nextId = 1;
    }

    addNode(type, x, y) {
        const node = {
            id: this.nextId++,
            type: type,
            x: x,
            y: y,
            width: 180,
            height: 120,
            inputs: [],
            outputs: [],
            audioNode: null,
            data: {}
        };

        // Configure node based on type
        switch(type) {
            case 'oscillator':
                node.inputs = [{ id: 'freq', label: 'Freq' }];
                node.outputs = [{ id: 'out', label: 'Out' }];
                node.data = { freq: 440, type: 'sine' };
                node.audioNode = audio.createOscillator();
                node.height = 140;
                break;
                
            case 'gain':
                node.inputs = [{ id: 'in', label: 'In' }];
                node.outputs = [{ id: 'out', label: 'Out' }];
                node.data = { gain: 0.5 };
                node.audioNode = audio.createGain();
                node.height = 120;
                break;
                
            case 'output':
                node.inputs = [{ id: 'in', label: 'In' }];
                node.outputs = [];
                node.audioNode = audio.createOutput();
                node.height = 100;
                break;
        }

        this.nodes.push(node);
        this.render();
        return node;
    }

    updateNodePorts() {
        this.nodes.forEach(node => {
            const element = document.getElementById(`node-${node.id}`);
            if (element) {
                node.inputs.forEach((port, i) => {
                    const portEl = element.querySelector(`.port.input[data-port="${i}"]`);
                    if (portEl) {
                        const rect = portEl.getBoundingClientRect();
                        port.x = rect.left + rect.width/2;
                        port.y = rect.top + rect.height/2;
                    }
                });
                
                node.outputs.forEach((port, i) => {
                    const portEl = element.querySelector(`.port.output[data-port="${i}"]`);
                    if (portEl) {
                        const rect = portEl.getBoundingClientRect();
                        port.x = rect.left + rect.width/2;
                        port.y = rect.top + rect.height/2;
                    }
                });
            }
        });
    }

    getNodeById(id) {
        return this.nodes.find(n => n.id === id);
    }

    deleteNode(id) {
        const node = this.getNodeById(id);
        if (node && node.audioNode) {
            audio.disconnect(node.audioNode.node);
        }
        this.nodes = this.nodes.filter(n => n.id !== id);
        connectionSystem.removeConnectionsForNode(id);
        this.render();
    }

    render() {
        const container = document.querySelector('.canvas-container');
        
        // Remove old node elements
        document.querySelectorAll('.node').forEach(el => el.remove());
        
        // Create new node elements
        this.nodes.forEach(node => {
            const el = document.createElement('div');
            el.id = `node-${node.id}`;
            el.className = `node ${node.selected ? 'selected' : ''}`;
            el.style.left = `${node.x}px`;
            el.style.top = `${node.y}px`;
            el.style.width = `${node.width}px`;
            
            // Header
            const header = document.createElement('div');
            header.className = 'node-header';
            header.textContent = `${node.type} [${node.id}]`;
            header.onmousedown = (e) => this.startDrag(e, node.id);
            el.appendChild(header);
            
            // Inputs
            node.inputs.forEach((port, i) => {
                const portDiv = document.createElement('div');
                portDiv.className = 'node-port';
                portDiv.innerHTML = `
                    <span>${port.label}</span>
                    <div class="port input" data-port="${i}" data-node="${node.id}"></div>
                `;
                el.appendChild(portDiv);
            });
            
            // Controls (based on type)
            if (node.type === 'oscillator') {
                const controls = document.createElement('div');
                controls.className = 'node-port';
                controls.innerHTML = `
                    <input type="range" min="20" max="2000" value="${node.data.freq}" 
                           onchange="nodeSystem.updateOscFreq(${node.id}, this.value)">
                    <span>${node.data.freq}Hz</span>
                `;
                el.appendChild(controls);
            }
            
            if (node.type === 'gain') {
                const controls = document.createElement('div');
                controls.className = 'node-port';
                controls.innerHTML = `
                    <input type="range" min="0" max="1" step="0.01" value="${node.data.gain}"
                           onchange="nodeSystem.updateGain(${node.id}, this.value)">
                    <span>${Math.round(node.data.gain*100)}%</span>
                `;
                el.appendChild(controls);
            }
            
            // Outputs
            node.outputs.forEach((port, i) => {
                const portDiv = document.createElement('div');
                portDiv.className = 'node-port';
                portDiv.innerHTML = `
                    <span>${port.label}</span>
                    <div class="port output" data-port="${i}" data-node="${node.id}"></div>
                `;
                el.appendChild(portDiv);
            });
            
            container.appendChild(el);
        });
        
        // Update port positions
        this.updateNodePorts();
        connectionSystem.render();
    }

    startDrag(e, nodeId) {
        if (e.button !== 0) return;
        
        const node = this.getNodeById(nodeId);
        if (!node) return;
        
        this.draggingNode = true;
        this.selectedNode = nodeId;
        this.dragOffset = {
            x: e.clientX - node.x,
            y: e.clientY - node.y
        };
        
        document.addEventListener('mousemove', this.onDrag.bind(this));
        document.addEventListener('mouseup', this.stopDrag.bind(this));
        
        e.preventDefault();
    }

    onDrag(e) {
        if (!this.draggingNode) return;
        
        const node = this.getNodeById(this.selectedNode);
        if (!node) return;
        
        node.x = e.clientX - this.dragOffset.x;
        node.y = e.clientY - this.dragOffset.y;
        
        this.render();
        canvas.updateTransform();
    }

    stopDrag() {
        this.draggingNode = false;
        document.removeEventListener('mousemove', this.onDrag.bind(this));
        document.removeEventListener('mouseup', this.stopDrag.bind(this));
    }

    updateOscFreq(nodeId, freq) {
        const node = this.getNodeById(nodeId);
        if (node && node.audioNode) {
            node.data.freq = parseInt(freq);
            node.audioNode.node.frequency.value = node.data.freq;
            this.render();
        }
    }

    updateGain(nodeId, gain) {
        const node = this.getNodeById(nodeId);
        if (node && node.audioNode) {
            node.data.gain = parseFloat(gain);
            node.audioNode.node.gain.value = node.data.gain;
            this.render();
        }
    }

    clearSelection() {
        if (this.selectedNode) {
            this.deleteNode(this.selectedNode);
            this.selectedNode = null;
        }
    }
}

window.nodeSystem = new NodeSystem();
