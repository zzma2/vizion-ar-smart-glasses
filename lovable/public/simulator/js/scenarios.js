/**
 * Vizion Interactive Scenario Driver
 * Pre-loaded multi-turn dialogues for testing both Listening Mode & Expressing Mode in high-stakes environments.
 */

export const SCENARIOS = [
  {
    id: 'healthcare-er',
    title: 'Hospital Emergency Consultation',
    domain: 'healthcare',
    description: 'High-stakes dialogue between ER Doctor and Deaf Patient with medical hot-word boosting.',
    turns: [
      { mode: 'listening', speaker: '[Dr. Miller]', text: 'Hello, I am Dr. Miller. What symptoms brought you to the emergency department today?' },
      { mode: 'expressing', gestureId: 'PAIN', text: 'Patient Signs: "I am experiencing severe pain in this location."' },
      { mode: 'listening', speaker: '[Dr. Miller]', text: 'I understand. I am ordering troponin I lab tests and an immediate electrocardiogram.' },
      { mode: 'expressing', gestureId: 'PRESCRIPTION', text: 'Patient Signs: "I need my medical prescription filled immediately."' },
      { mode: 'listening', speaker: '[Dr. Miller]', text: 'We will verify your prescription right after your echocardiogram examination.' },
      { mode: 'expressing', gestureId: 'THANK_YOU', text: 'Patient Signs: "Thank you very much for your help."' }
    ]
  },
  {
    id: 'customer-desk',
    title: 'Customer Service Window',
    domain: 'service',
    description: 'Public service counter interaction focusing on accessibility and identity verification.',
    turns: [
      { mode: 'listening', speaker: '[Clerk]', text: 'Welcome to municipal services. How may I assist you with your document application?' },
      { mode: 'expressing', gestureId: 'HELP', text: 'Patient Signs: "I need assistance right now, please help."' },
      { mode: 'listening', speaker: '[Clerk]', text: 'Of course! Please present your identification card so we can process your reimbursement.' },
      { mode: 'expressing', gestureId: 'YES', text: 'Patient Signs: "Yes, I understand and agree."' }
    ]
  },
  {
    id: 'university-lecture',
    title: 'University STEM Lecture',
    domain: 'education',
    description: 'Academic classroom captioning with technical hot-word boosting.',
    turns: [
      { mode: 'listening', speaker: '[Prof. Vance]', text: 'Today we explore quantum mechanics and differential equations in advanced neuroscience.' },
      { mode: 'listening', speaker: '[Prof. Vance]', text: 'Please ensure you review chapter four before tomorrow\'s seminar on neural computation.' }
    ]
  }
];
