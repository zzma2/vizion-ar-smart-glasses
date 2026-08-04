import { useEffect, useState } from "react";

const NAV = [
  { id: "vision", label: "Vision" },
  { id: "audio", label: "Audio" },
  { id: "design", label: "Design" },
  { id: "demo", label: "Try it" },
];

export function SiteNav({ theme = "dark" }: { theme?: "dark" | "light" }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onDark = theme === "dark";
  return (
    <header
      className={[
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "backdrop-blur-md bg-charcoal/70 border-b border-white/5"
          : "bg-transparent",
      ].join(" ")}
      role="banner"
    >
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5"
        aria-label="Primary"
      >
        <a
          href="#top"
          className={[
            "font-display text-xl tracking-widest",
            onDark ? "text-cream" : "text-foreground",
          ].join(" ")}
        >
          VIZION
        </a>
        <ul className="hidden gap-10 md:flex">
          {NAV.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={[
                  "text-xs font-medium uppercase tracking-[0.18em] transition-opacity hover:opacity-70",
                  onDark ? "text-cream/80" : "text-foreground/80",
                ].join(" ")}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <a
          href="#preorder"
          className={[
            "rounded-full border px-5 py-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors min-h-11 inline-flex items-center",
            onDark
              ? "border-cream/40 text-cream hover:bg-cream hover:text-charcoal"
              : "border-foreground/40 text-foreground hover:bg-foreground hover:text-background",
          ].join(" ")}
        >
          Pre-order
        </a>
      </nav>
    </header>
  );
}
