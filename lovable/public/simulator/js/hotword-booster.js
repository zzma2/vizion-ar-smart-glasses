/**
 * Vizion Hot-Word Boosting Engine
 * Corrects low-confidence or misrecognized terms in high-stakes environments (Healthcare, Service, Education)
 */

export const HOTWORD_DICTIONARIES = {
  healthcare: [
    { target: "anaphylaxis", aliases: ["ana phylaxis", "anna phylaxis", "anaphylactic"] },
    { target: "echocardiogram", aliases: ["echo cardio gram", "echo program", "cardio gram"] },
    { target: "electrocardiogram", aliases: ["electro cardio gram", "ecg", "ekg"] },
    { target: "hypertension", aliases: ["hyper tension", "high tension"] },
    { target: "prescription", aliases: ["pre scription", "per scription"] },
    { target: "troponin I", aliases: ["troponin 1", "tryponine", "troponin"] },
    { target: "arrhythmia", aliases: ["ah rhythmia", "a rhythmia"] },
    { target: "ambulatory", aliases: ["am bulatory", "uncle atory"] },
    { target: "hypoglycemia", aliases: ["hypo glycemia", "hypo glycemic"] }
  ],
  service: [
    { target: "accessibility", aliases: ["access ability", "assess ability"] },
    { target: "reservation", aliases: ["re servation", "reserve ation"] },
    { target: "identification", aliases: ["ID card", "i d card", "identity card"] },
    { target: "reimbursement", aliases: ["re imbursement", "rembursement"] }
  ],
  education: [
    { target: "neuroscience", aliases: ["neuro science", "nero science"] },
    { target: "quantum mechanics", aliases: ["quantum mechanic", "quantom mechanics"] },
    { target: "differential equation", aliases: ["differential equations", "diff equation"] }
  ]
};

export class HotwordBooster {
  constructor(domain = 'healthcare') {
    this.domain = domain;
    this.activeDict = HOTWORD_DICTIONARIES[domain] || HOTWORD_DICTIONARIES.healthcare;
    this.replacementsLog = [];
  }

  setDomain(domain) {
    this.domain = domain;
    this.activeDict = HOTWORD_DICTIONARIES[domain] || HOTWORD_DICTIONARIES.healthcare;
  }

  boostText(text) {
    if (!text) return text;
    let boostedText = text;

    for (const item of this.activeDict) {
      for (const alias of item.aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'gi');
        if (regex.test(boostedText)) {
          boostedText = boostedText.replace(regex, item.target.toUpperCase());
          this.replacementsLog.push({
            original: alias,
            boosted: item.target.toUpperCase(),
            timestamp: new Date().toLocaleTimeString()
          });
        }
      }
    }

    return boostedText;
  }
}
