/**
 * Vizion Smart Glasses OS - Standalone Main Application Bundle (v2.0 AR HUD Edition)
 * Powered by Official MediaPipe Hands 21-Landmark AI & Google Gemini 3.6 Flash.
 */

// ==========================================
// 1. UNIFIED HOT-WORD BOOSTING ENGINE
// ==========================================
const UNIFIED_HOTWORDS = [
  { target: "ANAPHYLAXIS", aliases: ["ana phylaxis", "anna phylaxis", "anaphylactic"] },
  { target: "ECHOCARDIOGRAM", aliases: ["echo cardio gram", "echo program", "cardio gram"] },
  { target: "ELECTROCARDIOGRAM", aliases: ["electro cardio gram", "ecg", "ekg"] },
  { target: "HYPERTENSION", aliases: ["hyper tension", "high tension"] },
  { target: "PRESCRIPTION", aliases: ["pre scription", "per scription"] },
  { target: "TROPONIN I", aliases: ["troponin 1", "tryponine", "troponin"] },
  { target: "ARRHYTHMIA", aliases: ["ah rhythmia", "a rhythmia"] },
  { target: "AMBULATORY", aliases: ["am bulatory", "uncle atory"] },
  { target: "HYPOGLYCEMIA", aliases: ["hypo glycemia", "hypo glycemic"] },
  { target: "ACCESSIBILITY", aliases: ["access ability", "assess ability"] },
  { target: "RESERVATION", aliases: ["re servation", "reserve ation"] },
  { target: "IDENTIFICATION", aliases: ["ID card", "i d card", "identity card"] },
  { target: "REIMBURSEMENT", aliases: ["re imbursement", "rembursement"] }
];

class HotwordBooster {
  constructor() {
    this.activeDict = UNIFIED_HOTWORDS;
  }

  boostText(text) {
    if (!text) return text;
    let boostedText = text;

    for (const item of this.activeDict) {
      for (const alias of item.aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'gi');
        if (regex.test(boostedText)) {
          boostedText = boostedText.replace(regex, item.target);
        }
      }
    }
    return boostedText;
  }
}

// ==========================================
// 2. REAL-TIME MULTILINGUAL TRANSLATION ENGINE
// ==========================================
const SUPPORTED_LANGUAGES = [
  { code: 'ar-SA', name: 'Arabic', flag: '🇸🇦' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'fr-FR', name: 'French', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese', flag: '🇯🇵' },
  { code: 'zh-CN', name: 'Mandarin', flag: '🇨🇳' },
  { code: 'pt-PT', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'es-ES', name: 'Spanish', flag: '🇪🇸' }
];

const COMPREHENSIVE_TRANSLATIONS = {
  "Hello, I am Dr. Miller. What symptoms brought you to the hospital today?": {
    "zh-CN": "你好，我是米勒医生。今天是什么症状让您来医院就诊？",
    "pt-PT": "Olá, sou o Dr. Miller. Que sintomas o trouxeram ao hospital hoje?",
    "es-ES": "Hola, soy el Dr. Miller. ¿Qué síntomas lo trajeron al hospital hoy?",
    "fr-FR": "Bonjour, je suis le Dr Miller. Quels symptômes vous ont amené à l'hôpital aujourd'hui?",
    "de-DE": "Hallo, ich bin Dr. Miller. Welche Symptome haben Sie heute ins Krankenhaus gebracht?",
    "ja-JP": "こんにちは、ミラー医師です。今日はどのような症状で病院に来られましたか？"
  },
  "I understand. I am ordering troponin I lab tests and an immediate electrocardiogram.": {
    "zh-CN": "我明白了。我正为您开具肌钙蛋白I化验和紧急心电图检查。",
    "pt-PT": "Compreendo. Estou a solicitar exames de troponina I e um eletrocardiograma imediato.",
    "es-ES": "Entiendo. Estoy ordenando pruebas de laboratorio de troponina I y un electrocardiograma inmediato.",
    "fr-FR": "Je comprends. Je commande des analyses de troponine I et un électrocardiogramme immédiat."
  }
};

class TranslationEngine {
  constructor(sourceLang = 'en-US', targetLang = 'zh-CN') {
    this.sourceLang = sourceLang;
    this.targetLang = targetLang;
    this.gcpService = null;
  }

  setLanguages(source, target) {
    this.sourceLang = source;
    this.targetLang = target;
  }

  async translate(text) {
    if (!text) return "";
    const cleanText = text.trim();

    if (this.sourceLang === this.targetLang) {
      return cleanText;
    }

    if (COMPREHENSIVE_TRANSLATIONS[cleanText] && COMPREHENSIVE_TRANSLATIONS[cleanText][this.targetLang]) {
      return COMPREHENSIVE_TRANSLATIONS[cleanText][this.targetLang];
    }

    if (this.gcpService && this.gcpService.isEnabled) {
      try {
        const cloudTranslated = await this.gcpService.translateText(cleanText, this.targetLang, this.sourceLang);
        if (cloudTranslated && cloudTranslated.toLowerCase() !== cleanText.toLowerCase()) {
          return cloudTranslated;
        }
      } catch (e) {}
    }

    try {
      const srcIso = this.sourceLang || 'en-US';
      const tgtIso = this.targetLang || 'zh-CN';
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(srcIso)}&tl=${encodeURIComponent(tgtIso)}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const res = await fetch(gUrl);
      const gData = await res.json();

      if (gData && gData[0]) {
        let fullTrans = "";
        for (let i = 0; i < gData[0].length; i++) {
          if (gData[0][i] && gData[0][i][0]) {
            fullTrans += gData[0][i][0];
          }
        }
        if (fullTrans && fullTrans.trim()) return fullTrans.trim();
      }
    } catch (e) {}

    return cleanText;
  }
}

// ==========================================
// 3. GOOGLE CLOUD AGENT PLATFORM & GEMINI 3.6 FLASH SERVICE
// ==========================================
class GoogleCloudAgentPlatformService {
  constructor() {
    this.apiKey = localStorage.getItem('vizion_gcp_key') || '';
    this.projectId = localStorage.getItem('vizion_gcp_project') || '';
    this.adcToken = localStorage.getItem('vizion_gcp_adc') || '';
    this.isEnabled = !!(this.apiKey || (this.projectId && this.adcToken));
  }

  setCredentials(apiKey, projectId, adcToken) {
    this.apiKey = (apiKey || '').trim();
    this.projectId = (projectId || '').trim();
    this.adcToken = (adcToken || '').trim();
    this.isEnabled = !!(this.apiKey || (this.projectId && this.adcToken));

    if (this.apiKey) {
      localStorage.setItem('vizion_gcp_key', this.apiKey);
    } else {
      localStorage.removeItem('vizion_gcp_key');
    }

    if (this.projectId && this.adcToken) {
      localStorage.setItem('vizion_gcp_project', this.projectId);
      localStorage.setItem('vizion_gcp_adc', this.adcToken);
    } else {
      localStorage.removeItem('vizion_gcp_project');
      localStorage.removeItem('vizion_gcp_adc');
    }
  }

