import { createFileRoute } from "@tanstack/react-router";
import { SiteNav } from "@/components/landing/site-nav";
import { Hero } from "@/components/landing/hero";
import { PrototypeMontage } from "@/components/landing/prototype-montage";
import { ProductShowcase } from "@/components/landing/product-showcase";
import { TranslationDemo } from "@/components/landing/translation-demo";
import { PreorderFooter } from "@/components/landing/preorder-footer";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Vizion Apollo — Understand every word, without hearing a sound" },
      {
        name: "description",
        content:
          "Apollo is the world's first smart eyewear that translates sign language to text on your lens and synthesizes speech from ASL. Pre-order the future of inclusive communication.",
      },
      { property: "og:title", content: "Vizion Apollo — Smart glasses that translate sign language" },
      {
        property: "og:description",
        content:
          "Live ASL-to-text on your lens. Natural speech synthesis from signs. Try the browser demo, then reserve yours.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Vizion Apollo — Understand every word" },
      {
        name: "twitter:description",
        content: "Smart eyewear that bridges signed and spoken languages.",
      },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
});

function Index() {
  return (
    <>
      <a href="#main" className="skip-link focus:skip-link-visible">
        Skip to main content
      </a>
      <SiteNav theme="dark" />
      <main id="main">
        <Hero />
        <PrototypeMontage />
        <ProductShowcase />
        <TranslationDemo />
      </main>
      <PreorderFooter />
    </>
  );
}
