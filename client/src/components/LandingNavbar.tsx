import { useState, useEffect } from "react";
import { Link } from "wouter";
import { homeCopy } from "@/content/homeCopy";

export function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const { brand, nav } = homeCopy;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinkClass =
    "text-sm font-normal text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)] transition-colors no-underline";
  const primaryCtaClass =
    "inline-flex font-semibold rounded-lg px-5 py-2.5 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline";

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md border-b border-[var(--landing-border-strong)]"
          : "bg-transparent border-b border-transparent"
      }`}
      style={
        scrolled
          ? {
              background: "linear-gradient(90deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
              boxShadow: "0 1px 0 rgba(0,0,0,0.05)",
            }
          : undefined
      }
    >
      <div className="max-w-6xl mx-auto px-6 flex items-center h-14 sm:h-16">
        <div className="flex items-center gap-2 shrink-0">
          <Link href="/" className="flex items-center gap-2 no-underline group">
            <span className="font-bold text-lg text-[var(--landing-text-primary)]">{brand.name}</span>
            <span
              className="w-1.5 h-4 rounded-sm shrink-0"
              style={{ background: "var(--landing-teal)" }}
              aria-hidden
            />
          </Link>
        </div>
        <nav className="hidden sm:flex flex-1 justify-center items-center gap-8">
          {nav.links.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-6 shrink-0 ml-auto">
          <Link href={nav.ctas.secondary.href} className={navLinkClass}>
            {nav.ctas.secondary.label}
          </Link>
          <Link href={nav.ctas.primary.href} className={primaryCtaClass}>
            {nav.ctas.primary.label}
          </Link>
        </div>
      </div>
    </header>
  );
}