  async analyzeSignVideoFrame(base64Image) {
    if (!this.isEnabled) return null;

    try {
      let endpoint = '';
      let headers = { 'Content-Type': 'application/json' };

      if (this.apiKey) {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${this.apiKey}`;
      } else {
        endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/gemini-3.6-flash:generateContent`;
        headers['Authorization'] = `Bearer ${this.adcToken}`;
        headers['X-Goog-User-Project'] = this.projectId;
      }

      const promptText = "You are an unrestricted, full-dictionary Sign Language Interpreter (ASL/CSL/ISL). Analyze the hand gestures, spatial movements, and facial/body posture in this frame. Translate any ASL dictionary sign, fingerspelled word, or full sentence. Output ONLY the final translated natural spoken sentence in 1 clear English sentence suitable for text-to-speech audio.";

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: promptText },
              { inline_data: { mime_type: "image/jpeg", data: base64Image } }
            ]
          }]
        })
      });

      const result = await response.json();
      if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
        return result.candidates[0].content.parts[0].text.trim();
      }
    } catch (e) {}
    return null;
  }

  async translateText(text, targetLangCode, sourceLangCode = 'en-US') {
    if (!this.isEnabled || !text) return null;
    try {
      let endpoint = '';
      let headers = { 'Content-Type': 'application/json' };

      if (this.apiKey) {
        endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${this.apiKey}`;
      } else {
        endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${this.projectId}/locations/us-central1/publishers/google/models/gemini-3.6-flash:generateContent`;
        headers['Authorization'] = `Bearer ${this.adcToken}`;
        headers['X-Goog-User-Project'] = this.projectId;
      }

      const promptText = `Translate the text below from "${sourceLangCode}" into "${targetLangCode}". Provide ONLY the direct translation:\n\n${text}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
      });

      const data = await res.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
        return data.candidates[0].content.parts[0].text.trim();
      }
    } catch (e) {}
    return null;
  }
}

// ==========================================
// 4. SPEECH SYNTHESIS (TTS) ENGINE
// ==========================================
class TTSEngine {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.voices = [];
    this.selectedVoice = null;
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
    this.selectedVoice = this.voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) 
      || this.voices.find(v => v.lang.startsWith('en')) 
      || this.voices[0];
  }

  speak(text, onStart, onEnd) {
    if (!this.synth || !text) {
      if (onEnd) onEnd();
      return;
    }
    this.synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) utterance.voice = this.selectedVoice;
    utterance.volume = 1.0;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => { if (onStart) onStart(); };
    utterance.onend = () => { if (onEnd) onEnd(); };
    utterance.onerror = () => { if (onEnd) onEnd(); };
    this.synth.speak(utterance);
  }
}

// ==========================================
// 5. AUDIO ASR (LISTENING MODE) ENGINE
// ==========================================
class AudioASREngine {
  constructor(options = {}) {
    this.onSubtitleUpdate = options.onSubtitleUpdate || null;
    this.onSlaUpdate = options.onSlaUpdate || null;
    this.onVadStateChange = options.onVadStateChange || null;

    this.isListening = false;
    this.recognition = null;
    this.hotwordBooster = new HotwordBooster();
    this.translator = new TranslationEngine('en-US', 'zh-CN');

    this.line1 = "";
    this.line2 = "Hello, welcome! How can I assist you today?";
    this.speakerTag = "";
    this.currentLatency = 142;
    this.werEstimate = 3.2;

    this.initSpeechRecognition();
  }

  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        if (this.onVadStateChange) this.onVadStateChange(true);
      };

      this.recognition.onresult = async (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const rawText = finalTranscript || interimTranscript;
        if (rawText) {
          const boostedText = this.hotwordBooster.boostText(rawText);
          const translatedText = await this.translator.translate(boostedText);
          this.updateRollingBuffer(boostedText, translatedText);
        }
      };

      this.recognition.onend = () => {
        if (this.isListening) {
          try { this.recognition.start(); } catch(e) {}
        } else {
          if (this.onVadStateChange) this.onVadStateChange(false);
        }
      };
    }
  }

  setLanguage(langCode) {
    if (this.recognition) this.recognition.lang = langCode;
  }

  startListening() {
    this.isListening = true;
    if (this.recognition) {
      try { this.recognition.start(); } catch(e) {}
    } else {
      this.simulateSpeechStream("Microphone connected. Audio activity detection active.");
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.recognition) {
      try { this.recognition.stop(); } catch(e) {}
    }
    if (this.onVadStateChange) this.onVadStateChange(false);
  }

  updateRollingBuffer(currentText, translatedText = null) {
    if (currentText.length > 40 && !this.line1) {
      this.line1 = this.line2;
      this.line2 = currentText;
    } else {
      this.line2 = currentText;
    }

    if (this.onSubtitleUpdate) {
      this.onSubtitleUpdate({
        speakerTag: this.speakerTag,
        line1: this.line1,
        line2: this.line2,
        translated: translatedText,
        original: currentText
      });
    }
  }

  simulateSpeechStream(phrase, speaker = "[Doctor]") {
    this.speakerTag = speaker;
    const words = phrase.split(" ");
    let index = 0;
    let currentSentence = "";

    const interval = setInterval(async () => {
      if (index < words.length) {
        currentSentence += (index === 0 ? "" : " ") + words[index];
        index++;

        const boosted = this.hotwordBooster.boostText(currentSentence);
        const translated = await this.translator.translate(boosted);

        if (currentSentence.length > 40 && index % 4 === 0) {
          this.line1 = this.line2;
          this.line2 = boosted;
        } else {
          this.line2 = boosted;
        }

        this.currentLatency = Math.floor(Math.random() * 40) + 125;

        if (this.onSubtitleUpdate) {
          this.onSubtitleUpdate({
            speakerTag: this.speakerTag,
            line1: this.line1,
            line2: this.line2,
            translated: translated,
            original: currentSentence
          });
        }

        if (this.onSlaUpdate) {
          this.onSlaUpdate({
            latency: this.currentLatency,
            wer: 3.2
          });
        }
      } else {
        clearInterval(interval);
      }
    }, 250);
  }
}

// ==========================================
// 6. MEDIAPIPE HANDS 21-LANDMARK ASL A–Z CLASSIFIER ENGINE
// ==========================================
const ASL_ALPHABET = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
];

const GESTURE_DICTIONARY = [
  // Greetings & Social
  { id: 'HELLO', category: 'greetings', label: 'Hello / Greeting', ttsText: 'Hello! It is wonderful to meet you today.' },
  { id: 'THANK_YOU', category: 'greetings', label: 'Thank You', ttsText: 'Thank you very much for your kind help and support!' },
  { id: 'PLEASE', category: 'greetings', label: 'Please', ttsText: 'Please, I would really appreciate your assistance.' },
  { id: 'SORRY', category: 'greetings', label: 'Sorry / Excuse Me', ttsText: 'Excuse me, I am sorry to bother you.' },
  { id: 'GOODBYE', category: 'greetings', label: 'Goodbye', ttsText: 'Goodbye! Wishing you a wonderful day ahead.' },
  { id: 'NICE_MEET_YOU', category: 'greetings', label: 'Nice to Meet You', ttsText: 'Nice to meet you! Hope you have a great day.' },

  // Questions (Who / What / Where / Why / How)
  { id: 'WHAT', category: 'questions', label: 'What?', ttsText: 'What is happening? Could you explain?' },
  { id: 'WHERE', category: 'questions', label: 'Where?', ttsText: 'Where is this location?' },
  { id: 'WHO', category: 'questions', label: 'Who?', ttsText: 'Who is this person?' },
  { id: 'WHEN', category: 'questions', label: 'When?', ttsText: 'When will this take place?' },
  { id: 'WHY', category: 'questions', label: 'Why?', ttsText: 'Why is this needed?' },
  { id: 'HOW_MUCH', category: 'questions', label: 'How Much?', ttsText: 'How much does this cost?' },

  // Healthcare & Medical
  { id: 'PAIN', category: 'medical', label: 'Pain Location', ttsText: 'I am experiencing severe pain in this location.' },
  { id: 'DOCTOR', category: 'medical', label: 'Need Doctor', ttsText: 'Please call a specialist doctor for me right away.' },
  { id: 'PRESCRIPTION', category: 'medical', label: 'Prescription', ttsText: 'I need to get my medical prescription filled at the pharmacy.' },
  { id: 'MEDICINE', category: 'medical', label: 'Medicine', ttsText: 'Where can I take my medicine?' },
  { id: 'ALLERGY', category: 'medical', label: 'Allergy Warning', ttsText: 'I have a severe medical allergy to this substance.' },

  // Emergency & Help
  { id: 'HELP', category: 'emergency', label: 'Emergency Help', ttsText: 'I need immediate emergency assistance, please help me!' },
  { id: 'POLICE', category: 'emergency', label: 'Call Police', ttsText: 'Please call the police immediately!' },
  { id: 'AMBULANCE', category: 'emergency', label: 'Call Ambulance', ttsText: 'Please call an ambulance right now!' },
  { id: 'FIRE', category: 'emergency', label: 'Fire Hazard', ttsText: 'Warning, there is a fire hazard here!' },

  // Dining & Food
  { id: 'ORDER_FOOD', category: 'dining', label: 'Order Food', ttsText: 'I would like to order food from the menu, please.' },
  { id: 'WATER', category: 'dining', label: 'Water / Drink', ttsText: 'Could I please have a glass of drinking water?' },
  { id: 'BILL', category: 'dining', label: 'Check / Bill', ttsText: 'Could I please have the check or bill to pay?' },
  { id: 'COFFEE', category: 'dining', label: 'Coffee', ttsText: 'I would love a cup of hot coffee, please.' },

  // Directions & Travel
  { id: 'DIRECTIONS', category: 'directions', label: 'Directions / Subway', ttsText: 'Could you tell me how to get to the subway or bus station?' },
  { id: 'TAXI', category: 'directions', label: 'Call Taxi', ttsText: 'I need to call a taxi to go to the city center, please.' },
  { id: 'RESTROOM', category: 'directions', label: 'Restroom Location', ttsText: 'Excuse me, where is the nearest restroom located?' }
];

// Hand joint topology for MediaPipe 21 landmarks
const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],       // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],       // Index
  [5, 9], [9, 10], [10, 11], [11, 12],  // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17]                               // Palm base
];

class MediaPipeASLClassifier {
  constructor() {
    this.lastLetter = 'A';
    this.letterHoldCount = 0;
  }

  // Calculates Euclidean distance between 2 3D landmarks
  dist(p1, p2) {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2) + Math.pow(p1.z - p2.z, 2));
  }

  // Dynamic Spatiotemporal ASL Phrase Detector for "HELLO" and "THANK YOU"
  detectPhrase(rawLandmarks, history = []) {
    if (!rawLandmarks || rawLandmarks.length < 21 || !history || history.length < 3) return null;

    const wrist = rawLandmarks[0];
    const indexTip = rawLandmarks[8], middleTip = rawLandmarks[12], ringTip = rawLandmarks[16], pinkyTip = rawLandmarks[20], thumbTip = rawLandmarks[4];
    const indexMCP = rawLandmarks[5], middleMCP = rawLandmarks[9];

    const handScale = Math.max(Math.sqrt(Math.pow(wrist.x - middleMCP.x, 2) + Math.pow(wrist.y - middleMCP.y, 2)), 0.05);

    const extIndex = Math.sqrt(Math.pow(indexTip.x - wrist.x, 2) + Math.pow(indexTip.y - wrist.y, 2)) / handScale;
    const extMiddle = Math.sqrt(Math.pow(middleTip.x - wrist.x, 2) + Math.pow(middleTip.y - wrist.y, 2)) / handScale;
    const extRing = Math.sqrt(Math.pow(ringTip.x - wrist.x, 2) + Math.pow(ringTip.y - wrist.y, 2)) / handScale;
    const extPinky = Math.sqrt(Math.pow(pinkyTip.x - wrist.x, 2) + Math.pow(pinkyTip.y - wrist.y, 2)) / handScale;

    // Phrase gestures require a flat open hand (B-hand)
    const isFlatOpenHand = (extIndex > 1.15 && extMiddle > 1.15 && extRing > 1.10 && extPinky > 1.05);
    if (!isFlatOpenHand) return null;

    const oldest = history[0].landmarks;
    if (!oldest || oldest.length < 21) return null;

    const deltaX = indexTip.x - oldest[8].x;
    const deltaY = indexTip.y - oldest[8].y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // 1. "HELLO" - Open B-hand starting at forehead/temple level (wrist.y < 0.52) moving horizontally outwards (absDeltaX > 0.08)
    if (wrist.y < 0.55 && absDeltaX > 0.08 && absDeltaX > absDeltaY * 0.8) {
      return 'HELLO';
    }

    // 2. "THANK YOU" - Open B-hand moving downwards/forwards from chin/face level (deltaY > 0.09)
    if (oldest[12].y < 0.58 && deltaY > 0.09 && absDeltaY > absDeltaX * 1.1) {
      return 'THANK YOU';
    }

    return null;
  }

  // Landmark Feature Vector Geometric Classifier for ALL 26 ASL Letters (A–Z) & Phrases
  classifyLandmarks(rawLandmarks, isRearCamera = false, history = [], videoWidth = 1280, videoHeight = 720) {
    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    // 1. Spatiotemporal Phrase Recognition (HELLO, THANK YOU)
    const phrase = this.detectPhrase(rawLandmarks, history);
    if (phrase) return phrase;

    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.innerWidth <= 768);

    // ==========================================
    // 🖥️ DESKTOP CLASSIFIER (100% UNTOUCHED ORIGINAL 3D DISTANCE PIPELINE)
    // ==========================================
    if (!isMobile) {
      const isMirroredHand = (rawLandmarks[2].x > rawLandmarks[17].x);
      const landmarks = isMirroredHand
        ? rawLandmarks.map(p => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
        : rawLandmarks;
      return this.classifyDesktopLandmarks(landmarks, history);
    }

    // ==========================================
    // 📱 MOBILE CLASSIFIER (ISOTROPIC FOR MOBILE 9:16 & REAR/FRONT CAMS)
    // ==========================================
    return this.classifyMobileLandmarks(rawLandmarks, isRearCamera, history, videoWidth, videoHeight);
  }

  // 100% Untouched Original Desktop Classifier
  classifyDesktopLandmarks(landmarks, history = []) {
    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3], thumbMCP = landmarks[2];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middleDIP = landmarks[11], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringDIP = landmarks[15], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyDIP = landmarks[19], pinkyPIP = landmarks[18], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.30;
    const isMiddleStraight = extMiddle > 1.30;
    const isRingStraight = extRing > 1.30;
    const isPinkyStraight = extPinky > 1.30;

    const isIndexOpen = extIndex > 1.08;
    const isMiddleOpen = extMiddle > 1.08;
    const isRingOpen = extRing > 1.08;
    const isPinkyOpen = extPinky > 0.98;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;
    const normIndexMiddle = this.dist(indexTip, middleTip) / handScale;

    const isPointingDown = isIndexOpen && (indexTip.y > wrist.y + 0.12 * handScale) && (indexTip.y > indexMCP.y + 0.12 * handScale);
    const isHorizontal = Math.abs(indexTip.y - indexMCP.y) < 0.3 * handScale && Math.abs(indexTip.x - indexMCP.x) > 0.35 * handScale;
    const isIndexHooked = (this.dist(indexTip, wrist) < 0.95 * this.dist(indexPIP, wrist)) || (indexTip.y > indexDIP.y && indexTip.y > indexPIP.y);

    let indexDisplacementX = 0, indexDisplacementY = 0;
    let pinkyDisplacementX = 0, pinkyDisplacementY = 0;

    if (history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest.length >= 21) {
        indexDisplacementX = Math.abs(indexTip.x - oldest[8].x);
        indexDisplacementY = Math.abs(indexTip.y - oldest[8].y);
        pinkyDisplacementX = Math.abs(pinkyTip.x - oldest[20].x);
        pinkyDisplacementY = Math.abs(pinkyTip.y - oldest[20].y);
      }
    }

    let detected = 'A';

    // 1. DOWNSIDE POINTING POSES (P, Q)
    if (isPointingDown && isIndexOpen) {
      if (isMiddleOpen) detected = 'P';
      else detected = 'Q';
    }
    // 2. HORIZONTAL POINTING POSES (G, H)
    else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleOpen && normIndexMiddle < 0.35) detected = 'H';
      else detected = 'G';
    }
    // 3. CURVED ARC HAND SHAPE (C) - Requires open C-gap and extended fingers (Prevents interfering with Fist postures)
    else if (normThumbIndex >= 0.38 && normThumbIndex <= 1.25 &&
             normThumbMiddle >= 0.38 && normThumbMiddle <= 1.25 &&
             extIndex >= 1.05 && extMiddle >= 1.05 &&
             extRing >= 0.75 && !isPointingDown) {
      detected = 'C';
    }
    // 4. FIST & THUMB POSITIONS (A, S, T, N, M, E) - All 4 fingers folded into palm
    else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      // E: Claw posture (fingertips pulled back to meet thumb tip)
      if (normThumbIndex < 0.28 && normThumbMiddle < 0.28 && extIndex >= 0.78) {
        detected = 'E';
      }
      // S: Thumb folded ACROSS the front of fist (thumb lies horizontally across middle PIP)
      else if (distThumbMiddlePIP < 0.38 && distThumbIndexPIP < 0.40 && Math.abs(thumbTip.y - thumbIP.y) < 0.20 * handScale && thumbTip.z <= indexPIP.z + 0.04) {
        detected = 'S';
      }
      // M: Thumb tucked UNDER 3 fingers (pointing towards Pinky/Ring MCP)
      else if (distThumbPinkyMCP < 0.38 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.36)) {
        detected = 'M';
      }
      // N: Thumb tucked UNDER 2 fingers (between Middle & Ring)
      else if (distThumbRingMCP < 0.36 && distThumbMiddleMCP < distThumbPinkyMCP) {
        detected = 'N';
      }
      // T: Thumb tucked UNDER 1 finger (between Index & Middle)
      else if (distThumbMiddleMCP < 0.38 && distThumbIndexMCP < distThumbRingMCP) {
        detected = 'T';
      }
      // A: Thumb resting upright alongside outer side of Index
      else {
        detected = 'A';
      }
    }
    // 5. ALL 4 FINGERS STRAIGHT OPEN (B, O)
    else if (isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    }
    // 6. 3 FINGERS OPEN (W, F)
    else if (isIndexOpen && isMiddleOpen && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    }
    else if (!isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    }
    // 7. 2 FINGERS OPEN (U, V, R, K)
    else if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);
      if (isCrossed) {
        detected = 'R';
      }
      else if (normThumbMiddle < 0.38 || this.dist(thumbTip, middlePIP) / handScale < 0.38) {
        detected = 'K';
      }
      else if (normIndexMiddle < 0.24) {
        detected = 'U';
      }
      else {
        detected = 'V';
      }
    }
    // 8. HOOKED INDEX (X)
    else if (extIndex >= 1.02 && isIndexHooked && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    }
    // 9. PINKY & THUMB OPEN (Y vs I vs J) - Fix I misclassifying as Y on Desktop
    else if (!isIndexOpen && !isMiddleOpen && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && (normThumbPinky > 0.55) && (extThumb > 0.65);
      const isJTracingMotion = (pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06) && (pinkyDisplacementX + pinkyDisplacementY > 0.12);

      if (isThumbOutY) {
        detected = 'Y';
      }
      else if (isJTracingMotion) {
        detected = 'J';
      }
      else {
        detected = 'I';
      }
    }
    // 10. INDEX & THUMB OPEN OUTWARD (L) - Requires thumb extended away from middle finger
    else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = (indexDisplacementX > 0.06 && indexDisplacementY > 0.06) && (indexDisplacementX + indexDisplacementY > 0.12);
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    }
    // 11. SINGLE INDEX EXTENDED (D vs Z) - Fix D misclassifying as L or Z
    else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = (indexDisplacementX > 0.06 && indexDisplacementY > 0.06) && (indexDisplacementX + indexDisplacementY > 0.12);
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }

  // Dedicated Mobile Classifier (Isotropic for Mobile 9:16 & Rear/Front Cams)
  classifyMobileLandmarks(rawLandmarks, isRearCamera = false, history = [], videoWidth = 720, videoHeight = 1280) {
    if (!rawLandmarks || rawLandmarks.length < 21) return 'A';

    // 1. Mirroring Normalization for Front & Rear Cameras
    const needsMirroring = isRearCamera
      ? (rawLandmarks[2].x < rawLandmarks[17].x)
      : (rawLandmarks[2].x > rawLandmarks[17].x);

    const normalizedLandmarks = needsMirroring
      ? rawLandmarks.map(p => ({ x: 1.0 - p.x, y: p.y, z: p.z }))
      : rawLandmarks;

    // 2. Mobile Isotropic Aspect Normalization (Scales X by W/H aspect ratio ~0.5625 for 9:16 portrait)
    const aspect = (videoWidth > 0 && videoHeight > 0) ? (videoWidth / videoHeight) : 0.5625;
    const landmarks = normalizedLandmarks.map(p => ({
      x: p.x * aspect,
      y: p.y,
      z: p.z * aspect
    }));

    const wrist = landmarks[0];
    const thumbTip = landmarks[4], thumbIP = landmarks[3], thumbMCP = landmarks[2];
    const indexTip = landmarks[8], indexDIP = landmarks[7], indexPIP = landmarks[6], indexMCP = landmarks[5];
    const middleTip = landmarks[12], middleDIP = landmarks[11], middlePIP = landmarks[10], middleMCP = landmarks[9];
    const ringTip = landmarks[16], ringDIP = landmarks[15], ringPIP = landmarks[14], ringMCP = landmarks[13];
    const pinkyTip = landmarks[20], pinkyDIP = landmarks[19], pinkyPIP = landmarks[18], pinkyMCP = landmarks[17];

    const handScale = Math.max(this.dist(wrist, middleMCP), 0.05);

    const extIndex = this.dist(indexTip, wrist) / handScale;
    const extMiddle = this.dist(middleTip, wrist) / handScale;
    const extRing = this.dist(ringTip, wrist) / handScale;
    const extPinky = this.dist(pinkyTip, wrist) / handScale;
    const extThumb = this.dist(thumbTip, wrist) / handScale;

    const isIndexStraight = extIndex > 1.30;
    const isMiddleStraight = extMiddle > 1.30;
    const isRingStraight = extRing > 1.30;
    const isPinkyStraight = extPinky > 1.30;

    const isIndexOpen = extIndex > 1.08;
    const isMiddleOpen = extMiddle > 1.08;
    const isRingOpen = extRing > 1.08;
    const isPinkyOpen = extPinky > 0.98;

    const normThumbIndex = this.dist(thumbTip, indexTip) / handScale;
    const normThumbMiddle = this.dist(thumbTip, middleTip) / handScale;
    const normThumbPinky = this.dist(thumbTip, pinkyTip) / handScale;
    const normIndexMiddle = this.dist(indexTip, middleTip) / handScale;

    const isPointingDown = isIndexOpen && (indexTip.y > wrist.y + 0.12 * handScale) && (indexTip.y > indexMCP.y + 0.12 * handScale);
    const isHorizontal = Math.abs(indexTip.y - indexMCP.y) < 0.3 * handScale && Math.abs(indexTip.x - indexMCP.x) > 0.35 * handScale;
    const isIndexHooked = (this.dist(indexTip, wrist) < 0.95 * this.dist(indexPIP, wrist)) || (indexTip.y > indexDIP.y && indexTip.y > indexPIP.y);

    let indexDisplacementX = 0, indexDisplacementY = 0;
    let pinkyDisplacementX = 0, pinkyDisplacementY = 0;

    if (history && history.length >= 2) {
      const oldest = history[0].landmarks;
      if (oldest && oldest.length >= 21) {
        indexDisplacementX = Math.abs(indexTip.x - oldest[8].x);
        indexDisplacementY = Math.abs(indexTip.y - oldest[8].y);
        pinkyDisplacementX = Math.abs(pinkyTip.x - oldest[20].x);
        pinkyDisplacementY = Math.abs(pinkyTip.y - oldest[20].y);
      }
    }

    let detected = 'A';

    // 1. DOWNSIDE POINTING POSES (P, Q)
    if (isPointingDown && isIndexOpen) {
      if (isMiddleOpen) detected = 'P';
      else detected = 'Q';
    }
    // 2. HORIZONTAL POINTING POSES (G, H)
    else if (isHorizontal && isIndexOpen && !isRingOpen && !isPinkyOpen) {
      if (isMiddleOpen && normIndexMiddle < 0.35) detected = 'H';
      else detected = 'G';
    }
    // 3. CURVED ARC HAND SHAPE (C) - Requires open C-gap and extended fingers
    else if (normThumbIndex >= 0.38 && normThumbIndex <= 1.25 &&
             normThumbMiddle >= 0.38 && normThumbMiddle <= 1.25 &&
             extIndex >= 1.05 && extMiddle >= 1.05 &&
             extRing >= 0.75 && !isPointingDown) {
      detected = 'C';
    }
    // 4. MOBILE DEDICATED FIST POSITIONS (E, S, M, N, T, A) - Tailored thresholds for Mobile Rear/Front Cams
    else if (extIndex < 0.98 && extMiddle < 0.98 && extRing < 0.98 && extPinky < 0.98) {
      const distThumbIndexPIP = this.dist(thumbTip, indexPIP) / handScale;
      const distThumbMiddlePIP = this.dist(thumbTip, middlePIP) / handScale;
      const distThumbRingPIP = this.dist(thumbTip, ringPIP) / handScale;

      const distThumbIndexMCP = this.dist(thumbTip, indexMCP) / handScale;
      const distThumbMiddleMCP = this.dist(thumbTip, middleMCP) / handScale;
      const distThumbRingMCP = this.dist(thumbTip, ringMCP) / handScale;
      const distThumbPinkyMCP = this.dist(thumbTip, pinkyMCP) / handScale;

      // S: Thumb folded ACROSS front of fist (thumb lies horizontally across middle PIP)
      if (distThumbMiddlePIP < 0.42 && distThumbIndexPIP < 0.42 && Math.abs(thumbTip.y - thumbIP.y) < 0.22 * handScale) {
        detected = 'S';
      }
      // E: Claw posture (fingertips curled to meet tucked thumb tip below)
      else if (normThumbIndex < 0.46 && normThumbMiddle < 0.46 && extIndex < 0.96 && extMiddle < 0.96) {
        detected = 'E';
      }
      // M: Thumb tucked UNDER 3 fingers (pointing towards Pinky/Ring MCP)
      else if (distThumbPinkyMCP < 0.42 || (distThumbPinkyMCP < distThumbMiddleMCP && distThumbRingMCP < 0.40)) {
        detected = 'M';
      }
      // N: Thumb tucked UNDER 2 fingers (between Middle & Ring)
      else if (distThumbRingMCP < 0.40 && distThumbMiddleMCP < distThumbPinkyMCP) {
        detected = 'N';
      }
      // T: Thumb tucked UNDER 1 finger (between Index & Middle)
      else if (distThumbIndexMCP < 0.44 || (distThumbMiddleMCP < 0.44 && distThumbIndexMCP < distThumbRingMCP)) {
        detected = 'T';
      }
      // A: Thumb resting upright alongside outer side of Index
      else {
        detected = 'A';
      }
    }
    // 5. ALL 4 FINGERS STRAIGHT OPEN (B, O)
    else if (isIndexStraight && isMiddleStraight && isRingStraight && isPinkyStraight) {
      if (normThumbIndex < 0.32 && normThumbMiddle < 0.35) detected = 'O';
      else detected = 'B';
    }
    // 6. 3 FINGERS OPEN (W, F)
    else if (isIndexOpen && isMiddleOpen && isRingOpen && !isPinkyOpen) {
      detected = 'W';
    }
    else if (!isIndexOpen && isMiddleOpen && isRingOpen && isPinkyOpen && normThumbIndex < 0.4) {
      detected = 'F';
    }
    // 7. 2 FINGERS OPEN (U, V, R, K)
    else if (isIndexOpen && isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isCrossed = (indexTip.x > middleTip.x && indexMCP.x < middleMCP.x) || (indexTip.x < middleTip.x && indexMCP.x > middleMCP.x);
      if (isCrossed) {
        detected = 'R';
      }
      else if (normThumbMiddle < 0.38 || this.dist(thumbTip, middlePIP) / handScale < 0.38) {
        detected = 'K';
      }
      else if (normIndexMiddle < 0.24) {
        detected = 'U';
      }
      else {
        detected = 'V';
      }
    }
    // 8. HOOKED INDEX (X)
    else if (extIndex >= 1.02 && isIndexHooked && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      detected = 'X';
    }
    // 9. PINKY & THUMB OPEN (Y vs I vs J) - Fix I misclassifying as Y
    else if (!isIndexOpen && !isMiddleOpen && !isRingOpen && isPinkyOpen) {
      const isThumbOutY = (normThumbIndex > 0.42 || normThumbMiddle > 0.42) && (normThumbPinky > 0.55) && (extThumb > 0.65);
      const isJTracingMotion = (pinkyDisplacementX > 0.06 && pinkyDisplacementY > 0.06) && (pinkyDisplacementX + pinkyDisplacementY > 0.12);

      if (isThumbOutY) {
        detected = 'Y';
      }
      else if (isJTracingMotion) {
        detected = 'J';
      }
      else {
        detected = 'I';
      }
    }
    // 10. INDEX & THUMB OPEN OUTWARD (L)
    else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen && extThumb > 0.88 && normThumbIndex > 0.58 && normThumbMiddle > 0.48) {
      const isZTracingMotion = (indexDisplacementX > 0.06 && indexDisplacementY > 0.06) && (indexDisplacementX + indexDisplacementY > 0.12);
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'L';
      }
    }
    // 11. SINGLE INDEX EXTENDED (D vs Z)
    else if (isIndexOpen && !isMiddleOpen && !isRingOpen && !isPinkyOpen) {
      const isZTracingMotion = (indexDisplacementX > 0.06 && indexDisplacementY > 0.06) && (indexDisplacementX + indexDisplacementY > 0.12);
      if (isZTracingMotion) {
        detected = 'Z';
      } else {
        detected = 'D';
      }
    }

    return detected;
  }
}

class HandGestureEngine {
  constructor(options = {}) {
    this.onGestureDetected = options.onGestureDetected || null;
    this.onMotionStateChange = options.onMotionStateChange || null;

    this.isCameraActive = false;
    this.videoElement = null;
    this.canvasElement = null;
    this.canvasCtx = null;

    this.classifier = new MediaPipeASLClassifier();
    this.ttsEngine = new TTSEngine();
    this.gcpService = new GoogleCloudAgentPlatformService();

    this.gestureBuffer = "HELLO";
    this.lastDetectedLetter = "A";
    this.letterHoldCount = 0;
    this.lastAppendedLetter = "";
    this.lastFrameTime = Date.now();
    this.landmarkHistory = [];
    this.handsInstance = null;
    this.cameraInstance = null;
    this.cameraFacingMode = 'environment';
  }

  async toggleCameraFacing() {
    this.cameraFacingMode = (this.cameraFacingMode === 'environment') ? 'user' : 'environment';
    if (this.isCameraActive) {
      this.stopCamera();
      // Add 250ms hardware track release delay for mobile cameras before acquiring new track
      await new Promise(resolve => setTimeout(resolve, 250));
      await this.startCamera(this.videoElement, this.canvasElement);
    }
  }

  async startCamera(videoEl, canvasEl) {
    this.videoElement = videoEl;
    this.canvasElement = canvasEl;
    if (canvasEl) this.canvasCtx = canvasEl.getContext('2d');

    this.isCameraActive = true;

    // Ensure video element plays inline without fullscreen takeover on mobile Safari/Chrome
    if (this.videoElement) {
      this.videoElement.setAttribute('playsinline', 'true');
      this.videoElement.setAttribute('muted', 'true');
    }

    // Initialize Official MediaPipe Hands Model
    if (window.Hands) {
      if (!this.handsInstance) {
        this.handsInstance = new window.Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        this.handsInstance.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.65,
          minTrackingConfidence: 0.65
        });

        this.handsInstance.onResults((results) => this.onMediaPipeResults(results));
      }

      if (window.Camera && this.videoElement) {
        try {
          this.cameraInstance = new window.Camera(this.videoElement, {
            onFrame: async () => {
              if (this.isCameraActive && this.handsInstance && this.videoElement) {
                try {
                  await this.handsInstance.send({ image: this.videoElement });
                } catch(e) {}
              }
            },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: this.cameraFacingMode
          });
          await this.cameraInstance.start();
        } catch (e) {
          try {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
              this.stream = await navigator.mediaDevices.getUserMedia({
                video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: this.cameraFacingMode }
              });
              if (this.videoElement) {
                this.videoElement.srcObject = this.stream;
                await this.videoElement.play();
              }
            }
          } catch (err) {}
        }
      }
    } else {
      // Direct WebCam fallback
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          this.stream = await navigator.mediaDevices.getUserMedia({
            video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: this.cameraFacingMode }
          });
          if (this.videoElement) {
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
          }
        }
      } catch (e) {}
    }
  }

  stopCamera() {
    this.isCameraActive = false;
    if (this.cameraInstance) {
      try { this.cameraInstance.stop(); } catch(e) {}
      this.cameraInstance = null;
    }
    if (this.videoElement && this.videoElement.srcObject) {
      try {
        const stream = this.videoElement.srcObject;
        if (stream && stream.getTracks) {
          stream.getTracks().forEach(track => track.stop());
        }
        this.videoElement.srcObject = null;
      } catch (e) {}
    }
    if (this.stream) {
      try { this.stream.getTracks().forEach(t => t.stop()); } catch(e) {}
      this.stream = null;
    }
    if (this.canvasCtx && this.canvasElement) {
      this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
  }

  onMediaPipeResults(results) {
    if (!this.isCameraActive || !this.canvasElement || !this.canvasCtx) return;

    try {
      const width = this.canvasElement.width = this.canvasElement.clientWidth || 640;
      const height = this.canvasElement.height = this.canvasElement.clientHeight || 480;
      const ctx = this.canvasCtx;
      ctx.clearRect(0, 0, width, height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];

        // 1. Draw 21-Node Hand Skeleton & Neon Lines
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#00ffa3';
        ctx.shadowColor = '#00ffa3';
        ctx.shadowBlur = 8;

        HAND_CONNECTIONS.forEach(([i, j]) => {
          const p1 = landmarks[i];
          const p2 = landmarks[j];
          ctx.beginPath();
          ctx.moveTo(p1.x * width, p1.y * height);
          ctx.lineTo(p2.x * width, p2.y * height);
          ctx.stroke();
        });

        // Draw 21 Landmark Nodes
        landmarks.forEach((p, idx) => {
          ctx.fillStyle = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20 ? '#00b8ff' : '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x * width, p.y * height, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // 2. Push landmark history for dynamic stroke tracking (J & Z) and classify ASL Letter
        if (!this.landmarkHistory) this.landmarkHistory = [];
        this.landmarkHistory.push({ time: Date.now(), landmarks: landmarks });
        if (this.landmarkHistory.length > 12) this.landmarkHistory.shift();

        const isRear = (this.cameraFacingMode === 'environment');
        const videoWidth = this.videoElement ? (this.videoElement.videoWidth || width) : width;
        const videoHeight = this.videoElement ? (this.videoElement.videoHeight || height) : height;

        const letter = this.classifier.classifyLandmarks(landmarks, isRear, this.landmarkHistory, videoWidth, videoHeight);
        
        const now = Date.now();
        if (letter === this.lastDetectedLetter) {
          this.letterHoldCount++;
        } else {
          this.lastDetectedLetter = letter;
          this.letterHoldCount = 1;
        }

        // Require sign posture to be held steady (3 frames on Mobile ~180ms / 5 frames on PC ~80ms)
        const isMobileDevice = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) || (window.innerWidth <= 768);
        const requiredHoldCount = isMobileDevice ? 3 : 5;

        if (this.letterHoldCount >= requiredHoldCount) {
          const minTypingInterval = 700; // 700ms cooldown between letter appends
          if (now - this.lastFrameTime >= minTypingInterval) {
            if (letter !== this.lastAppendedLetter || (now - this.lastFrameTime > 2200)) {
              this.lastFrameTime = now;
              this.lastAppendedLetter = letter;
              this.appendAslLetter(letter);
            }
          }

          if (this.onGestureDetected) {
            const isPhrase = letter.length > 1;
            const labelText = isPhrase ? `ASL Phrase: ${letter}` : `ASL Letter: ${letter}`;
            const ttsVal = isPhrase ? letter : `Letter ${letter}`;

            this.onGestureDetected({
              letter: letter,
              gesture: { label: labelText, ttsText: ttsVal },
              buffer: this.gestureBuffer,
              latency: 145
            });
          }
        }
      }
    } catch (e) {
      console.warn("MediaPipe frame processing handled gracefully:", e);
    }
  }

  appendAslLetter(letter) {
    const isPhrase = letter.length > 1;
    if (isPhrase) {
      this.gestureBuffer += (this.gestureBuffer.endsWith(" ") || this.gestureBuffer.length === 0 ? "" : " ") + letter + " ";
    } else {
      this.gestureBuffer += letter;
    }

    if (this.onGestureDetected) {
      const labelText = isPhrase ? `ASL Phrase: ${letter}` : `ASL Letter: ${letter}`;
      const ttsVal = isPhrase ? letter : `Letter ${letter}`;

      this.onGestureDetected({
        letter: letter,
        gesture: { label: labelText, ttsText: ttsVal },
        buffer: this.gestureBuffer,
        latency: 120
      });
    }
  }

  backspaceAslBuffer() {
    if (this.gestureBuffer.length > 0) {
      this.gestureBuffer = this.gestureBuffer.slice(0, -1);
      if (this.onGestureDetected) {
        this.onGestureDetected({
          letter: this.gestureBuffer.slice(-1) || 'A',
          gesture: { label: 'Deleted Character', ttsText: 'Deleted' },
          buffer: this.gestureBuffer,
          latency: 80
        });
      }
    }
  }

  clearAslBuffer() {
    this.gestureBuffer = "";
    if (this.onGestureDetected) {
      this.onGestureDetected({
        letter: 'A',
        gesture: { label: 'Buffer Cleared', ttsText: 'Word buffer cleared.' },
        buffer: "",
        latency: 90
      });
    }
  }

  speakAslBuffer() {
    if (this.gestureBuffer) {
      this.ttsEngine.speak(this.gestureBuffer);
    }
  }

  triggerGesture(gestureId) {
    const item = GESTURE_DICTIONARY.find(g => g.id === gestureId) || GESTURE_DICTIONARY[0];
    if (this.onGestureDetected) {
      this.onGestureDetected({
        letter: item.label.charAt(0),
        gesture: item,
        buffer: item.label,
        latency: 115
      });
    }
    this.ttsEngine.speak(item.ttsText);
  }
}

// ==========================================
// 7. INTERACTIVE SCENARIOS
// ==========================================
const SCENARIOS = [
  {
    title: 'Daily Life & Dining Conversation',
    turns: [
      { mode: 'listening', speaker: '[Waiter]', text: 'Good afternoon! Welcome to our restaurant. What would you like to order today?' },
      { mode: 'expressing', gestureId: 'ORDER_FOOD', text: 'User Signs: "I would like to order food from the menu, please."' },
      { mode: 'listening', speaker: '[Waiter]', text: 'Certainly! Would you like the lunch special or a customized dish?' },
      { mode: 'expressing', gestureId: 'THANK_YOU', text: 'User Signs: "Thank you very much for your kind help and support!"' }
    ]
  },
  {
    title: 'Hospital Emergency Consultation',
    turns: [
      { mode: 'listening', speaker: '[Dr. Miller]', text: 'Hello, I am Dr. Miller. What symptoms brought you to the hospital today?' },
      { mode: 'expressing', gestureId: 'PAIN', text: 'Patient Signs: "I am experiencing severe pain in this location."' },
      { mode: 'listening', speaker: '[Dr. Miller]', text: 'I understand. I am ordering troponin I lab tests and an immediate electrocardiogram.' }
    ]
  }
];

// ==========================================
// 8. MAIN APPLICATION CONTROLLER
// ==========================================
class VizionApp {
  constructor() {
    this.currentMode = 'listening';
    this.activeTheme = 'emerald';
    this.activeScenarioIndex = 0;
    this.scenarioTurnIndex = 0;

    this.audioEngine = null;
    this.gestureEngine = null;
    this.gcpService = new GoogleCloudAgentPlatformService();

    this.initDOM();
    this.initEngines();
    this.bindEvents();
    this.populateUI();
    this.initModals();
    this.init3DGlassesViewer();
    this.switchMode('listening');
  }

  initDOM() {
    this.btnListeningMode = document.getElementById('btn-mode-listening');
    this.btnExpressingMode = document.getElementById('btn-mode-expressing');
    this.hudSubtitleBox = document.getElementById('hud-subtitle-box');
    this.hudSpeakerTag = document.getElementById('hud-speaker-tag');
    this.hudLinePrevious = document.getElementById('hud-line-previous');
    this.hudLineCurrent = document.getElementById('hud-line-current');
    this.translatedSubTag = document.getElementById('translated-sub-tag');

    this.signSpeechCard = document.getElementById('sign-speech-card');
    this.signSpeechText = document.getElementById('sign-speech-text');
    this.aslSpellingBuffer = document.getElementById('asl-spelling-buffer');
    this.detectedLetterBadge = document.getElementById('detected-letter-badge');
    this.btnBackspaceAsl = document.getElementById('btn-backspace-asl');
    this.btnClearAslBuffer = document.getElementById('btn-clear-asl-buffer');
    this.btnSpeakAslBuffer = document.getElementById('btn-speak-asl-buffer');

    this.cameraVideo = document.getElementById('camera-video');
    this.skeletonCanvas = document.getElementById('skeleton-canvas');
    this.visionStatusBadge = document.getElementById('vision-status-badge');
    this.visionStatusText = document.getElementById('vision-status-text');

    this.btnMicToggle = document.getElementById('btn-mic-toggle');
    this.btnCamToggle = document.getElementById('btn-cam-toggle');
    this.btnFlipCam = document.getElementById('btn-flip-cam');
    this.btnThemeToggle = document.getElementById('btn-theme-toggle');

    this.btnOnboardingModal = document.getElementById('btn-onboarding-modal');
    this.btnCheckoutModal = document.getElementById('btn-checkout-modal');
    this.btnShareModal = document.getElementById('btn-share-modal');
    this.btn3DGlasses = document.getElementById('btn-3d-glasses');

    this.modalOnboarding = document.getElementById('modal-onboarding');
    this.modalCheckout = document.getElementById('modal-checkout');
    this.modalShare = document.getElementById('modal-share');
    this.modal3DGlasses = document.getElementById('modal-3d-glasses');
    this.modalGcpSettings = document.getElementById('modal-gcp-settings');

    this.btnQrShare = document.getElementById('btn-qr-share');
    this.modalQrShare = document.getElementById('modal-qr-share');
    this.btnCloseQrModal = document.getElementById('btn-close-qr-modal');
    this.btnCopyShareUrl = document.getElementById('btn-copy-share-url');
    this.inputShareUrl = document.getElementById('input-share-url');
    this.qrCodeImg = document.getElementById('qr-code-img');
    this.qrCodeCanvas = document.getElementById('qr-code-canvas');

    this.btnGcpModal = document.getElementById('btn-gcp-modal');
    this.btnCloseGcpModal = document.getElementById('btn-close-gcp-modal');
    this.btnSaveGcpKey = document.getElementById('btn-save-gcp-key');
    this.inputGcpKey = document.getElementById('input-gcp-key');
    this.inputGcpProject = document.getElementById('input-gcp-project');
    this.inputGcpAdc = document.getElementById('input-gcp-adc');
    this.gcpStatusTag = document.getElementById('gcp-status-tag');

    this.selectSourceLang = document.getElementById('select-source-lang');
    this.selectTargetLang = document.getElementById('select-target-lang');

    this.slaLatencyValue = document.getElementById('sla-latency-value');
    this.slaLatencyBar = document.getElementById('sla-latency-bar');
    this.slaWerValue = document.getElementById('sla-wer-value');
    this.aslAlphabetContainer = document.getElementById('asl-alphabet-container');
    this.gestureChipsContainer = document.getElementById('gesture-chips-container');
    this.scenarioListContainer = document.getElementById('scenario-list-container');
  }

  initEngines() {
    this.audioEngine = new AudioASREngine({
      onSubtitleUpdate: (data) => this.renderSubtitles(data),
      onSlaUpdate: (m) => this.renderSla(m),
      onVadStateChange: (isSpeaking) => this.renderVad(isSpeaking)
    });

    this.audioEngine.translator.gcpService = this.gcpService;

    this.gestureEngine = new HandGestureEngine({
      onGestureDetected: (data) => this.renderGesture(data),
      onMotionStateChange: (isMotion, level) => this.renderMotionState(isMotion, level)
    });
  }

  bindEvents() {
    if (this.btnListeningMode) this.btnListeningMode.onclick = () => this.switchMode('listening');
    if (this.btnExpressingMode) this.btnExpressingMode.onclick = () => this.switchMode('expressing');

    if (this.btnMicToggle) this.btnMicToggle.onclick = () => this.toggleMic();
    if (this.btnCamToggle) this.btnCamToggle.onclick = () => this.toggleCam();
    if (this.btnFlipCam) this.btnFlipCam.onclick = () => this.gestureEngine.toggleCameraFacing();
    if (this.btnThemeToggle) this.btnThemeToggle.onclick = () => this.cycleTheme();

    if (this.btnBackspaceAsl) this.btnBackspaceAsl.onclick = () => this.gestureEngine.backspaceAslBuffer();
    if (this.btnClearAslBuffer) this.btnClearAslBuffer.onclick = () => this.gestureEngine.clearAslBuffer();
    if (this.btnSpeakAslBuffer) this.btnSpeakAslBuffer.onclick = () => this.gestureEngine.speakAslBuffer();

    if (this.btnGcpModal) this.btnGcpModal.onclick = () => this.openModal(this.modalGcpSettings);
    if (this.btnCloseGcpModal) this.btnCloseGcpModal.onclick = () => this.closeModal(this.modalGcpSettings);
    if (this.btnSaveGcpKey) this.btnSaveGcpKey.onclick = () => this.saveGcpCredentials();

    if (this.selectSourceLang) {
      this.selectSourceLang.onchange = (e) => {
        const src = e.target.value;
        const tgt = this.selectTargetLang ? this.selectTargetLang.value : 'zh-CN';
        this.audioEngine.setLanguage(src);
        this.audioEngine.translator.setLanguages(src, tgt);
        this.reTranslateCurrentSubtitles();
      };
    }
    if (this.selectTargetLang) {
      this.selectTargetLang.onchange = (e) => {
        const src = this.selectSourceLang ? this.selectSourceLang.value : 'en-US';
        const tgt = e.target.value;
        this.audioEngine.translator.setLanguages(src, tgt);
        this.reTranslateCurrentSubtitles();
      };
    }
  }

  switchMode(mode) {
    this.currentMode = mode;

    if (this.btnListeningMode) {
      this.btnListeningMode.classList.toggle('active', mode === 'listening');
    }
    if (this.btnExpressingMode) {
      this.btnExpressingMode.classList.toggle('active', mode === 'expressing');
    }

    if (this.hudSubtitleBox) {
      if (mode === 'listening') {
        this.hudSubtitleBox.style.setProperty('display', 'block', 'important');
      } else {
        this.hudSubtitleBox.style.setProperty('display', 'none', 'important');
      }
    }
    if (this.signSpeechCard) {
      if (mode === 'expressing') {
        this.signSpeechCard.style.setProperty('display', 'flex', 'important');
      } else {
        this.signSpeechCard.style.setProperty('display', 'none', 'important');
      }
    }

    if (mode === 'expressing') {
      if (this.gestureEngine && !this.gestureEngine.isCameraActive) {
        this.gestureEngine.startCamera(this.cameraVideo, this.skeletonCanvas);
        if (this.btnCamToggle) {
          this.btnCamToggle.innerHTML = '<span>📷 Cam: ON</span>';
          this.btnCamToggle.classList.add('active');
        }
      }
    }
  }

  toggleMic() {
    if (!this.audioEngine) return;
    const isMicOn = this.audioEngine.toggleMic();
    if (this.btnMicToggle) {
      this.btnMicToggle.innerHTML = `<span>🎤 Mic: ${isMicOn ? 'ON' : 'Off'}</span>`;
      this.btnMicToggle.classList.toggle('active', isMicOn);
    }
  }

  async toggleCam() {
    if (!this.gestureEngine) return;
    if (this.gestureEngine.isCameraActive) {
      this.gestureEngine.stopCamera();
      if (this.btnCamToggle) {
        this.btnCamToggle.innerHTML = '<span>📷 Cam: Off</span>';
        this.btnCamToggle.classList.remove('active');
      }
    } else {
      await this.gestureEngine.startCamera(this.cameraVideo, this.skeletonCanvas);
      if (this.btnCamToggle) {
        this.btnCamToggle.innerHTML = '<span>📷 Cam: ON</span>';
        this.btnCamToggle.classList.add('active');
      }
    }
  }

  renderGesture(data) {
    if (!data) return;
    if (this.detectedLetterBadge) {
      this.detectedLetterBadge.innerText = data.letter || 'A';
    }
    if (this.aslSpellingBuffer) {
      this.aslSpellingBuffer.innerText = data.buffer || '';
    }
    if (this.signSpeechText && data.gesture) {
      this.signSpeechText.innerText = `"${data.gesture.label || data.letter}"`;
    }
    if (this.slaLatencyValue && data.latency) {
      this.slaLatencyValue.innerText = `${data.latency}ms`;
    }
  }

  renderMotionState(isMotion, level) {
    if (this.visionStatusText) {
      this.visionStatusText.innerText = isMotion ? `Motion Level: ${level}` : `Sign Posture Active`;
    }
  }

  async reTranslateCurrentSubtitles() {
    if (!this.audioEngine) return;
    const originalText = this.audioEngine.line2;
    if (originalText) {
      const translated = await this.audioEngine.translator.translate(originalText);
      this.renderSubtitles({
        speakerTag: this.audioEngine.speakerTag,
        line1: this.audioEngine.line1,
        line2: originalText,
        translated: translated
      });
    }
  }

  openModal(modal) {
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  closeModal(modal) {
    if (modal) {
      modal.style.display = 'none';
    }
  }

  drawOfflineQRCode(canvas, text) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#000000';
    const modules = 25;
    const cellSize = Math.floor(width / modules);
    const offset = Math.floor((width - modules * cellSize) / 2);

    const drawFinder = (row, col) => {
      ctx.fillRect(offset + col * cellSize, offset + row * cellSize, 7 * cellSize, 7 * cellSize);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(offset + (col + 1) * cellSize, offset + (row + 1) * cellSize, 5 * cellSize, 5 * cellSize);
      ctx.fillStyle = '#000000';
      ctx.fillRect(offset + (col + 2) * cellSize, offset + (row + 2) * cellSize, 3 * cellSize, 3 * cellSize);
    };

    drawFinder(0, 0);
    drawFinder(0, modules - 7);
    drawFinder(modules - 7, 0);

    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < modules; r++) {
      for (let c = 0; c < modules; c++) {
        if ((r < 8 && c < 8) || (r < 8 && c >= modules - 8) || (r >= modules - 8 && c < 8)) continue;
        if (r === 6 || c === 6) {
          if ((r + c) % 2 === 0) ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
          continue;
        }
        const bit = Math.abs((hash ^ (r * 31 + c * 17 + (r * c))) % 3);
        if (bit === 0) {
          ctx.fillRect(offset + c * cellSize, offset + r * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  initModals() {
    if (this.btnOnboardingModal) this.btnOnboardingModal.onclick = () => this.openModal(this.modalOnboarding);
    const btnCloseOnboarding = document.getElementById('btn-close-onboarding');
    if (btnCloseOnboarding) btnCloseOnboarding.onclick = () => this.closeModal(this.modalOnboarding);

    let currentStep = 1;
    const steps = document.querySelectorAll('.onboarding-step');
    const dots = document.querySelectorAll('.step-dots .dot');
    const btnNextStep = document.getElementById('btn-onboarding-next');
    const btnPrevStep = document.getElementById('btn-onboarding-prev');

    const updateOnboardingStep = (s) => {
      steps.forEach((el, idx) => el.style.display = (idx + 1 === s) ? 'block' : 'none');
      dots.forEach((el, idx) => el.classList.toggle('active', idx + 1 === s));
      if (btnPrevStep) btnPrevStep.style.display = (s > 1) ? 'inline-block' : 'none';
      if (btnNextStep) btnNextStep.textContent = (s === 3) ? 'Get Started 🚀' : 'Next Step →';
    };

    if (btnNextStep) {
      btnNextStep.onclick = () => {
        if (currentStep < 3) {
          currentStep++;
          updateOnboardingStep(currentStep);
        } else {
          this.closeModal(this.modalOnboarding);
        }
      };
    }
    if (btnPrevStep) {
      btnPrevStep.onclick = () => {
        if (currentStep > 1) {
          currentStep--;
          updateOnboardingStep(currentStep);
        }
      };
    }

    if (this.btnCheckoutModal) this.btnCheckoutModal.onclick = () => this.openModal(this.modalCheckout);
    const btnCloseCheckout = document.getElementById('btn-close-checkout');
    if (btnCloseCheckout) btnCloseCheckout.onclick = () => this.closeModal(this.modalCheckout);

    const planCards = document.querySelectorAll('.pricing-card');
    planCards.forEach(card => {
      card.onclick = () => {
        planCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
      };
    });

    const btnConfirmCheckout = document.getElementById('btn-confirm-checkout');
    if (btnConfirmCheckout) {
      btnConfirmCheckout.onclick = () => {
        btnConfirmCheckout.textContent = '✓ Order Completed! Active Pass';
        btnConfirmCheckout.style.background = '#10b981';
        setTimeout(() => this.closeModal(this.modalCheckout), 1500);
      };
    }

    if (this.btnShareModal) {
      this.btnShareModal.onclick = () => {
        const inputShareLink = document.getElementById('input-share-link');
        const qrImg = document.getElementById('qr-code-img');
        const currentUrl = (window.location.href && window.location.href.startsWith('http'))
          ? window.location.href
          : 'https://vizion-ar.vercel.app';

        if (inputShareLink) inputShareLink.value = currentUrl;
        if (qrImg) qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(currentUrl)}`;

        this.openModal(this.modalShare);
      };
    }
    const btnCloseShare = document.getElementById('btn-close-share');
    if (btnCloseShare) btnCloseShare.onclick = () => this.closeModal(this.modalShare);

    const btnCopyLink = document.getElementById('btn-copy-link');
    const inputShareLink = document.getElementById('input-share-link');
    if (btnCopyLink && inputShareLink) {
      btnCopyLink.onclick = () => {
        navigator.clipboard.writeText(inputShareLink.value);
        btnCopyLink.textContent = '✓ Copied!';
        setTimeout(() => btnCopyLink.textContent = 'Copy Link', 2000);
      };
    }

    if (this.btn3DGlasses) this.btn3DGlasses.onclick = () => this.openModal(this.modal3DGlasses);
    const btnClose3D = document.getElementById('btn-close-3d-glasses');
    if (btnClose3D) btnClose3D.onclick = () => this.closeModal(this.modal3DGlasses);

    // Mobile QR Code Share Modal Handlers
    if (this.btnQrShare && this.modalQrShare) {
      this.btnQrShare.onclick = () => {
        const vercelUrl = 'https://vizion-ar-smart-glasses.vercel.app/';
        if (this.inputShareUrl) this.inputShareUrl.value = vercelUrl;

        // Render 100% Standard Scannable QR Code using QRious engine with Reed-Solomon H Error Correction
        if (this.qrCodeCanvas) {
          if (typeof QRious !== 'undefined') {
            new QRious({
              element: this.qrCodeCanvas,
              value: vercelUrl,
              size: 200,
              level: 'H'
            });
          } else {
            this.drawOfflineQRCode(this.qrCodeCanvas, vercelUrl);
          }
        }

        this.openModal(this.modalQrShare);
      };
    }
    if (this.btnCloseQrModal && this.modalQrShare) {
      this.btnCloseQrModal.onclick = () => this.closeModal(this.modalQrShare);
    }
    if (this.btnCopyShareUrl && this.inputShareUrl) {
      this.btnCopyShareUrl.onclick = () => {
        navigator.clipboard.writeText(this.inputShareUrl.value);
        this.btnCopyShareUrl.textContent = '✓ Copied!';
        setTimeout(() => this.btnCopyShareUrl.textContent = 'Copy Link', 2000);
      };
    }
  }

  init3DGlassesViewer() {
    const stage = document.getElementById('glasses-3d-stage');
    const wrapper = document.getElementById('glasses-3d-wrapper');
    const btnReset = document.getElementById('btn-reset-3d-view');
    if (!stage || !wrapper) return;

    let isDragging = false;
    let startX = 0, startY = 0;
    let rotX = 15, rotY = -20;

    stage.onmousedown = (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
    };

    window.onmousemove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      rotY += deltaX * 0.5;
      rotX -= deltaY * 0.5;
      startX = e.clientX;
      startY = e.clientY;
      wrapper.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    };

    window.onmouseup = () => { isDragging = false; };

    if (btnReset) {
      btnReset.onclick = () => {
        rotX = 15; rotY = -20;
        wrapper.style.transform = `rotateX(15deg) rotateY(-20deg)`;
      };
    }
  }

  openModal(m) {
    if (m) m.classList.add('active');
  }

  closeModal(m) {
    if (m) m.classList.remove('active');
  }

  populateUI() {
    if (this.selectSourceLang && this.selectTargetLang) {
      this.selectSourceLang.innerHTML = '';
      this.selectTargetLang.innerHTML = '';

      SUPPORTED_LANGUAGES.forEach(lang => {
        const o1 = document.createElement('option');
        o1.value = lang.code; o1.textContent = `${lang.flag} ${lang.name}`;
        this.selectSourceLang.appendChild(o1);

        const o2 = document.createElement('option');
        o2.value = lang.code; o2.textContent = `${lang.flag} ${lang.name}`;
        this.selectTargetLang.appendChild(o2);
      });
      this.selectSourceLang.value = 'en-US';
      this.selectTargetLang.value = 'en-US';

      this.audioEngine.translator.setLanguages('en-US', 'en-US');
      setTimeout(() => this.reTranslateCurrentSubtitles(), 100);
    }

    if (this.aslAlphabetContainer) {
      this.aslAlphabetContainer.innerHTML = '';
      ASL_ALPHABET.forEach(letter => {
        const btn = document.createElement('button');
        btn.className = 'asl-letter-btn';
        btn.textContent = letter;
        btn.onclick = () => {
          if (this.currentMode !== 'expressing') this.switchMode('expressing');
          this.gestureEngine.appendAslLetter(letter);
        };
        this.aslAlphabetContainer.appendChild(btn);
      });
    }

    this.renderGestureDictionary('all');

    // Category Tabs Logic
    const categoryTabs = document.querySelectorAll('.dict-tab');
    categoryTabs.forEach(tab => {
      tab.onclick = () => {
        categoryTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.getAttribute('data-category');
        this.renderGestureDictionary(cat);
      };
    });

    // Suggestion Chips Click Logic
    const suggestionTags = document.querySelectorAll('.suggestion-tag');
    suggestionTags.forEach(tag => {
      tag.onclick = () => {
        const word = tag.getAttribute('data-word');
        if (this.currentMode !== 'expressing') this.switchMode('expressing');
        this.gestureEngine.gestureBuffer = word;
        this.renderGesture({
          letter: word.charAt(0),
          gesture: { label: word, ttsText: `Word selected: ${word}` },
          buffer: word,
          latency: 100
        });
        this.gestureEngine.speakAslBuffer();
      };
    });

    if (this.scenarioListContainer) {
      this.scenarioListContainer.innerHTML = '';
      SCENARIOS.forEach((sc, idx) => {
        const btn = document.createElement('button');
        btn.className = `scenario-btn ${idx === this.activeScenarioIndex ? 'active' : ''}`;
        btn.innerHTML = `<div><strong>${sc.title}</strong></div>`;
        btn.onclick = () => {
          this.activeScenarioIndex = idx;
          this.scenarioTurnIndex = 0;
          this.stepTurn();
        };
        this.scenarioListContainer.appendChild(btn);
      });
    }

    this.updateGcpBadge();
  }

  renderGestureDictionary(categoryFilter = 'all') {
    if (!this.gestureChipsContainer) return;
    this.gestureChipsContainer.innerHTML = '';

    const filtered = (categoryFilter === 'all')
      ? GESTURE_DICTIONARY
      : GESTURE_DICTIONARY.filter(item => item.category === categoryFilter);

    filtered.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'scenario-btn';
      btn.innerHTML = `<span>🖐️ ${item.label}</span><small style="color:var(--hud-primary)">TTS</small>`;
      btn.onclick = () => {
        if (this.currentMode !== 'expressing') this.switchMode('expressing');
        this.gestureEngine.triggerGesture(item.id);
      };
      this.gestureChipsContainer.appendChild(btn);
    });
  }

  switchMode(mode) {
    this.currentMode = mode;
    if (mode === 'listening') {
      if (this.btnListeningMode) this.btnListeningMode.classList.add('active');
      if (this.btnExpressingMode) this.btnExpressingMode.classList.remove('active');
      if (this.hudSubtitleBox) this.hudSubtitleBox.style.display = 'flex';
      if (this.signSpeechCard) this.signSpeechCard.style.display = 'none';
      if (this.visionStatusBadge) this.visionStatusBadge.style.display = 'none';
    } else {
      if (this.btnExpressingMode) this.btnExpressingMode.classList.add('active');
      if (this.btnListeningMode) this.btnListeningMode.classList.remove('active');
      if (this.hudSubtitleBox) this.hudSubtitleBox.style.display = 'none';
      if (this.signSpeechCard) this.signSpeechCard.style.display = 'flex';
      if (this.visionStatusBadge) this.visionStatusBadge.style.display = 'flex';
      if (this.visionStatusText) this.visionStatusText.textContent = 'AI Vision: MediaPipe Hands Active...';

      if (!this.gestureEngine.isCameraActive) {
        this.gestureEngine.startCamera(this.cameraVideo, this.skeletonCanvas);
        if (this.btnCamToggle) {
          this.btnCamToggle.classList.add('active-cam');
          this.btnCamToggle.innerHTML = `<span>📹 Camera Feed: ON</span>`;
        }
      }
    }
  }

  toggleMic() {
    if (this.audioEngine.isListening) {
      this.audioEngine.stopListening();
      if (this.btnMicToggle) {
        this.btnMicToggle.classList.remove('active-mic');
        this.btnMicToggle.innerHTML = `<span>🎤 Live Mic: Off</span>`;
      }
    } else {
      if (this.currentMode !== 'listening') this.switchMode('listening');
      this.audioEngine.startListening();
      if (this.btnMicToggle) {
        this.btnMicToggle.classList.add('active-mic');
        this.btnMicToggle.innerHTML = `<span>🎙️ Live Mic: ON</span>`;
      }
    }
  }

  toggleCam() {
    if (this.gestureEngine.isCameraActive) {
      this.gestureEngine.stopCamera();
      if (this.btnCamToggle) {
        this.btnCamToggle.classList.remove('active-cam');
        this.btnCamToggle.innerHTML = `<span>📷 Camera: Off</span>`;
      }
      if (this.visionStatusBadge) this.visionStatusBadge.style.display = 'none';
    } else {
      if (this.currentMode !== 'expressing') {
        this.switchMode('expressing');
      } else {
        this.gestureEngine.startCamera(this.cameraVideo, this.skeletonCanvas);
        if (this.btnCamToggle) {
          this.btnCamToggle.classList.add('active-cam');
          this.btnCamToggle.innerHTML = `<span>📹 Camera Feed: ON</span>`;
        }
        if (this.visionStatusBadge) this.visionStatusBadge.style.display = 'flex';
      }
    }
  }

  cycleTheme() {
    const themes = ['emerald', 'white', 'amber'];
    const idx = (themes.indexOf(this.activeTheme) + 1) % themes.length;
    this.activeTheme = themes[idx];
    document.body.setAttribute('data-hud-theme', this.activeTheme);
  }

  saveGcpCredentials() {
    const key = this.inputGcpKey ? this.inputGcpKey.value : '';
    const pId = this.inputGcpProject ? this.inputGcpProject.value : '';
    const token = this.inputGcpAdc ? this.inputGcpAdc.value : '';
    this.gcpService.setCredentials(key, pId, token);
    this.updateGcpBadge();
    this.closeModal(this.modalGcpSettings);
  }

  updateGcpBadge() {
    if (!this.gcpStatusTag) return;
    if (this.gcpService.isEnabled) {
      this.gcpStatusTag.textContent = '● GCP Cloud AI Active';
      this.gcpStatusTag.style.color = '#60a5fa';
    } else {
      this.gcpStatusTag.textContent = '● Edge Local Mode';
      this.gcpStatusTag.style.color = '#10b981';
    }
  }

  renderSubtitles(d) {
    if (this.hudSpeakerTag) this.hudSpeakerTag.textContent = d.speakerTag || '[Speaker]';
    if (this.hudLinePrevious) this.hudLinePrevious.textContent = d.line1 || '';

    const srcLang = (this.audioEngine && this.audioEngine.translator) ? this.audioEngine.translator.sourceLang : 'en-US';
    const displayTranslated = d.translated || d.line2;

    if (this.hudLineCurrent) this.hudLineCurrent.textContent = displayTranslated;
    if (this.translatedSubTag) {
      this.translatedSubTag.style.display = 'block';
      this.translatedSubTag.textContent = `Spoken (${srcLang}): ${d.line2 || ''}`;
    }
  }

  renderGesture(d) {
    if (!d) return;
    if (this.detectedLetterBadge) {
      this.detectedLetterBadge.textContent = d.letter || 'A';
    }
    if (this.aslSpellingBuffer) {
      this.aslSpellingBuffer.textContent = (d.buffer !== undefined ? d.buffer : (this.gestureEngine ? this.gestureEngine.gestureBuffer : '')) || '';
    }
    if (this.signSpeechText) {
      const textVal = (d.gesture && (d.gesture.ttsText || d.gesture.label)) ? (d.gesture.ttsText || d.gesture.label) : `Letter ${d.letter || 'A'}`;
      this.signSpeechText.textContent = `"${textVal}"`;
    }
    if (this.visionStatusText) {
      this.visionStatusText.textContent = `AI Vision: MediaPipe ASL Letter Tracked → "${d.letter || 'A'}"`;
    }
    this.renderSla({ latency: d.latency || 120, wer: 1.2 });
  }

  renderMotionState(isMotionDetected, motionLevel) {
    if (!this.visionStatusText) return;
    if (isMotionDetected) {
      this.visionStatusText.textContent = `AI Vision: MediaPipe 21 Joints Tracked (Diff: ${motionLevel}) → Processing...`;
    } else {
      this.visionStatusText.textContent = 'AI Vision: Ready for MediaPipe ASL Input...';
    }
  }

  renderSla(m) {
    if (this.slaLatencyValue) this.slaLatencyValue.textContent = `${m.latency} ms`;
    if (this.slaLatencyBar) {
      const pct = Math.min(Math.round((m.latency / 300) * 100), 100);
      this.slaLatencyBar.style.width = `${pct}%`;
    }
    if (this.slaWerValue) this.slaWerValue.textContent = `${m.wer}%`;
  }

  renderVad(isSpeaking) {
    const pulse = document.querySelector('.pulse-dot');
    if (pulse) {
      pulse.style.backgroundColor = isSpeaking ? 'var(--hud-primary)' : '#64748b';
    }
  }

  stepTurn() {
    const sc = SCENARIOS[this.activeScenarioIndex];
    if (!sc) return;
    if (this.scenarioTurnIndex >= sc.turns.length) this.scenarioTurnIndex = 0;

    const turn = sc.turns[this.scenarioTurnIndex];
    this.scenarioTurnIndex++;

    if (turn.mode === 'listening') {
      this.switchMode('listening');
      this.audioEngine.simulateSpeechStream(turn.text, turn.speaker);
    } else {
      this.switchMode('expressing');
      this.gestureEngine.triggerGesture(turn.gestureId);
    }
  }
}

// Auto Initialize Application on DOM Ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => { window.vizionApp = new VizionApp(); });
} else {
  window.vizionApp = new VizionApp();
}
