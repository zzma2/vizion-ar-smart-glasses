import { useState } from "react";
import { Check, Mail, ArrowRight } from "lucide-react";

export function PreorderFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (email && email.includes("@")) {
      setSubmitted(true);
    }
  }

  return (
    <footer id="preorder" className="bg-charcoal text-charcoal-foreground" role="contentinfo">
      {/* Newsletter Subscription Section */}
      <div className="border-b border-cream/10 bg-[#e88d5a]/5 py-16 md:py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-3xl border border-terracotta/30 bg-gradient-to-br from-terracotta/20 via-terracotta/10 to-cream/[0.02] p-8 md:p-14 shadow-2xl backdrop-blur-md">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-terracotta/40 bg-terracotta/10 px-4 py-1.5 text-xs font-mono uppercase tracking-wider text-terracotta">
                <Mail className="size-3.5" aria-hidden="true" />
                Stay Connected
              </span>
              <h2 className="mt-4 font-display text-3xl font-normal leading-tight text-cream md:text-5xl">
                Subscribe to our Newsletter
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-cream/75 md:text-base">
                Join our mailing list to receive exclusive updates on Vizion Apollo smart glasses, launch announcements, early access invitations, and developer insights.
              </p>

              {submitted ? (
                <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-950/60 px-6 py-4 text-sm text-emerald-200 animate-in fade-in zoom-in duration-300">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-500 text-charcoal font-bold">
                    <Check className="size-4" aria-hidden="true" />
                  </span>
                  <span>Thank you for subscribing! We&apos;ll keep you updated on all Vizion announcements.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter a valid email address"
                    className="w-full rounded-full border border-cream/20 bg-cream/95 px-6 py-3.5 text-sm text-charcoal placeholder:text-charcoal/50 outline-none focus:border-terracotta focus:ring-2 focus:ring-terracotta/30 transition-all shadow-inner sm:w-80"
                  />
                  <button
                    type="submit"
                    className="inline-flex w-full min-h-[46px] items-center justify-center gap-2 rounded-full bg-terracotta px-8 py-3 text-sm font-semibold text-terracotta-foreground transition-all hover:bg-terracotta/90 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-terracotta/20 cursor-pointer sm:w-auto"
                  >
                    <span>SUBMIT</span>
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-20 text-center md:py-28">
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
