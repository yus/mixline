// Audio Context
class AudioEngine {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.nodes = new Map();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.7;
    }

    createOscillator(freq = 440, type = 'sine') {
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();
        
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = 0.5;
        
        osc.connect(gain);
        osc.start();
        
        return { node: osc, output: gain };
    }

    createGain(initialGain = 0.5) {
        const gain = this.context.createGain();
        gain.gain.value = initialGain;
        return { node: gain, output: gain };
    }

    createOutput() {
        return { node: this.masterGain, output: this.masterGain };
    }

    connect(source, destination, sourcePort = 0, destPort = 0) {
        try {
            source.connect(destination);
            return true;
        } catch (e) {
            console.error('Connection failed:', e);
            return false;
        }
    }

    disconnect(node) {
        try {
            node.disconnect();
        } catch (e) {
            console.error('Disconnect failed:', e);
        }
    }
}

window.audio = new AudioEngine();
