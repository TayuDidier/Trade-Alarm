// Persistent Trading Alarm Sound Engine
// Uses Web Audio API for 100% self-contained synthesized emergency alarms
// Routes through high-gain audio with looping, speech synthesis, and phone vibration

export const ALARM_SOUND_PROFILES = [
  { id: 'siren', name: 'Air Raid Siren', category: 'emergency', desc: 'Continuous pitch sweep (Maximum Wake-Up)' },
  { id: 'digital', name: 'Digital Alarm', category: 'classic', desc: 'Aggressive twin-tone burst beeps' },
  { id: 'klaxon', name: 'Industrial Klaxon', category: 'industrial', desc: 'Harsh alternating dual-tone foghorn' },
  { id: 'meltdown', name: 'Nuclear Meltdown', category: 'emergency', desc: 'Urgent 3-frequency pulsating radiation siren' },
  { id: 'eas', name: 'Emergency EAS', category: 'emergency', desc: 'National warning system jarring dual-tones' },
  { id: 'bell', name: 'Wall Street Bell', category: 'trading', desc: 'Resonant NYSE opening bell gong' },
  { id: 'laser', name: 'Sci-Fi Pulse Laser', category: 'tactical', desc: 'Rapid hyper-speed descending laser sweeps' },
  { id: 'bugle', name: 'Reveille Bugle', category: 'tactical', desc: 'Brass arpeggio wake-up charge fanfare' },
  { id: 'sonar', name: 'Sonar Ping', category: 'gentle', desc: 'Resonant underwater ping with deep decay' },
  { id: 'chime', name: 'Zen Chime', category: 'gentle', desc: 'Harmonic melodic bell loop for calm setups' },
];

