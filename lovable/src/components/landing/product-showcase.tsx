import { useEffect, useRef, useState } from "react";
import { Eye, MessageSquare, Mic, Cpu, Play } from "lucide-react";
import { useInView, useReducedMotion } from "@/hooks/use-motion";
import hudImg from "@/assets/apollo-still-hud.jpg";
import frontImg from "@/assets/apollo-still-front.jpg";
import hingeImg from "@/assets/apollo-still-hinge.jpg";

function CountUp({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const start = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(eased * to));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduce, to, duration]);

  return (
    <span ref={ref}>
      {n}
      {suffix}
    </span>
  );
}

type Section = {
  id: "vision" | "audio" | "design";
  eyebrow: string;
  title: string;
  body: string[];
  bullets: { icon: React.ReactNode; label: string; body: string }[];
  stats: { label: string; value: number; suffix: string }[];
};

const SECTIONS: Section[] = [
  {
    id: "vision",
    eyebrow: "The Display",
    title: "See what they say. See what they sign.",
    body: [
      "Apollo's embedded camera tracks hand movements with sub-millimeter precision, instantly translating ASL into a discreet, legible text stream on your right lens. No phone required.",
      "When speaking with hearing individuals, Apollo transcribes spoken words into text, ensuring you never miss a beat in noisy environments or group settings.",
    ],
    bullets: [
      { icon: <Eye className="size-4" aria-hidden="true" />, label: "Sub-mm hand tracking", body: "Dual IR sensors follow 21 hand landmarks at 90fps." },
      { icon: <MessageSquare className="size-4" aria-hidden="true" />, label: "HUD captions", body: "Legible amber text pinned to your right lens, out of sight lines." },
    ],
    stats: [
      { label: "Translation accuracy", value: 91, suffix: "%" },
      { label: "HUD latency", value: 18, suffix: "ms" },
    ],
  },
  {
    id: "audio",
    eyebrow: "The Audio",
    title: "Speak naturally.",
    body: [
      "For users who prefer to sign but want their conversational partner to hear spoken words, Apollo acts as a real-time interpreter. As you sign, dual-array microphones and a built-in microspeaker synthesize your signs into natural, nuanced speech.",
    ],
    bullets: [
      { icon: <Mic className="size-4" aria-hidden="true" />, label: "Dual-array microphones", body: "Isolates your voice and your conversation partner's voice from background noise." },
      { icon: <Mic className="size-4" aria-hidden="true" />, label: "Voice synthesis", body: "Customizable voice profiles that match your personality and tone." },
    ],
    stats: [
      { label: "Voice profiles", value: 24, suffix: "" },
      { label: "Noise rejection", value: 42, suffix: "dB" },
    ],
  },
  {
    id: "design",
    eyebrow: "Industrial Design",
    title: "Form follows function. Function becomes invisible.",
    body: [
      "The Apollo smart glasses were engineered from the ground up to feel like premium, classic eyewear, hiding an entire spatial computing rig inside a familiar silhouette.",
    ],
    bullets: [
      { icon: <Cpu className="size-4" aria-hidden="true" />, label: "Precision engineering", body: "Custom-machined to fit within a 6mm frame temple. Heat dissipates passively through the frame itself." },
      { icon: <Eye className="size-4" aria-hidden="true" />, label: "All-day comfort", body: "Titanium hinges, biocompatible nose pads, and a total weight under 48g." },
    ],
    stats: [
      { label: "Total weight", value: 48, suffix: "g" },
      { label: "Battery life", value: 11, suffix: "h" },
    ],
  },
];

