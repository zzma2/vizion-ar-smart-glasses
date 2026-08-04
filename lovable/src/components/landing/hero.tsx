import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import heroImg from "@/assets/apollo-hero.jpg";
import { useReducedMotion } from "@/hooks/use-motion";

const CAPTIONS = [
  "Hello, how are you today?",
  "I'm doing great, thanks for asking.",
  "Would you like to grab a coffee?",
  "Yes, that sounds wonderful.",
];

export function Hero() {
  const reduce = useReducedMotion();
  const [captionIdx, setCaptionIdx] = useState(0);
  const [typed, setTyped] = useState("");

  // Cycle live-caption overlay
  useEffect(() => {
    if (reduce) {
      setTyped(CAPTIONS[0]);
      return;
    }
    let cancelled = false;
    const target = CAPTIONS[captionIdx];
    setTyped("");
    let i = 0;
    const tick = () => {
      if (cancelled) return;
      i++;
      setTyped(target.slice(0, i));
      if (i < target.length) {
        setTimeout(tick, 55);
      } else {
        setTimeout(() => {
          if (!cancelled) setCaptionIdx((c) => (c + 1) % CAPTIONS.length);
        }, 2400);
      }
    };
    const start = setTimeout(tick, 250);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  }, [captionIdx, reduce]);

  const words = "Understand every word.".split(" ");
  const words2 = "Without hearing a sound.".split(" ");

  return (
    <section
      id="top"
      aria-labelledby="hero-heading"
      className="relative isolate min-h-dvh overflow-hidden bg-charcoal text-charcoal-foreground"
    >
      {/* Backdrop image with slow Ken Burns */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "brightness(0.55) saturate(1.05)",
          animation: reduce ? undefined : "hero-pan 24s ease-in-out infinite alternate",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-charcoal/60 via-charcoal/40 to-charcoal"
      />

      <style>{`
        @keyframes hero-pan {
          0% { transform: scale(1.08) translate3d(-2%, -1%, 0); }
          100% { transform: scale(1.14) translate3d(2%, 1%, 0); }
        }
      `}</style>

      <div className="relative mx-auto flex min-h-dvh max-w-6xl flex-col items-center justify-center px-6 pt-32 pb-20 text-center">
        <h1
          id="hero-heading"
          className="font-display text-5xl leading-[1.05] text-cream md:text-7xl lg:text-[5.5rem]"
        >
          <span className="block">
            {words.map((w, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  opacity: reduce ? 1 : 0,
                  animation: reduce
                    ? undefined
                    : `word-in 0.8s ease-out ${0.15 + i * 0.12}s forwards`,
                  marginRight: "0.28em",
                }}
              >
                {w}
              </span>
            ))}
          </span>
          <span className="block text-cream/95">
            {words2.map((w, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  opacity: reduce ? 1 : 0,
                  animation: reduce
                    ? undefined
                    : `word-in 0.8s ease-out ${0.9 + i * 0.12}s forwards`,
                  marginRight: "0.28em",
                }}
              >
                {w}
              </span>
            ))}
          </span>
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-relaxed text-cream/75 md:text-lg">
          Apollo is the world's first eyewear that bridges signed and spoken
          languages. See sign language translated to text on your lens, and
          speak naturally through integrated audio.
        </p>

        {/* Live caption overlay — mimics the in-lens HUD */}
        <div
          className="mt-10 inline-flex items-center gap-3 rounded-full border border-terracotta/40 bg-charcoal/60 px-5 py-2.5 backdrop-blur"
          aria-live="polite"
          aria-atomic="true"
        >
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-terracotta shadow-[0_0_12px_var(--color-terracotta)]"
            style={{
              animation: reduce ? undefined : "caret-blink 1.4s ease-in-out infinite",
            }}
          />
          <span className="font-mono text-sm text-terracotta/95">
            {typed}
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-terracotta"
              style={{
                animation: reduce ? undefined : "caret-blink 0.9s steps(2) infinite",
              }}
            />
          </span>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#vision"
            className="group inline-flex min-h-12 items-center gap-2 rounded-full bg-cream px-7 py-3 text-sm font-medium tracking-wide text-charcoal transition-transform hover:scale-[1.02]"
          >
            Discover Apollo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </a>
          <a
            href="#demo"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/30 px-7 py-3 text-sm font-medium tracking-wide text-cream/90 transition-colors hover:bg-cream/10"
          >
            Try the live demo
          </a>
        </div>

        <a
          href="#vision"
          aria-label="Scroll to Vision section"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/60 hover:text-cream"
        >
          <ChevronDown
            className="size-6"
            style={{ animation: reduce ? undefined : "caret-blink 2s ease-in-out infinite" }}
          />
        </a>
      </div>
    </section>
  );
}
