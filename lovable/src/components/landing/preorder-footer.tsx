export function PreorderFooter() {
  return (
    <footer id="preorder" className="bg-charcoal text-charcoal-foreground" role="contentinfo">
      <div className="mx-auto max-w-4xl px-6 py-28 text-center md:py-36">
        <h2 className="font-display text-4xl leading-[1.1] text-cream md:text-6xl">
          Be the first to experience Apollo.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-cream/70">
          Pre-orders are now open. Reserve yours today and join the movement
          toward seamless, inclusive communication.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-terracotta px-8 py-3 text-sm font-medium text-terracotta-foreground transition-transform hover:scale-[1.02]"
          >
            Pre-order now — $499
          </a>
          <a
            href="#"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-cream/30 px-8 py-3 text-sm font-medium text-cream hover:bg-cream/10"
          >
            Read the whitepaper
          </a>
        </div>
      </div>
      <div className="border-t border-cream/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-xs text-cream/50">
          <p>© {new Date().getFullYear()} Vizion, Inc. All rights reserved.</p>
          <ul className="flex gap-6">
            <li><a href="#" className="uppercase tracking-[0.18em] hover:text-cream">Privacy</a></li>
            <li><a href="#" className="uppercase tracking-[0.18em] hover:text-cream">Terms</a></li>
            <li><a href="#" className="uppercase tracking-[0.18em] hover:text-cream">Contact</a></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
