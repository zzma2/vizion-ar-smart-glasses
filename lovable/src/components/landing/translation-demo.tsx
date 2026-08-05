import { useEffect, useRef, useState } from "react";
import { Mic, Camera, Loader2, Square, AlertCircle, RotateCcw, Volume2, VolumeX, Trash2, Delete, Play, Languages } from "lucide-react";
import { MediaPipeASLClassifier, TTSEngine, LandmarkHistoryItem } from "@/lib/asl-engine";

type Mode = "sign" | "speak";

export const SUPPORTED_LANGUAGES = [
  { code: "en-US", name: "English (US)", flag: "🇺🇸" },
  { code: "zh-CN", name: "Mandarin (中文)", flag: "🇨🇳" },
  { code: "es-ES", name: "Spanish (Español)", flag: "🇪🇸" },
  { code: "fr-FR", name: "French (Français)", flag: "🇫🇷" },
  { code: "de-DE", name: "German (Deutsch)", flag: "🇩🇪" },
  { code: "pt-PT", name: "Portuguese (Português)", flag: "🇵🇹" },
  { code: "it-IT", name: "Italian (Italiano)", flag: "🇮🇹" },
  { code: "ru-RU", name: "Russian (Русский)", flag: "🇷🇺" },
  { code: "ja-JP", name: "Japanese (日本語)", flag: "🇯🇵" },
  { code: "ko-KR", name: "Korean (한국어)", flag: "🇰🇷" },
  { code: "ar-SA", name: "Arabic (العربية)", flag: "🇸🇦" },
  { code: "hi-IN", name: "Hindi (हिन्दी)", flag: "🇮🇳" },
  { code: "nl-NL", name: "Dutch (Nederlands)", flag: "🇳🇱" },
  { code: "tr-TR", name: "Turkish (Türkçe)", flag: "🇹🇷" },
  { code: "pl-PL", name: "Polish (Polski)", flag: "🇵🇱" },
  { code: "sv-SE", name: "Swedish (Svenska)", flag: "🇸🇪" },
  { code: "vi-VN", name: "Vietnamese (Tiếng Việt)", flag: "🇻🇳" },
  { code: "th-TH", name: "Thai (ไทย)", flag: "🇹🇭" },
];