export function ProductShowcase() {
  const [active, setActive] = useState<Section["id"]>("vision");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id as Section["id"]);
        });
      },
      { rootMargin: "-40% 0px -40% 0px", threshold: 0 },
    );
    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative bg-background">
      {SECTIONS.map((sec, idx) => (
        <section
          key={sec.id}
          id={sec.id}
          ref={(el) => {
            sectionRefs.current[sec.id] = el;
          }}
          aria-labelledby={`${sec.id}-heading`}
          className={[
            "border-b border-border/60",
            idx === 2 ? "bg-secondary/40" : "bg-background",
          ].join(" ")}
        >
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 py-28 md:grid-cols-2 md:py-36 lg:gap-24">
            <div className={idx % 2 === 1 ? "md:order-2" : ""}>
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-accent">
                {sec.eyebrow}
              </p>
              <h2
                id={`${sec.id}-heading`}
                className="mt-4 font-display text-4xl leading-[1.1] md:text-6xl"
              >
                {sec.title}
              </h2>
              <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
                {sec.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>

              <ul className="mt-8 space-y-4">
                {sec.bullets.map((b) => (
                  <li key={b.label} className="flex gap-3">
                    <span className="mt-1 grid size-8 flex-none place-items-center rounded-full bg-accent/10 text-accent">
                      {b.icon}
                    </span>
                    <div>
                      <p className="font-medium text-foreground">{b.label}</p>
                      <p className="text-sm text-muted-foreground">{b.body}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className={idx % 2 === 1 ? "md:order-1" : ""}>
              <div className="sticky top-28">
                <ShowcaseArt sectionId={sec.id} active={active === sec.id} />

                <dl className="mt-8 grid grid-cols-2 gap-4">
                  {sec.stats.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-2xl border border-border bg-card p-5"
                    >
                      <dt className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                        {s.label}
                      </dt>
                      <dd className="mt-2 font-display text-4xl text-foreground">
                        <CountUp to={s.value} suffix={s.suffix} />
                      </dd>
                    </div>
                  ))}
                </dl>

                {sec.id === "audio" && (
                  <button
                    type="button"
                    className="mt-6 inline-flex items-center gap-3 text-sm font-medium text-foreground hover:text-accent"
                    onClick={() => {
                      const el = document.getElementById("demo");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <span className="grid size-10 place-items-center rounded-full border border-foreground/30">
                      <Play className="size-4" aria-hidden="true" />
                    </span>
                    Try the voice demo
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function ShowcaseArt({ sectionId, active }: { sectionId: Section["id"]; active: boolean }) {
  const reduce = useReducedMotion();

  if (sectionId === "vision") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-charcoal">
        <img
          src={hudImg}
          alt="Apollo smart glasses with an amber heads-up display projecting a live caption onto the right lens"
          className="size-full object-cover"
          width={1600}
          height={1200}
          loading="lazy"
        />
        {/* Hotspots */}
        <Hotspot x="18%" y="42%" label="IR hand-tracking sensor" active={active} />
        <Hotspot x="66%" y="52%" label="Micro-LED HUD lens" active={active} />
        {!reduce && active && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-terracotta/10 to-transparent"
            style={{ animation: "hud-scan 3.5s linear infinite" }}
          />
        )}
      </div>
    );
  }
  if (sectionId === "audio") {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-charcoal p-10">
        <div className="absolute inset-x-0 bottom-10 flex items-end justify-center gap-2 px-10">
          {Array.from({ length: 32 }).map((_, i) => (
            <span
              key={i}
              className="w-1.5 origin-bottom rounded-full bg-terracotta/80"
              style={{
                height: `${Math.round(20 + Math.sin(i) * 40 + 40)}%`,
                animation: reduce
                  ? undefined
                  : `wave ${900 + (i % 5) * 120}ms ease-in-out ${i * 40}ms infinite`,
              }}
            />
          ))}
        </div>
        <p className="relative font-display text-3xl text-cream">
          "Would you like to grab a coffee?"
        </p>
        <p className="relative mt-2 text-sm text-cream/60">
          synthesized from ASL in 210ms
        </p>
      </div>
    );
  }
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-secondary">
      <img
        src={hingeImg}
        alt="Close view of the titanium hinge and frame temple of the Apollo smart glasses"
        className="size-full object-cover"
        width={1600}
        height={1200}
        loading="lazy"
      />
    </div>
  );
}

function Hotspot({ x, y, label, active }: { x: string; y: string; label: string; active: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="group absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: x, top: y }}
      aria-label={label}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span
        className={[
          "block size-4 rounded-full bg-terracotta ring-4 ring-terracotta/25 transition-transform",
          active ? "scale-100" : "scale-90 opacity-70",
        ].join(" ")}
      />
      <span
        className={[
          "pointer-events-none absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-charcoal/90 px-3 py-1.5 text-xs text-cream backdrop-blur transition-opacity",
          open ? "opacity-100" : "opacity-0",
        ].join(" ")}
      >
        {label}
      </span>
    </button>
  );
}
