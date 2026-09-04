# 👓 Vizion Apollo — AR Smart Glasses for Sign Language Translation

> **Real-Time ASL-to-Speech & Speech-to-Subtitle Smart Eyewear Platform**  
> *Bridging the communication gap between Deaf & Hard of Hearing (DHH) individuals and the hearing world.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-vizion--apollo.vercel.app-E88D5A?style=for-the-badge&logo=vercel&logoColor=white)](https://vizion-apollo.vercel.app/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-00E5FF?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![React](https://img.shields.io/badge/React-Vite%20+%20TanStack-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)

---

## 🌟 Overview

**Vizion Apollo** is a full-stack AR smart glasses simulation platform that enables real-time bidirectional communication for DHH users. The system operates entirely on-device with zero server dependencies for core AI features.

```
                          ┌──────────────────────────────────────────────┐
                          │         Vizion Apollo AR Glasses Engine      │
                          └──────────────────────┬───────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
       🎧 LISTENING MODE                                           🖐️ EXPRESSING MODE
 (Speech ➔ AR HUD Subtitles)                               (ASL Gestures ➔ Spoken Voice)
 ─────────────────────────────                              ───────────────────────────────
 • Real-Time Speech Recognition (ASR)                       • 21-Node MediaPipe Hand Tracking
 • AR Waveguide HUD Subtitle Overlay                        • 26-Letter ASL Classifier (A–Z)
 • Live 18-Language Translation                             • 4 Phrase Gestures (HELLO, THANK YOU, MY, NAME)
 • Web Speech API (TTS + STT)                               • Dynamic Stroke Detection (J & Z)
                                                            • Text-to-Speech Audio Synthesis
```

---

## ✨ Features

### 1. 🖐️ ASL Sign Language → Voice (Expressing Mode)

- **Complete A–Z Letter Recognition**: Geometric 3D angle + distance rules classifying all 26 ASL fingerspelling letters.
- **Phrase Gestures**: Single-hand `HELLO`, `THANK YOU`, `MY` and two-hand `NAME` detection using spatial zones, motion trajectory, and multi-hand wrist-crossing algorithms.
- **Dynamic Stroke Letters**: 12-frame rolling trajectory tracking for motion-based letters `J` and `Z`.
- **Smart Disambiguation**: Strict spatial locking (chin-zone for THANK YOU, diagonal tilt for HELLO vs B, C-curve interception) to prevent cross-gesture interference.
- **Auto Word Builder**: Detects letter sequences like `M-A-R-S` and auto-groups into spoken words.
- **Real-Time TTS**: Instant speech synthesis for recognized letters and phrases.
- **Front/Rear Camera Support**: Auto-normalizes coordinates for desktop webcam, mobile front camera, and mobile rear (AR environment) camera.

### 2. 🎧 Speech → AR Subtitles (Listening Mode)

- **Live ASR Transcription**: Browser-native Web Speech API for real-time speech-to-text.
- **18-Language Translation**: Supports English, Chinese, Spanish, French, German, Portuguese, Italian, Russian, Japanese, Korean, Arabic, Hindi, Dutch, Turkish, Polish, Swedish, Vietnamese, and Thai.
- **AR HUD Overlay**: Glassmorphism translucent subtitle display simulating waveguide lens projection.

### 3. 📬 Newsletter Subscription

- **Email Capture Form**: Visitors can submit their email address via the landing page footer to stay updated on Vizion Apollo.
- **Serverless Backend**: Vercel Serverless Function (`/api/subscribe`) built and ready for Resend API integration.
- **Status — Work in Progress**: Automated welcome email delivery is not yet fully activated. Requires a `RESEND_API_KEY` environment variable set in Vercel. See [Environment Variables](#-environment-variables-optional) below.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, TanStack Router |
| **Styling** | Tailwind CSS 4, custom design tokens (Terracotta/Cream/Charcoal palette), glassmorphism |
| **Computer Vision** | MediaPipe Hands (21-node skeletal tracking, 60fps) |
| **ASL Engine** | Custom `MediaPipeASLClassifier` — geometric feature-vector classifier with phrase detection, chin-zone locking, trajectory tracking |
| **Speech** | Web Speech API (`SpeechRecognition` + `speechSynthesis`) |
| **Translation** | MyMemory Translation API |
| **Email** | Resend API via Vercel Serverless Function |
| **Deployment** | Vercel (auto-deploy from GitHub) |


---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/zzma2/vizion-ar-smart-glasses.git

# 2. Navigate to the project
cd vizion-ar-smart-glasses

# 3. Install dependencies
cd lovable
npm install

# 4. Start dev server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

> **Note**: Camera and Microphone access require a secure context (`localhost` or `https://`).

### Legacy Static Version

The root `index.html` contains an earlier standalone version that can be served directly:

```bash
npx serve .
# Open http://localhost:3000
```

---

---

## 📂 Project Structure

```
vizion-ar-smart-glasses/
├── api/
│   └── subscribe.js            # Vercel Serverless Function (Resend email)
├── lovable/                    # Main React application
│   └── src/
│       ├── components/landing/
│       │   ├── hero.tsx              # Landing hero section
│       │   ├── site-nav.tsx          # Navigation bar
│       │   ├── prototype-montage.tsx # Prototype gallery
│       │   ├── product-showcase.tsx  # Product feature showcase
│       │   ├── translation-demo.tsx  # Core ASL + Speech demo (756 lines)
│       │   └── preorder-footer.tsx   # Pre-order CTA + Newsletter subscription
│       ├── lib/
│       │   ├── asl-engine.ts         # ASL classifier engine (481 lines)
│       │   └── translate.functions.ts # Translation API helpers
│       └── routes/
│           └── index.tsx             # Main page route
├── js/                         # Legacy standalone JS modules
├── styles/                     # Legacy CSS
├── index.html                  # Legacy standalone demo
├── manifest.json               # PWA manifest
└── vercel.json                 # Vercel deployment config
```

---

## 🔑 Environment Variables (Optional)

For newsletter email delivery via Resend:

| Variable | Description |
|---|---|
| `RESEND_API_KEY` | Your [Resend](https://resend.com) API key (free tier: 100 emails/day) |

Add in Vercel Dashboard → Settings → Environment Variables.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