class AudioAlarmEngine {
  constructor() {
    this.audioCtx = null;
    this.isPlaying = false;
    this.currentSoundType = null;
    this.intervalId = null;
    this.speechIntervalId = null;
    this.vibrateIntervalId = null;
    this.wakeLock = null;
    this.masterVolume = 0.95;
    this.gainNode = null;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
        this.gainNode = this.audioCtx.createGain();
        this.gainNode.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
        this.gainNode.connect(this.audioCtx.destination);
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.masterVolume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.audioCtx) {
      this.gainNode.gain.setValueAtTime(this.masterVolume, this.audioCtx.currentTime);
    }
  }

  async requestWakeLock() {
    try {
      if ('wakeLock' in navigator) {
        this.wakeLock = await navigator.wakeLock.request('screen');
      }
    } catch (e) {
      console.warn('Wake Lock error:', e);
    }
  }

  releaseWakeLock() {
    if (this.wakeLock) {
      this.wakeLock.release().catch(() => {});
      this.wakeLock = null;
    }
  }

  startVibration() {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([500, 200, 500, 200, 800]);
        this.vibrateIntervalId = setInterval(() => {
          navigator.vibrate([500, 200, 500, 200, 800]);
        }, 2500);
      } catch {}
    }
  }

  stopVibration() {
    if (this.vibrateIntervalId) {
      clearInterval(this.vibrateIntervalId);
      this.vibrateIntervalId = null;
    }
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(0);
      } catch {}
    }
  }

  // 1. Air Raid Siren
  playAirRaidSiren() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const oscGain = this.audioCtx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + 1.2);
      osc.frequency.exponentialRampToValueAtTime(420, now + 2.4);

      oscGain.gain.setValueAtTime(0.05, now);
      oscGain.gain.linearRampToValueAtTime(0.85, now + 0.3);
      oscGain.gain.setValueAtTime(0.85, now + 2.1);
      oscGain.gain.linearRampToValueAtTime(0.05, now + 2.4);

      const subOsc = this.audioCtx.createOscillator();
      const subGain = this.audioCtx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(110, now);
      subGain.gain.setValueAtTime(0.3, now);
      subGain.gain.linearRampToValueAtTime(0.01, now + 2.4);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      subOsc.connect(subGain);
      subGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 2.4);
      subOsc.start(now);
      subOsc.stop(now + 2.4);
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 2450);
  }

  // 2. Digital Twin-Beep Alarm Clock
  playDigitalAlarm() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const beeps = [0, 0.22, 0.44, 0.66];
      beeps.forEach((offset) => {
        const osc1 = this.audioCtx.createOscillator();
        const osc2 = this.audioCtx.createOscillator();
        const bGain = this.audioCtx.createGain();

        osc1.type = 'square';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(1046, now + offset);
        osc2.frequency.setValueAtTime(2093, now + offset);

        bGain.gain.setValueAtTime(0.7, now + offset);
        bGain.gain.setValueAtTime(0, now + offset + 0.12);

        osc1.connect(bGain);
        osc2.connect(bGain);
        bGain.connect(this.gainNode);

        osc1.start(now + offset);
        osc1.stop(now + offset + 0.13);
        osc2.start(now + offset);
        osc2.stop(now + offset + 0.13);
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 1100);
  }

  // 3. Industrial Klaxon
  playKlaxonAlarm() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const kGain = this.audioCtx.createGain();
      osc.type = 'sawtooth';

      osc.frequency.setValueAtTime(560, now);
      osc.frequency.setValueAtTime(760, now + 0.35);

      kGain.gain.setValueAtTime(0.85, now);
      kGain.gain.setValueAtTime(0.85, now + 0.7);
      kGain.gain.linearRampToValueAtTime(0.01, now + 0.75);

      osc.connect(kGain);
      kGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.75);
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 950);
  }

  // 4. Nuclear Meltdown Alert (Rapid 3-tone urgency)
  playMeltdownAlarm() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const freqs = [660, 880, 1175];
      freqs.forEach((freq, idx) => {
        const offset = idx * 0.18;
        const osc = this.audioCtx.createOscillator();
        const mGain = this.audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now + offset);

        mGain.gain.setValueAtTime(0.65, now + offset);
        mGain.gain.setValueAtTime(0.02, now + offset + 0.15);

        osc.connect(mGain);
        mGain.connect(this.gainNode);

        osc.start(now + offset);
        osc.stop(now + offset + 0.16);
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 750);
  }

  // 5. Emergency Broadcast System (EAS) Dual-Tone
  playEasTone() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Authentic 853 Hz + 960 Hz dual-frequency warning tone
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const eGain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(853, now);
      osc2.frequency.setValueAtTime(960, now);

      eGain.gain.setValueAtTime(0.6, now);
      eGain.gain.setValueAtTime(0.6, now + 0.9);
      eGain.gain.linearRampToValueAtTime(0.01, now + 0.95);

      osc1.connect(eGain);
      osc2.connect(eGain);
      eGain.connect(this.gainNode);

      osc1.start(now);
      osc1.stop(now + 0.95);
      osc2.start(now);
      osc2.stop(now + 0.95);
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 1200);
  }

  // 6. Wall Street Trading Floor Bell
  playTradingBell() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // Bell harmonics
      const freqs = [587.33, 880, 1174.66, 1760];
      freqs.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const bGain = this.audioCtx.createGain();
        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now);

        const initialGain = 0.7 / (idx + 1);
        bGain.gain.setValueAtTime(initialGain, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc.connect(bGain);
        bGain.connect(this.gainNode);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 2000);
  }

  // 7. Sci-Fi Pulse Laser
  playLaserAlarm() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      [0, 0.25].forEach((offset) => {
        const osc = this.audioCtx.createOscillator();
        const lGain = this.audioCtx.createGain();
        osc.type = 'sawtooth';

        osc.frequency.setValueAtTime(1600, now + offset);
        osc.frequency.exponentialRampToValueAtTime(250, now + offset + 0.2);

        lGain.gain.setValueAtTime(0.7, now + offset);
        lGain.gain.linearRampToValueAtTime(0.01, now + offset + 0.2);

        osc.connect(lGain);
        lGain.connect(this.gainNode);

        osc.start(now + offset);
        osc.stop(now + offset + 0.2);
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 650);
  }

  // 8. Military Reveille Bugle
  playBugleCall() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      // C-E-G-C ascending brass fanfare
      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.50, d: 0.35 } // C6
      ];

      let t = 0;
      notes.forEach((n) => {
        const osc = this.audioCtx.createOscillator();
        const bgGain = this.audioCtx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(n.f, now + t);

        bgGain.gain.setValueAtTime(0.65, now + t);
        bgGain.gain.exponentialRampToValueAtTime(0.01, now + t + n.d);

        osc.connect(bgGain);
        bgGain.connect(this.gainNode);

        osc.start(now + t);
        osc.stop(now + t + n.d);
        t += n.d + 0.05;
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 1400);
  }

  // 9. Submarine Sonar Ping
  playSonarPing() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const osc = this.audioCtx.createOscillator();
      const sGain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.8);

      sGain.gain.setValueAtTime(0.85, now);
      sGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(sGain);
      sGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 1.2);
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 1600);
  }

  // 10. Ascending Zen Chime
  playZenChime() {
    const playCycle = () => {
      if (!this.isPlaying || !this.audioCtx) return;
      const now = this.audioCtx.currentTime;

      const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
      notes.forEach((freq, idx) => {
        const offset = idx * 0.14;
        const osc = this.audioCtx.createOscillator();
        const cGain = this.audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + offset);

        cGain.gain.setValueAtTime(0.5, now + offset);
        cGain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.9);

        osc.connect(cGain);
        cGain.connect(this.gainNode);

        osc.start(now + offset);
        osc.stop(now + offset + 0.9);
      });
    };

    playCycle();
    this.intervalId = setInterval(playCycle, 1800);
  }

  speakAlert(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.1;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }

  startAlarm({ soundType = 'siren', ttsText = null }) {
    this.init();
    this.stopAlarm();

    this.isPlaying = true;
    this.currentSoundType = soundType;

    this.requestWakeLock();
    this.startVibration();

    switch (soundType) {
      case 'digital':
        this.playDigitalAlarm();
        break;
      case 'klaxon':
        this.playKlaxonAlarm();
        break;
      case 'meltdown':
        this.playMeltdownAlarm();
        break;
      case 'eas':
        this.playEasTone();
        break;
      case 'bell':
        this.playTradingBell();
        break;
      case 'laser':
        this.playLaserAlarm();
        break;
      case 'bugle':
        this.playBugleCall();
        break;
      case 'sonar':
        this.playSonarPing();
        break;
      case 'chime':
        this.playZenChime();
        break;
      case 'siren':
      default:
        this.playAirRaidSiren();
        break;
    }

    if (ttsText) {
      setTimeout(() => {
        if (this.isPlaying) this.speakAlert(ttsText);
      }, 1200);

      this.speechIntervalId = setInterval(() => {
        if (this.isPlaying) this.speakAlert(ttsText);
      }, 8500);
    }
  }

  previewSound(soundType) {
    this.startAlarm({ soundType });
    setTimeout(() => {
      this.stopAlarm();
    }, 3200);
  }

  stopAlarm() {
    this.isPlaying = false;
    this.currentSoundType = null;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.speechIntervalId) {
      clearInterval(this.speechIntervalId);
      this.speechIntervalId = null;
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    this.stopVibration();
    this.releaseWakeLock();
  }
}

export const audioEngine = new AudioAlarmEngine();
