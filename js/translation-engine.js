/**
 * Vizion Multilingual Translation Engine
 * Handles real-time translation between interlocutor's language and user's target HUD language.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'zh-CN', name: 'Mandarin (中文)', flag: '🇨🇳' },
  { code: 'pt-PT', name: 'Portuguese (Português)', flag: '🇵🇹' },
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'es-ES', name: 'Spanish (Español)', flag: '🇪🇸' },
  { code: 'fr-FR', name: 'French (Français)', flag: '🇫🇷' },
  { code: 'de-DE', name: 'German (Deutsch)', flag: '🇩🇪' },
  { code: 'ja-JP', name: 'Japanese (日本語)', flag: '🇯🇵' },
  { code: 'ar-SA', name: 'Arabic (العربية)', flag: '🇸🇦' }
];

const PHRASE_TRANSLATIONS = {
  "Hello, how can I help you today?": {
    "pt-PT": "Olá, como posso ajudá-lo hoje?",
    "zh-CN": "你好，请问今天有什么可以帮您？",
    "es-ES": "Hola, ¿cómo puedo ayudarte hoy?",
    "fr-FR": "Bonjour, comment puis-je vous aider aujourd'hui?",
    "de-DE": "Hallo, wie kann ich Ihnen heute helfen?"
  },
  "Please take a seat. The doctor will see you shortly.": {
    "pt-PT": "Por favor, sente-se. O doutor irá atendê-lo em breve.",
    "zh-CN": "请坐，医生马上就来见您。",
    "es-ES": "Por favor tome asiento. El doctor lo atenderá en breve.",
    "fr-FR": "Veuillez vous asseoir. Le médecin vous verra sous peu."
  },
  "Where are you experiencing pain right now?": {
    "pt-PT": "Onde está a sentir dor neste momento?",
    "zh-CN": "您现在哪里感到疼痛？",
    "es-ES": "¿Dónde siente dolor en este momento?",
    "fr-FR": "Où ressentez-vous de la douleur en ce moment?"
  },
  "I have prescribed troponin I tests and an electrocardiogram.": {
    "pt-PT": "Prescrevi exames de troponina I e um eletrocardiograma.",
    "zh-CN": "我为您开具了肌钙蛋白I检测和心电图检查。",
    "es-ES": "Le he recetado análisis de troponina I y un electrocardiograma."
  },
  "Thank you so much for your assistance.": {
    "pt-PT": "Muito obrigado pela sua ajuda.",
    "zh-CN": "非常感谢您的帮助。",
    "es-ES": "Muchas gracias por su asistencia.",
    "fr-FR": "Merci beaucoup pour votre aide."
  },
  "I need my prescription filled immediately.": {
    "pt-PT": "Preciso que me aviem a receita médica imediatamente.",
    "zh-CN": "我需要立即抓取开具的处方药。",
    "es-ES": "Necesito que llenen mi receta de inmediato."
  },
  "Please call an emergency doctor!": {
    "pt-PT": "Por favor, chame um médico de emergência!",
    "zh-CN": "请帮忙叫急诊医生！",
    "es-ES": "¡Por favor llame a un médico de urgencias!"
  }
};

export class TranslationEngine {
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
    if (PHRASE_TRANSLATIONS[cleanText] && PHRASE_TRANSLATIONS[cleanText][this.targetLang]) {
      return PHRASE_TRANSLATIONS[cleanText][this.targetLang];
    }

    if (this.gcpService && this.gcpService.isEnabled) {
      try {
        const cloudTranslated = await this.gcpService.translateText(cleanText, this.targetLang, this.sourceLang);
        if (cloudTranslated) return cloudTranslated;
      } catch(e) {}
    }

    // Google Translate Free GTX Web API (Unlimited & No Key Required)
    try {
      const srcIso = (this.sourceLang || 'en-US').substring(0, 2);
      const tgtIso = (this.targetLang || 'zh-CN').substring(0, 2);
      const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcIso}&tl=${tgtIso}&dt=t&q=${encodeURIComponent(cleanText)}`;
      const res = await fetch(gUrl);
      const gData = await res.json();
      if (gData && gData[0] && gData[0][0] && gData[0][0][0]) {
        return gData[0][0][0].trim();
      }
    } catch (e) {}

    return cleanText;
  }
}
