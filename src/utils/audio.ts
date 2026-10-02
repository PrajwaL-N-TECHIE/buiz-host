/**
 * Buildicy Apex Audio Utility
 * Synthetic sound generation using Web Audio API
 */

class BuildicyAudio {
    private ctx: AudioContext | null = null;

    private init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Call this strictly during a user interaction (like onClick) to unlock iOS Safari
    prime() {
        try {
            this.init();
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            gain.gain.value = 0; // Silent
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.01);
        } catch (e) {
            console.warn("Audio prime failed:", e);
        }
    }

    playTone(freq: number, type: OscillatorType = 'sine', duration: number = 0.1, volume: number = 0.1) {
        try {
            this.init();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {
            console.warn("Audio play failed:", e);
        }
    }

    // Preset Sounds
    playHover() {
        this.playTone(880, 'sine', 0.05, 0.05); // High tink
    }

    playClick() {
        this.playTone(440, 'triangle', 0.1, 0.1); // Solid click
    }

    playBoot() {
        this.playTone(220, 'sawtooth', 0.5, 0.05); // Low pulse
        setTimeout(() => this.playTone(440, 'sine', 0.2, 0.05), 100);
    }

    playSuccess() {
        this.playTone(523.25, 'sine', 0.2, 0.1); // C5
        setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.1), 100); // E5
        setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.1), 200); // G5
    }

    playPrint() {
        // Fast repeating scratchy sounds like a dot-matrix or thermal printer
        let time = 0;
        for (let i = 0; i < 25; i++) {
            // Random jitter for mechanical sound
            const jitter = Math.random() * 10;
            setTimeout(() => this.playTone(150 + Math.random() * 50, 'square', 0.04, 0.05), time + jitter);
            setTimeout(() => this.playTone(800 + Math.random() * 200, 'sawtooth', 0.02, 0.02), time + 20 + jitter);
            time += 100;
        }
    }
}

export const audio = new BuildicyAudio();

// Procedural Web Audio API Sound Effects for Buiz Arena
export const playTickSound = () => {
    audio.playTone(800, 'sine', 0.05, 0.1);
};

export const playCorrectSound = () => {
    audio.playSuccess();
};

export const playIncorrectSound = () => {
    audio.playTone(150, 'sawtooth', 0.3, 0.3);
};
