import { Link, useRoute } from "wouter";
import { ArrowRight } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function ArticleDetail() {
  const [, params] = useRoute("/articles/:slug");
  const slug = params?.slug ?? "";
  const title = slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <article>
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4">
              {title || "Article"}
            </h1>
            <p className="text-[var(--landing-text-secondary)]">
              This article is coming soon. We&apos;re working on bringing you valuable content on review management, local SEO, and reputation growth.
            </p>
          </header>

          <div
            className="rounded-2xl py-12 px-8 text-center"
            style={{
              background: "linear-gradient(135deg, var(--landing-teal-soft) 0%, rgba(46, 232, 230, 0.05) 100%)",
              border: "1px solid var(--landing-border-strong)",
            }}
          >
            <p className="text-[var(--landing-text-secondary)] mb-6">
              In the meantime, explore our <Link href="/articles" className="text-[var(--landing-accent)] font-medium hover:underline">other resources</Link> or <Link href="/features" className="text-[var(--landing-accent)] font-medium hover:underline">learn about our features</Link>.
            </p>
            <Link href="/articles" className="inline-flex items-center gap-2 font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline">
              Back to Articles
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </article>
      </div>
      <LandingFooter />
    </div>
  );
}