async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !text.trim()) return "";
  if (targetLang === "en-US") return text;

  try {
    const tgtIso = targetLang.startsWith("zh") ? targetLang : targetLang.split("-")[0];
    const gUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${tgtIso}&dt=t&q=${encodeURIComponent(text.trim())}`;
    const res = await fetch(gUrl);
    const gData = await res.json();
    if (gData && gData[0]) {
      const translatedParts = gData[0]
        .filter((item: any) => item && item[0])
        .map((item: any) => item[0])
        .join("");
      if (translatedParts) return translatedParts.trim();
    }
  } catch (e) {}

  return text;
}

export function TranslationDemo() {
  const [mode, setMode] = useState<Mode>("speak");

  return (
    <section
      id="demo"
      aria-labelledby="demo-heading"
      className="border-b border-border/60 bg-charcoal text-charcoal-foreground"
    >
      <div className="mx-auto max-w-6xl px-6 py-28 md:py-36">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-terracotta">
          Live Demo
        </p>
        <h2
          id="demo-heading"
          className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] text-cream md:text-6xl"
        >
          Feel the translation. Right here, in your browser.
        </h2>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/70">
          A taste of what Apollo does on-device. Speak into your mic to see
          real-time transcription and multilingual AR subtitles, or show an ASL sign to your camera to see
          Apollo interpret it into text and audio. This is a browser preview — 
          the real product runs entirely on the glasses.
        </p>

        <div
          role="tablist"
          aria-label="Demo mode"
          className="mt-10 inline-flex rounded-full border border-cream/20 bg-cream/5 p-1"
        >
          {(
            [
              { id: "speak", label: "Speak → Text", icon: <Mic className="size-4" aria-hidden="true" /> },
              { id: "sign", label: "Sign → Audio", icon: <Camera className="size-4" aria-hidden="true" /> },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={mode === t.id}
              onClick={() => setMode(t.id)}
              className={[
                "inline-flex min-h-11 items-center gap-2 rounded-full px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors",
                mode === t.id
                  ? "bg-cream text-charcoal"
                  : "text-cream/70 hover:text-cream",
              ].join(" ")}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6">
          {mode === "speak" ? <SpeakToText /> : <SignToAudio />}
        </div>
      </div>
    </section>
  );
}

function TranscriptBox({
  text,
  translatedText,
  placeholder,
  live,
}: {
  text: string;
  translatedText?: string;
  placeholder: string;
  live?: boolean;
}) {
  return (
    <div
      className="min-h-[140px] rounded-2xl border border-terracotta/40 bg-charcoal/70 p-6 font-mono text-base text-terracotta shadow-[inset_0_0_60px_rgba(232,141,90,0.08)] flex flex-col justify-between"
      aria-live={live ? "polite" : "off"}
      aria-atomic="true"
    >
      <div>
        {text ? (
          <div>
            <div className="text-terracotta">{text}</div>
            {translatedText && translatedText !== text && (
              <div className="mt-2 text-sm text-cream/90 border-t border-terracotta/20 pt-2 font-sans">
                <span className="text-xs uppercase tracking-wider text-terracotta/80 mr-2 font-mono">[Translation]:</span>
                {translatedText}
              </div>
            )}
          </div>
        ) : (
          <span className="text-cream/40">{placeholder}</span>
        )}
      </div>
    </div>
  );
}

function ErrorLine({ message }: { message: string }) {
  return (
    <p role="alert" className="mt-3 inline-flex items-center gap-2 text-sm text-terracotta">
      <AlertCircle className="size-4" aria-hidden="true" />
      {message}
    </p>
  );
}

function SpeakToText() {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [translated, setTranslated] = useState("");
  const [targetLang, setTargetLang] = useState("zh-CN");
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const activeRef = useRef(false);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  useEffect(() => {
    if (!transcript) {
      setTranslated("");
      return;
    }
    let isCurrent = true;
    translateText(transcript, targetLang).then((res) => {
      if (isCurrent) setTranslated(res);
    });
    return () => { isCurrent = false; };
  }, [transcript, targetLang]);

  function startListening() {
    setError(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onstart = () => {
          activeRef.current = true;
          setListening(true);
        };

        recognition.onresult = (event: any) => {
          let interimText = "";
          let finalText = "";

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalText += event.results[i][0].transcript;
            } else {
              interimText += event.results[i][0].transcript;
            }
          }

          const raw = finalText || interimText;
          if (raw) {
            setTranscript(raw);
          }
        };

        recognition.onerror = (err: any) => {
          if (err.error !== "no-speech") {
            setError("Speech recognition notice: " + err.error);
          }
        };

        recognition.onend = () => {
          if (activeRef.current) {
            try { recognition.start(); } catch (e) {}
          } else {
            setListening(false);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        setError("Microphone permission denied or Web Speech API unavailable.");
      }
    } else {
      setError("Web Speech API is unavailable in this browser. Please use Chrome, Edge, or Safari.");
    }
  }

  function stopListening() {
    activeRef.current = false;
    setListening(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
  }

  return (
    <div className="rounded-3xl border border-cream/10 bg-cream/[0.02] p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          {!listening ? (
            <button
              type="button"
              onClick={startListening}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-medium text-terracotta-foreground transition-transform hover:scale-[1.02]"
            >
              <Mic className="size-4" aria-hidden="true" />
              Start speaking
            </button>
          ) : (
            <button
              type="button"
              onClick={stopListening}
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-charcoal"
            >
              <Square className="size-4 fill-current" aria-hidden="true" />
              Stop listening
            </button>
          )}

          <div className="inline-flex items-center gap-2 rounded-full border border-terracotta/40 bg-charcoal/80 px-3.5 py-1.5 text-xs font-mono text-terracotta shadow-sm">
            <span className={`size-2 rounded-full ${listening ? "bg-terracotta animate-pulse" : "bg-cream/40"}`} />
            <span>AR Subtitles · Listening Mode</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-cream/5 px-3 py-1.5 text-xs font-mono text-cream">
            <Languages className="size-3.5 text-terracotta" />
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="bg-transparent text-cream outline-none cursor-pointer pr-1"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-charcoal text-cream">
                  {lang.flag} {lang.name}
                </option>
              ))}
            </select>
          </div>

          {transcript && (
            <button
              type="button"
              onClick={() => { setTranscript(""); setTranslated(""); }}
              className="text-xs text-cream/60 hover:text-terracotta transition-colors ml-2"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="mt-6">
        <TranscriptBox
          text={transcript}
          translatedText={translated}
          placeholder="Speak into your microphone. Your words will transcribe and translate in real-time onto your in-lens AR Subtitles HUD."
          live
        />
      </div>

      {error && <ErrorLine message={error} />}
    </div>
  );
}

function SignToAudio() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [buffer, setBuffer] = useState("");
  const [currentGesture, setCurrentGesture] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const classifierRef = useRef<MediaPipeASLClassifier | null>(null);
  const ttsRef = useRef<TTSEngine | null>(null);
  const landmarkHistoryRef = useRef<LandmarkHistoryItem[]>([]);

  const cameraInstanceRef = useRef<any>(null);
  const handsInstanceRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<boolean>(false);
  const holdCountRef = useRef<number>(0);
  const lastDetectedRef = useRef<string>("A");
  const lastAppendedRef = useRef<string>("");
  const lastTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    classifierRef.current = new MediaPipeASLClassifier();
    ttsRef.current = new TTSEngine();
  }, []);

  useEffect(() => {
    if (ttsRef.current) {
      ttsRef.current.setMuted(isMuted);
    }
  }, [isMuted]);

  const loadMediaPipeScripts = async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if ((window as any).Hands && (window as any).Camera) return true;

    return new Promise((resolve) => {
      const loadScript = (src: string) => {
        return new Promise<void>((res, rej) => {
          if (document.querySelector(`script[src="${src}"]`)) {
            res();
            return;
          }
          const s = document.createElement("script");
          s.src = src;
          s.crossOrigin = "anonymous";
          s.onload = () => res();
          s.onerror = () => rej();
          document.head.appendChild(s);
        });
      };

      Promise.all([
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js"),
        loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js"),
      ])
        .then(() => resolve(true))
        .catch(() => resolve(false));
    });
  };

  async function startCameraStream(mode: "user" | "environment") {
    setError(null);
    setLoading(true);

    const loaded = await loadMediaPipeScripts();
    if (!loaded || !(window as any).Hands) {
      setError("Failed to load MediaPipe ASL tracking model.");
      setLoading(false);
      return;
    }

    try {
      activeRef.current = true;

      if (!handsInstanceRef.current) {
        const hands = new (window as any).Hands({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
        });

        hands.setOptions({
          maxNumHands: 2, // Enable Dual Hand Tracking!
          modelComplexity: 1,
          minDetectionConfidence: 0.60,
          minTrackingConfidence: 0.60,
        });

        hands.onResults(onResults);
        handsInstanceRef.current = hands;
      }

      if (videoRef.current && (window as any).Camera) {
        videoRef.current.setAttribute("playsinline", "true");
        videoRef.current.setAttribute("muted", "true");

        const camera = new (window as any).Camera(videoRef.current, {
          onFrame: async () => {
            if (activeRef.current && handsInstanceRef.current && videoRef.current) {
              try {
                await handsInstanceRef.current.send({ image: videoRef.current });
              } catch (e) {}
            }
          },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: mode,
        });

        cameraInstanceRef.current = camera;
        await camera.start();
        setReady(true);
      }
    } catch (err) {
      setError("Camera permission denied or camera unavailable.");
    } finally {
      setLoading(false);
    }
  }

  function stopCameraStream() {
    activeRef.current = false;
    if (cameraInstanceRef.current) {
      try {
        cameraInstanceRef.current.stop();
      } catch (e) {}
      cameraInstanceRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      try {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        videoRef.current.srcObject = null;
      } catch (e) {}
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {}
      streamRef.current = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setReady(false);
  }

  async function toggleCameraFacing() {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);

    if (ready) {
      stopCameraStream();
      await new Promise((resolve) => setTimeout(resolve, 250));
      await startCameraStream(nextMode);
    }
  }

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  function playAudioBuffer() {
    if (!buffer.trim()) return;
    if (ttsRef.current) {
      ttsRef.current.speak(buffer.trim());
    }
  }

  function onResults(results: any) {
    if (!activeRef.current || !canvasRef.current || !videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const width = (canvas.width = video.videoWidth || 640);
      const height = (canvas.height = video.videoHeight || 480);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);

      if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const HAND_CONNECTIONS = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [5, 9], [9, 10], [10, 11], [11, 12],
          [9, 13], [13, 14], [14, 15], [15, 16],
          [13, 17], [0, 17], [17, 18], [18, 19], [19, 20]
        ];

        // Draw HUD hand skeleton for ALL detected hands (both hands!)
        results.multiHandLandmarks.forEach((landmarks: any) => {
          ctx.lineWidth = 3;
          ctx.strokeStyle = "#e88d5a";
          ctx.shadowColor = "#e88d5a";
          ctx.shadowBlur = 10;

          HAND_CONNECTIONS.forEach(([i, j]) => {
            const p1 = landmarks[i];
            const p2 = landmarks[j];
            ctx.beginPath();
            ctx.moveTo(p1.x * width, p1.y * height);
            ctx.lineTo(p2.x * width, p2.y * height);
            ctx.stroke();
          });

          ctx.shadowBlur = 0;
          landmarks.forEach((p: any, idx: number) => {
            const isFingertip = idx === 4 || idx === 8 || idx === 12 || idx === 16 || idx === 20;
            ctx.fillStyle = isFingertip ? "#faf8f5" : "#e88d5a";
            ctx.beginPath();
            ctx.arc(p.x * width, p.y * height, isFingertip ? 6 : 4, 0, 2 * Math.PI);
            ctx.fill();
          });
        });

        const primaryLandmarks = results.multiHandLandmarks[0];
        if (!landmarkHistoryRef.current) landmarkHistoryRef.current = [];
        landmarkHistoryRef.current.push({ time: Date.now(), landmarks: primaryLandmarks });
        if (landmarkHistoryRef.current.length > 12) landmarkHistoryRef.current.shift();

        const isRear = facingMode === "environment";
        const detected = classifierRef.current?.classifyLandmarks(
          primaryLandmarks,
          isRear,
          landmarkHistoryRef.current,
          width,
          height,
          results.multiHandLandmarks
        ) || "A";

        setCurrentGesture(detected);

        const now = Date.now();
        if (detected === lastDetectedRef.current) {
          holdCountRef.current++;
        } else {
          lastDetectedRef.current = detected;
          holdCountRef.current = 1;
        }

        const isMobileDevice = typeof window !== "undefined" && window.innerWidth <= 768;
        const isPhraseGesture = detected.length > 1;
        // Fast responsive letter typing (5 frames ~150ms) and instant phrase recognition (3 frames ~90ms)
        const requiredHoldCount = isPhraseGesture ? 3 : (isMobileDevice ? 4 : 5);

        if (holdCountRef.current >= requiredHoldCount) {
          const minTypingInterval = 1000;
          if (now - lastTimeRef.current >= minTypingInterval) {
            if (detected !== lastAppendedRef.current || now - lastTimeRef.current > 2500) {
              lastTimeRef.current = now;
              lastAppendedRef.current = detected;

              const isPhrase = detected.length > 1;
              setBuffer((prev) => {
                let updated = isPhrase
                  ? (prev.endsWith(" ") || prev.length === 0 ? "" : " ") + prev + " " + detected + " "
                  : prev + detected;

                // Auto-detect "M A R S" sequence in spelled letters -> append " Mars " & speak "Mars"
                const lettersOnly = updated.replace(/[^A-Za-z]/g, "").toUpperCase();
                if (lettersOnly.endsWith("MARS") && !updated.includes("Mars")) {
                  updated = updated + " Mars ";
                  if (ttsRef.current) {
                    ttsRef.current.speak("Mars");
                  }
                }

                return updated;
              });

              if (isPhrase && ttsRef.current) {
                if (detected === "NAME") {
                  ttsRef.current.speak("Name is");
                } else {
                  ttsRef.current.speak(detected);
                }
              }
            }
          }
        }
      } else {
        setCurrentGesture(null);
      }
    } catch (e) {
      console.warn("Frame rendering gracefully handled:", e);
    }
  }

  return (
    <div className="rounded-3xl border border-cream/10 bg-cream/[0.02] p-6 md:p-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-black border border-cream/10">
          <video
            ref={videoRef}
            className="size-full object-cover"
            muted
            playsInline
            aria-label="Camera preview for sign recognition"
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 size-full pointer-events-none"
          />

          {!ready && (
            <div className="absolute inset-0 grid place-items-center text-sm text-cream/60">
              {loading ? (
                <div className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin text-terracotta" />
                  Starting Apollo HUD Camera…
                </div>
              ) : (
                "Camera off — Click Enable to start sign language translation"
              )}
            </div>
          )}

          {ready && currentGesture && (
            <div className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full border border-terracotta/40 bg-charcoal/80 px-3 py-1 text-xs font-mono text-terracotta backdrop-blur-sm shadow-md">
              <span className="size-2 rounded-full bg-terracotta animate-pulse" />
              {currentGesture.length > 1 ? `Phrase: ${currentGesture}` : `ASL Letter: ${currentGesture}`}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between gap-6">
          <div className="flex flex-wrap items-center gap-3">
            {!ready ? (
              <button
                type="button"
                onClick={() => startCameraStream(facingMode)}
                disabled={loading}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-6 py-3 text-sm font-medium text-terracotta-foreground transition-transform hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                {loading ? "Starting camera…" : "Enable camera"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={stopCameraStream}
                  className="inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-6 py-3 text-sm font-medium text-charcoal transition-transform hover:scale-[1.02]"
                >
                  <Square className="size-4 fill-current" />
                  Stop camera
                </button>

                <button
                  type="button"
                  onClick={toggleCameraFacing}
                  title="Flip camera (Front / Rear)"
                  className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-sm font-medium text-cream hover:bg-cream/10 transition-colors"
                >
                  <RotateCcw className="size-4" />
                  Flip
                </button>
              </>
            )}

            {buffer.trim() && (
              <button
                type="button"
                onClick={playAudioBuffer}
                title="Synthesize and play audio for assembled text"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-5 py-3 text-sm font-medium text-terracotta-foreground transition-transform hover:scale-[1.02] shadow-md"
              >
                <Play className="size-4 fill-current" />
                Speak Audio
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute TTS Audio" : "Mute TTS Audio"}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-sm font-medium text-cream hover:bg-cream/10 transition-colors"
            >
              {isMuted ? <VolumeX className="size-4 text-cream/50" /> : <Volume2 className="size-4 text-terracotta" />}
            </button>

            {buffer && (
              <>
                <button
                  type="button"
                  onClick={() => setBuffer((prev) => prev.slice(0, -1))}
                  title="Backspace"
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-xs font-medium text-cream/70 hover:text-cream transition-colors"
                >
                  <Delete className="size-4" />
                  Backspace
                </button>

                <button
                  type="button"
                  onClick={() => setBuffer("")}
                  title="Clear Transcript"
                  className="inline-flex min-h-12 items-center gap-1.5 rounded-full border border-cream/20 bg-cream/5 px-4 py-3 text-xs font-medium text-cream/70 hover:text-terracotta transition-colors"
                >
                  <Trash2 className="size-4" />
                  Clear
                </button>
              </>
            )}
          </div>

          <TranscriptBox
            text={buffer}
            placeholder="Show ASL signs to the camera. Spell out words steady & slow, then click 'Speak Audio' to synthesize speech."
            live
          />
        </div>
      </div>

      {error && <ErrorLine message={error} />}

      <p className="mt-6 text-xs text-cream/50">
        Browser demo preview powered by MediaPipe on-device ASL tracking & Apollo translation models. Nothing is stored or uploaded.
      </p>
    </div>
  );
}
