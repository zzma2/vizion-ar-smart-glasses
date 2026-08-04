# 👓 Power Vizion: AR Smart Glasses AI Accessibility Platform

> **Bidirectional Communication Engine for DHH (Deaf & Hard of Hearing) Users**  
> *Translating World Speech to HUD Subtitles & ASL Hand Gestures to Voice Audio in Real-Time.*

[![Vercel Deployment](https://img.shields.io/badge/Deployment-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vizion-ar-smart-glasses.vercel.app/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Hand%20Tracking-00E5FF?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![Gemini 3.6 Flash](https://img.shields.io/badge/Google%20Cloud-Gemini%203.6%20Flash-4285F4?style=for-the-badge&logo=googlecloud&logoColor=white)](https://cloud.google.com)
[![Web Speech API](https://img.shields.io/badge/Web%20Speech-ASR%20%26%20TTS-FF6F00?style=for-the-badge)](https://developer.mozilla.org)

---

## 🌟 Overview & Key Capabilities

**Power Vizion** is an AR Smart Glasses simulation platform designed to bridge the communication gap between Deaf / Hard of Hearing (DHH) individuals and the hearing world. Operating on a hybrid Edge-Cloud architecture, it delivers real-time dual-mode interaction:

```
                          ┌──────────────────────────────────────────────┐
                          │   Power Vizion AR Glasses Engine             │
                          └──────────────────────┬───────────────────────┘
                                                 │
                   ┌─────────────────────────────┴─────────────────────────────┐
                   ▼                                                           ▼
       🎧 LISTENING MODE                                           🖐️ EXPRESSING MODE
 (Interlocutor Speech ➔ HUD Subtitles)                      (ASL Hand Gestures ➔ Spoken Voice Audio)
 ─────────────────────────────────────                      ───────────────────────────────────────
 • Real-Time Speech Recognition (ASR)                       • 21-Node MediaPipe Hand Landmark Tracking
 • Dual-Line Translucent Glasses HUD                        • Geometric Feature-Vector ASL Classifier (A-Z)
 • Live Multi-Language Translation                          • Dynamic Stroke Trajectory Tracking (J & Z)
 • Hotword Boosting for Medical Terms                       • Integrated Text-to-Speech (TTS) Engine
```

---

## ✨ Feature Breakdown

### 1. 🎧 Listening Mode (Speech ➔ HUD Subtitles)
- **Dual-Line Glasses Subtitle HUD**: Displays real-time current speaker utterance alongside previous conversation history in translucent glasses optics view.
- **Real-Time Translation**: Supports live translation between us English, Chinese (中文), Spanish, Japanese, French, German, and more.
- **Hotword Booster**: Built-in domain keyword booster for high-accuracy medical and daily conversation terminology.

### 2. 🖐️ Expressing Mode (ASL Gestures ➔ Voice Audio)
- **21-Node Landmark Tracking**: Powered by MediaPipe Hands for 60fps hand skeleton vector landmark extraction.
- **Complete ASL 26-Letter Recognition (A–Z)**:
  - **Fist Postures (A, S, T, N, M, E)**: Anatomical 3D depth and relative knuckle coordinate classification.
  - **Curved & Straight Shapes (C, B, O, W, F, U, V, R, K, X, L, Y, D, I)**: Precise angular and gap-distance rules.
  - **Dynamic Stroke Motion (J & Z)**: 12-frame rolling trajectory tracking for dynamic stroke gestures.
- **Universal Parity (Desktop & Mobile)**: Auto-normalizes horizontal palm coordinates for Mobile Rear Camera (Environment AR Mode), Mobile Front Camera, and Left/Right hand signing.
- **ASL Word Builder**: Integrated 3-row card layout (Header, Letter Badge + Buffer, Full-Width Spoken Output) with Text-to-Speech (TTS) audio triggering.

### 3. 🌐 Edge-Cloud Hybrid Intelligence
- **Local Edge AI Fallback**: Runs 100% in-browser without server requirements.
- **Google Cloud Agent Platform**: Optional integration with Gemini 3.6 Flash via Google Cloud Application Default Credentials (ADC) Bearer Tokens.

---

## 🛠️ Technology Stack

- **Core**: HTML5, Vanilla JavaScript (ES6 Modules)
- **Styling**: Pure CSS3 with custom variables, CSS Grid/Flexbox, glassmorphism, HUD waveguide grid overlays
- **Computer Vision**: `@mediapipe/hands`, `@mediapipe/camera_utils`
- **Audio & Speech**: HTML5 Web Speech API (`SpeechRecognition`, `speechSynthesis`)
- **Deployment**: Vercel Serverless Edge Platform

---

## 🚀 Quick Start / Local Setup

Because Power Vizion is built with zero heavy build dependencies, you can run it directly in any modern WebBrowser (Chrome, Edge, Safari, Firefox):

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/power-vizion.git

# 2. Navigate to the project directory
cd power-vizion

# 3. Serve the directory using any HTTP server (e.g., VS Code Live Server or Python)
python -m http.server 8000
# or
npx serve .

# 4. Open in browser
http://localhost:8000
```

> **Note**: Camera and Microphone access require a secure context (`localhost` or `https://`).

---

## 📱 Mobile App Installation (PWA)

**Power Vizion** can be installed directly onto your iPhone, iPad, or Android smartphone as a **standalone native-like mobile app**—no app store download required!

### 🍏 For iPhone & iPad (iOS Safari)
1. Open [https://vizion-ar-smart-glasses.vercel.app/](https://vizion-ar-smart-glasses.vercel.app/) in **Safari**.
2. Tap the **Share** button at the bottom of the screen.
3. Scroll down and select **Add to Home Screen**.
4. Tap **Add**. A standalone **Vizion AR** app icon will appear on your Home Screen!

### 🤖 For Android (Chrome / Edge / Brave)
1. Open [https://vizion-ar-smart-glasses.vercel.app/](https://vizion-ar-smart-glasses.vercel.app/) in **Chrome**.
2. Tap the **three-dot menu (⋮)** in the top right corner.
3. Tap **Install app** or **Add to Home screen**.
4. Tap **Install** to add **Vizion AR** to your app drawer and home screen.

> **Benefits**: Runs full-screen without browser address bars, remembers camera permissions, and launches instantly from your home screen.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
