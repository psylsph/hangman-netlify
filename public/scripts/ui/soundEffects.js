export class SoundController {
    constructor() {
        this.enabled = true;
        this.volume = 0.7;
        this.sounds = {};
        this.audioContext = null;
        this.initialized = false;
        this.init();
    }

    init() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            // Create sounds using Web Audio API
            this.createSounds();
            
            // Resume audio context on user interaction (for autoplay policies)
            document.addEventListener('click', () => {
                if (this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
            }, { once: true });
            
            this.initialized = true;
        } catch (error) {
            console.warn('Audio not supported:', error);
            this.enabled = false;
        }
    }

    createSounds() {
        // Create sound effects using Web Audio API oscillators
        this.sounds = {
            correctGuess: () => this.playTone(523.25, 0.1, 'sine'), // C5
            wrongGuess: () => this.playTone(220, 0.2, 'sawtooth'), // A3
            win: () => this.playMelody([523.25, 659.25, 783.99], [0.1, 0.1, 0.2]), // C5, E5, G5
            lose: () => this.playMelody([392, 349.23, 329.63, 293.66], [0.2, 0.2, 0.2, 0.3]), // G4, F4, E4, D4
            pageTransition: () => this.playTone(440, 0.05, 'triangle'), // A4
            buttonClick: () => this.playTone(600, 0.05, 'square'), // D5
            toggle: () => this.playTone(880, 0.05, 'sine'), // A5
            hint: () => this.playTone(330, 0.15, 'triangle'), // E4
            timerWarning: () => this.playTone(440, 0.1, 'square'), // A4
            countdown: () => this.playTone(880, 0.05, 'sine'), // A5
            achievement: () => this.playMelody([523.25, 659.25, 783.99, 1046.50], [0.1, 0.1, 0.1, 0.2]), // C5, E5, G5, C6
            chatMessage: () => this.playTone(800, 0.05, 'sine'), // G5
            playerJoined: () => this.playMelody([523.25, 659.25], [0.1, 0.1]), // C5, E5
            playerLeft: () => this.playMelody([659.25, 523.25], [0.1, 0.1]), // E5, C5
            roomReady: () => this.playTone(783.99, 0.2, 'sine') // G5
        };
    }

    playTone(frequency, duration, type = 'sine') {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing tone:', error);
        }
    }

    playMelody(frequencies, durations) {
        if (!this.enabled || !this.initialized) return;

        let startTime = this.audioContext.currentTime;

        frequencies.forEach((frequency, index) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);

            gainNode.gain.setValueAtTime(this.volume * 0.3, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + durations[index]);

            oscillator.start(startTime);
            oscillator.stop(startTime + durations[index]);

            startTime += durations[index];
        });
    }

    playSound(soundName) {
        if (!this.enabled || !this.initialized) return;

        const sound = this.sounds[soundName];
        if (sound && typeof sound === 'function') {
            sound();
        } else {
            console.warn(`Sound '${soundName}' not found`);
        }
    }

    setEnabled(enabled) {
        this.enabled = enabled;
        
        // Save preference to localStorage
        localStorage.setItem('hangman_soundEnabled', enabled.toString());
    }

    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        // Save preference to localStorage
        localStorage.setItem('hangman_soundVolume', this.volume.toString());
    }

    getEnabled() {
        return this.enabled;
    }

    getVolume() {
        return this.volume;
    }

    loadSettings() {
        // Load sound preference from localStorage
        const soundEnabled = localStorage.getItem('hangman_soundEnabled');
        if (soundEnabled !== null) {
            this.enabled = soundEnabled === 'true';
        }

        // Load volume preference from localStorage
        const soundVolume = localStorage.getItem('hangman_soundVolume');
        if (soundVolume !== null) {
            this.volume = parseFloat(soundVolume);
        }
    }

    // Alternative implementation using audio files
    loadAudioFiles() {
        // This would be used if we had actual audio files
        this.audioFiles = {
            correctGuess: new Audio('/assets/sounds/correct.mp3'),
            wrongGuess: new Audio('/assets/sounds/wrong.mp3'),
            win: new Audio('/assets/sounds/win.mp3'),
            lose: new Audio('/assets/sounds/lose.mp3'),
            buttonClick: new Audio('/assets/sounds/click.mp3')
        };

        // Set volume for all audio files
        Object.values(this.audioFiles).forEach(audio => {
            audio.volume = this.volume;
        });
    }

    playAudioFile(soundName) {
        if (!this.enabled) return;

        const audio = this.audioFiles[soundName];
        if (audio) {
            audio.currentTime = 0;
            audio.play().catch(error => {
                console.warn('Error playing audio file:', error);
            });
        }
    }

    // Create a simple sound effect with more complex parameters
    createComplexSound(type, frequency, duration, modulation = null) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            // Add modulation if specified
            if (modulation) {
                const lfo = this.audioContext.createOscillator();
                const lfoGain = this.audioContext.createGain();
                
                lfo.frequency.setValueAtTime(modulation.frequency, this.audioContext.currentTime);
                lfoGain.gain.setValueAtTime(modulation.amount, this.audioContext.currentTime);
                
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                
                lfo.start(this.audioContext.currentTime);
                lfo.stop(this.audioContext.currentTime + duration);
            }

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

            // Apply envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error creating complex sound:', error);
        }
    }

    // Create a whoosh sound for transitions
    playWhoosh(duration = 0.3) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const filter = this.audioContext.createBiquadFilter();

            oscillator.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, this.audioContext.currentTime);
            filter.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);

            gainNode.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (error) {
            console.warn('Error playing whoosh sound:', error);
        }
    }

    // Create a pop sound for UI interactions
    playPop(pitch = 1) {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800 * pitch, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400 * pitch, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);
        } catch (error) {
            console.warn('Error playing pop sound:', error);
        }
    }

    // Create a click sound
    playClick() {
        this.playPop(1.2);
    }

    // Create a notification sound
    playNotification() {
        if (!this.enabled || !this.initialized) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        } catch (error) {
            console.warn('Error playing notification sound:', error);
        }
    }
}

export default SoundController;