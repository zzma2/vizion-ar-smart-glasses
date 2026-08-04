export function PrototypeMontage() {
  return (
    <section
      id="prototype"
      aria-labelledby="prototype-heading"
      className="relative bg-charcoal py-24 text-charcoal-foreground"
    >
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-terracotta">
              Prototype · 003
            </p>
            <h2
              id="prototype-heading"
              className="mt-2 font-display text-4xl leading-tight text-cream md:text-5xl"
            >
              The Apollo, from every angle.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-cream/70">
            A montage of the current industrial prototype — front, profile, and
            a full rotation — captured under studio light.
          </p>
        </div>

        <figure className="relative overflow-hidden rounded-2xl border border-cream/10 bg-black shadow-2xl">
          <video
            className="block h-auto w-full"
            src="/assets/apollo-montage.mp4"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Rotating montage of the Apollo smart glasses prototype: front view, side profile, and full 360-degree rotation."
          />
          <figcaption className="sr-only">
            Apollo prototype montage: front, side, and 360 rotation.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
