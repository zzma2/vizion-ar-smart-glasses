Upgrade the Vizion/Apollo smart-glasses landing page across four fronts: a cinematic hero, an interactive product showcase, a live translation demo, and an accessibility pass. Design language (serif display + clean sans, warm cream + deep charcoal + terracotta accent) stays intact — this is an enhancement, not a redesign.

## 1. Cinematic hero

Replace the static hero with a layered, motion-driven opener.

- Full-viewport dark stage with a slow Ken-Burns push on the glasses image (subtle scale + parallax on scroll).
- Kinetic headline: "Understand every word." fades/blurs in word-by-word, then "Without hearing a sound." types in with a caret.
- Live-captions overlay floating over the lens: a looping fake transcript ("Hello, how are you today?" → "I'm doing great, thanks.") animates in as if being translated in real time, with a soft terracotta glow.
- Soft ambient audio-wave SVG pulsing behind the CTA (respects reduced-motion).
- CTA pill "Discover Apollo →" with magnetic hover and a scroll-cue chevron beneath.

## 2. Interactive product showcase

Turn the Vision / Audio / Design sections into an explorable product tour.

- Sticky section with a large glasses hero on one side and 3 tab-like anchors (Vision, Audio, Design) on the other. Scrolling swaps the active tab, animating hotspot pins on the glasses (camera, mic array, lens HUD, temple).
- Each hotspot expands on hover/focus into a micro-card: title, one-line spec, and a mini-illustration (e.g. lens shows an animated ASL→text ticker; mic shows an animated waveform; temple shows a heat-dissipation diagram).
- Stats ("91% translation accuracy", "18ms HUD latency") animate with count-up on scroll and gain a small sparkline showing improvement over prior prototypes.
- "Watch the film" gets a real lightbox modal with a placeholder video slot (ready to swap for a real MP4).

## 3. Live translation demo

A hands-on module so visitors feel the product before pre-ordering.

- Two-mode widget: "Sign → Text" and "Speak → Text".
- Sign → Text: uses the device webcam (with clear permission prompt + skip option). Frames are sampled every ~500ms and sent to a server function that calls a vision-capable chat model via Lovable AI to guess the ASL sign/phrase. Result streams into a HUD-styled caption box that mimics the in-lens overlay.
- Speak → Text: uses the mic, records short clips via MediaRecorder, sends to a server function that calls a speech-to-text model via Lovable AI, and renders the transcript with a synthesized-voice playback button (TTS via Lovable AI) to simulate the "speak naturally" flow.
- Prominent disclaimer that this is a browser demo, not on-device Apollo hardware. Graceful fallback if camera/mic denied: canned demo transcript plays.
- Rate-limited per session; shows friendly errors on 429/402 from the gateway.

## 4. Accessibility pass

Bake accessibility into every new and existing section — critical given the Deaf/HoH audience.

- Semantic landmarks: single `<main>`, `<nav>`, `<header>`, `<footer>`, `<section aria-labelledby>` on each block.
- Full keyboard nav: visible focus rings using a design token, skip-to-content link, focus-trap on the video/demo modals.
- Captions everywhere: any video element gets `<track kind="captions">`; the live-caption hero overlay is also announced via an `aria-live="polite"` region.
- ARIA labels on all icon-only buttons (play, close, tab triggers, hotspot pins).
- Reduced motion: `prefers-reduced-motion` disables Ken-Burns, typewriter, count-ups, and parallax; replaces with instant fades.
- Color contrast: audit terracotta accent on cream and on charcoal, adjust token lightness if any pair fails WCAG AA; never use color alone to convey state (add icons/text).
- Alt text on every image describing content, not filename. Decorative accents get `alt=""`.
- `<html lang="en">` (already set) and per-route `<title>`/meta unique to each section if we split routes later.
- 44×44 min tap targets on mobile; test at 320px width.
- Sign-language intro: small looping ASL welcome video in the hero corner (placeholder asset), with caption and pause control.

## Structure & routing

- Keep single-page for now with anchored sections (Hero, Vision, Audio, Design, Demo, Pre-order) plus smooth scroll and scroll-spy nav.
- Split into new components under `src/components/landing/`: `Hero`, `LiveCaptionOverlay`, `ProductShowcase`, `Hotspot`, `StatCounter`, `TranslationDemo`, `SignToText`, `SpeakToText`, `Footer`.
- Update `src/routes/index.tsx` head() with a unique title, description, og:title/description, og:type, twitter:card. Add a hero og:image once we generate the final hero render.

## Tech notes (for the technical reviewer)

- Motion: Motion for React (framer-motion successor) for orchestration; CSS transforms only, honoring `prefers-reduced-motion`.
- Scroll: IntersectionObserver for reveal + scroll-spy; `position: sticky` for the showcase.
- Live demo backend: TanStack `createServerFn` in `src/lib/translate.functions.ts` calling Lovable AI Gateway via the shared provider helper (`src/lib/ai-gateway.server.ts`). Uses a vision-capable chat model for ASL frame analysis and an STT model for speech. No new secrets — `LOVABLE_API_KEY` only. Rate-limit per IP in-memory; surface 429/402 with clear UI.
- Media capture strictly client-side; frames sent as base64 data URLs; audio as base64 webm.
- Assets: generate a new cinematic hero render and hotspot vignettes via imagegen; store under `src/assets/` as CDN-pointer JSON.
- No schema/database changes.

## Out of scope (ask before adding)

- Real Stripe pre-order checkout, email capture, testimonials, FAQ, blog, whitepaper PDF, multi-language i18n, dark/light auto-switching.

Once approved I'll implement in this order: (1) refactor into landing components + a11y baseline, (2) cinematic hero, (3) interactive showcase, (4) translation demo backend + UI, (5) final a11y + contrast audit.