/**
 * Vizion Speech Synthesis (TTS) Engine
 * Synthesizes recognized sign language / gestures into clear spoken audio for hearing interlocutors.
 */

export class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
    this.volume = 1.0;
    this.rate = 1.0;
    this.pitch = 1.0;

    if (this.synth) {
      this.initVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.initVoices();
      }
    }
  }

  initVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Default to natural English voice if available
    this.selectedVoice = this.voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) 
      || this.voices.find(v => v.lang.startsWith('en')) 
      || this.voices[0];
  }

  setLanguage(langCode) {
    if (!this.voices.length) this.initVoices();
    const voice = this.voices.find(v => v.lang.startsWith(langCode.substring(0, 2)));
    if (voice) {
      this.selectedVoice = voice;
    }
  }

  speak(text, onStart, onEnd) {
    if (!this.synth) {
      console.warn('SpeechSynthesis is not supported in this browser environment.');
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.volume = this.volume;
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = () => {
      if (onEnd) onEnd();
    };

    utterance.onerror = (err) => {
      console.error('TTS error:', err);
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
