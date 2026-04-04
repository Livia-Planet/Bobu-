// src/SoundEngine.ts

const NOTES: Record<string, number> = {
  'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
  'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
  'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77
};

export const MelodySequencer = {
  melodies: [
    // Twinkle Twinkle
    ['C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4', 'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'G4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'C4', 'C4', 'G4', 'G4', 'A4', 'A4', 'G4', 'F4', 'F4', 'E4', 'E4', 'D4', 'D4', 'C4'],
    // Ode to Joy
    ['E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'E4', 'D4', 'D4', 'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4', 'D4', 'D4', 'E4', 'C4', 'D4', 'E4', 'F4', 'E4', 'C4', 'D4', 'E4', 'F4', 'E4', 'D4', 'C4', 'D4', 'G3', 'E4', 'E4', 'F4', 'G4', 'G4', 'F4', 'E4', 'D4', 'C4', 'C4', 'D4', 'E4', 'D4', 'C4', 'C4'],
    // Happy Birthday
    ['C4', 'C4', 'D4', 'C4', 'F4', 'E4', 'C4', 'C4', 'D4', 'C4', 'G4', 'F4', 'C4', 'C4', 'C5', 'A4', 'F4', 'E4', 'D4', 'Bb4', 'Bb4', 'A4', 'F4', 'G4', 'F4'],
    // Two Tigers
    ['C4', 'D4', 'E4', 'C4', 'C4', 'D4', 'E4', 'C4', 'E4', 'F4', 'G4', 'E4', 'F4', 'G4', 'G4', 'A4', 'G4', 'F4', 'E4', 'C4', 'G4', 'A4', 'G4', 'F4', 'E4', 'C4', 'C4', 'G3', 'C4', 'C4', 'G3', 'C4'],
    // Jingle Bells
    ['E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4', 'F4', 'F4', 'F4', 'F4', 'F4', 'E4', 'E4', 'E4', 'E4', 'D4', 'D4', 'E4', 'D4', 'G4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'E4', 'G4', 'C4', 'D4', 'E4', 'F4', 'F4', 'F4', 'F4', 'F4', 'E4', 'E4', 'E4', 'G4', 'G4', 'F4', 'D4', 'C4'],
    // London Bridge
    ['G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4', 'D4', 'E4', 'F4', 'E4', 'F4', 'G4', 'G4', 'A4', 'G4', 'F4', 'E4', 'F4', 'G4', 'D4', 'G4', 'E4', 'C4']
  ].map(m => m.map(n => NOTES[n])),
  
  getNote: (melodyIndex: number, noteIndex: number) => {
    const melody = MelodySequencer.melodies[melodyIndex % MelodySequencer.melodies.length];
    return melody[noteIndex % melody.length];
  },

  getMelodyLength: (melodyIndex: number) => {
    return MelodySequencer.melodies[melodyIndex % MelodySequencer.melodies.length].length;
  },

  getMelodyCount: () => {
    return MelodySequencer.melodies.length;
  }
};

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private currentInstrument: 'celesta' | 'bouncy' | 'marimba' | 'toyPiano' = 'celesta';
  private masterCompressor: DynamicsCompressorNode | null = null;

  constructor() {
    const savedInst = localStorage.getItem('bobu_instrument');
    if (savedInst && ['celesta', 'bouncy', 'marimba', 'toyPiano'].includes(savedInst)) {
      this.currentInstrument = savedInst as any;
    }
  }

  public init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup master compressor to prevent clipping
      this.masterCompressor = this.ctx.createDynamicsCompressor();
      this.masterCompressor.threshold.setValueAtTime(-24, this.ctx.currentTime);
      this.masterCompressor.knee.setValueAtTime(30, this.ctx.currentTime);
      this.masterCompressor.ratio.setValueAtTime(12, this.ctx.currentTime);
      this.masterCompressor.attack.setValueAtTime(0.003, this.ctx.currentTime);
      this.masterCompressor.release.setValueAtTime(0.25, this.ctx.currentTime);
      
      this.masterCompressor.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private getDestination() {
    return this.masterCompressor || this.ctx!.destination;
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  public setInstrument(inst: string) {
    this.currentInstrument = inst as any;
    localStorage.setItem('bobu_instrument', inst);
  }

  public getInstrument() {
    return this.currentInstrument;
  }

  public playCoinInsert() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1500, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.15);
  }

  public playGearTurn() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    
    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(dest);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  private bgmOscillators: OscillatorNode[] = [];
  private bgmGains: GainNode[] = [];
  private bgmInterval: number | null = null;

  public playMergeSound(melodyIndex: number, noteIndex: number, soundKitId?: string) {
    if (this.isMuted || !this.ctx) return;
    const freq = MelodySequencer.getNote(melodyIndex, noteIndex);
    const dest = this.getDestination();
    
    const kitToUse = soundKitId || this.currentInstrument;

    if (kitToUse === 'sound-8bit') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } else if (kitToUse === 'sound-zen') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 2.5); // Very long decay
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 2.5);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } else if (kitToUse === 'bouncy') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, this.ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } else if (kitToUse === 'marimba') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    } else if (kitToUse === 'toyPiano') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
      
      // Add a simple lowpass filter for toy piano sound
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, this.ctx.currentTime);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(dest);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.4);
      osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
    } else {
      // Default (sound-piano / celesta)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc1.type = 'sine';
      osc2.type = 'sine';
      
      osc1.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc2.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);
      
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 1.5);
      
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(dest);
      
      osc1.start();
      osc2.start();
      osc1.stop(this.ctx.currentTime + 1.5);
      osc2.stop(this.ctx.currentTime + 1.5);
      osc1.onended = () => { osc1.disconnect(); gain.disconnect(); };
      osc2.onended = () => { osc2.disconnect(); };
    }
  }

  public playBGM(trackIds: string[]) {
    this.stopBGM();
    if (this.isMuted || !this.ctx || trackIds.length === 0) return;

    // Play the first track in the list for now
    const trackId = trackIds[0];

    const trackMap: Record<string, number> = {
      'music-twinkle': 0,
      'music-ode-to-joy': 1,
      'music-happy-birthday': 2,
      'music-two-tigers': 3,
      'music-jingle-bells': 4,
      'music-london-bridge': 5
    };

    const melodyIndex = trackMap[trackId];
    if (melodyIndex !== undefined) {
      const melody = MelodySequencer.melodies[melodyIndex];
      let noteIndex = 0;
      const bpm = 120;
      const beatDuration = 60 / bpm;

      const playNextNote = () => {
        if (!this.ctx || this.isMuted) return;
        
        const freq = melody[noteIndex % melody.length];
        const duration = beatDuration; // Simplified duration for BGM preview

        if (freq) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
          
          gain.gain.setValueAtTime(0, this.ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration - 0.05);
          
          osc.connect(gain);
          gain.connect(this.getDestination());
          
          osc.start();
          osc.stop(this.ctx.currentTime + duration);
          
          this.bgmOscillators.push(osc);
          this.bgmGains.push(gain);

          osc.onended = () => {
            osc.disconnect();
            gain.disconnect();
            this.bgmOscillators = this.bgmOscillators.filter(o => o !== osc);
            this.bgmGains = this.bgmGains.filter(g => g !== gain);
          };
        }

        noteIndex++;
        this.bgmInterval = window.setTimeout(playNextNote, duration * 1000);
      };

      playNextNote();
    }
  }

  public stopBGM() {
    if (this.bgmInterval) {
      clearTimeout(this.bgmInterval);
      this.bgmInterval = null;
    }
    this.bgmOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.bgmGains.forEach(gain => {
      try { gain.disconnect(); } catch (e) {}
    });
    this.bgmOscillators = [];
    this.bgmGains = [];
  }

  public playPop(level: number = 1) {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    
    // Base frequency increases with level
    const baseFreq = 300 + (level * 50);
    
    osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq / 4, this.ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.getDestination());
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); };
  }

  public playBling() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.2);
    
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    
    const delay = this.ctx.createDelay();
    delay.delayTime.value = 0.1;
    const delayGain = this.ctx.createGain();
    delayGain.gain.value = 0.3;
    
    osc.connect(gain);
    gain.connect(this.getDestination());
    
    gain.connect(delay);
    delay.connect(delayGain);
    delayGain.connect(this.getDestination());
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.3);
    osc.onended = () => { osc.disconnect(); gain.disconnect(); delay.disconnect(); delayGain.disconnect(); };
  }

  public playError() {
    if (this.isMuted || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.2);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.getDestination());
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
    osc.onended = () => { osc.disconnect(); filter.disconnect(); gain.disconnect(); };
  }

  public playHeal() {
    if (this.isMuted || !this.ctx) return;
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      const startTime = this.ctx!.currentTime + i * 0.1;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.connect(gain);
      gain.connect(this.getDestination());
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
      osc.onended = () => { osc.disconnect(); gain.disconnect(); };
    });
  }

  public playArpeggio(comboCount: number, baseLevel: number) {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    
    // Scale up the base frequency based on comboCount
    const baseFreq = 440 * Math.pow(1.059463, comboCount * 2 + baseLevel); 
    
    // Play 3 fast notes
    const notes = [baseFreq, baseFreq * 1.25, baseFreq * 1.5]; // Major triad approximation
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      
      const startTime = this.ctx!.currentTime + i * 0.05; // very fast
      
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.1);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start(startTime);
      osc.stop(startTime + 0.1);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
  public playChomp() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'square';
    osc.frequency.setValueAtTime(100, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.2);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.8, this.ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);

    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  public playBurp() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.4);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.4);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playClick() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.05);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playGachaReveal() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    
    const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      
      const startTime = this.ctx!.currentTime + i * 0.1;
      
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start(startTime);
      osc.stop(startTime + 0.5);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }

  public playCarrotGet() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.4, this.ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(dest);

    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);

    osc.onended = () => {
      osc.disconnect();
      gain.disconnect();
    };
  }

  public playCoinGet() {
    if (this.isMuted || !this.ctx) return;
    const dest = this.getDestination();
    
    const notes = [1200, 1600]; // High pitched ting
    
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      
      const startTime = this.ctx!.currentTime + i * 0.05;
      
      osc.frequency.setValueAtTime(freq, startTime);
      
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
      
      osc.connect(gain);
      gain.connect(dest);
      
      osc.start(startTime);
      osc.stop(startTime + 0.3);
      
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    });
  }
}

export const soundEngine = new SoundEngine();
