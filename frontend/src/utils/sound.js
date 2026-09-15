/**
 * Procedural Web Audio API Sound Synthesizer
 * Generates all game sound effects programmatically with zero external asset dependencies.
 */

class SoundSynthesizer {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  /**
   * Lazy initializes Web Audio Context on user interaction.
   */
  initContext() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  /**
   * Toggles sound audio output.
   * @param {boolean} muted
   */
  setMuted(muted) {
    this.muted = muted;
  }

  /**
   * Move sound effect (Crisp chime for X, Warm tone for O)
   * @param {string} symbol - 'X' or 'O'
   */
  playMoveSound(symbol = 'X') {
    if (this.muted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = symbol === 'X' ? 'sine' : 'triangle';
    const freq = symbol === 'X' ? 587.33 : 440; // D5 vs A4

    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.2, this.audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.12);
  }

  /**
   * Victory sound effect (Ascending 4-note arpeggio)
   */
  playWinSound() {
    if (this.muted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, index) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + index * 0.09);

      gain.gain.setValueAtTime(0, this.audioCtx.currentTime + index * 0.09);
      gain.gain.linearRampToValueAtTime(0.2, this.audioCtx.currentTime + index * 0.09 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + index * 0.09 + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + index * 0.09);
      osc.stop(this.audioCtx.currentTime + index * 0.09 + 0.25);
    });
  }

  /**
   * Draw sound effect (Neutral resolving triad)
   */
  playDrawSound() {
    if (this.muted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const notes = [440, 415.30, 392]; // A4 -> G#4 -> G4
    notes.forEach((freq, index) => {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + index * 0.12);

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + index * 0.12 + 0.2);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(this.audioCtx.currentTime + index * 0.12);
      osc.stop(this.audioCtx.currentTime + index * 0.12 + 0.2);
    });
  }

  /**
   * Subtle UI click sound
   */
  playClickSound() {
    if (this.muted) return;
    this.initContext();
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    osc.start();
    osc.stop(this.audioCtx.currentTime + 0.04);
  }
}

export const soundManager = new SoundSynthesizer();
