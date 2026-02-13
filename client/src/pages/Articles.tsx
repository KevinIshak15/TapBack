import { Link } from "wouter";
import { ArrowRight, FileText } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

const articles = [
  {
    title: "How to Get More Google Reviews",
    description:
      "Practical strategies for increasing your Google review count. Learn how to ask at the right moment, reduce friction with QR codes, and turn satisfied customers into 5-star reviewers. Includes tips that work for local businesses and service-based industries.",
    slug: "how-to-get-more-google-reviews",
  },
  {
    title: "Best Practices for Responding to Reviews",
    description:
      "Why responding to reviews matters for your Google Business Profile ranking and customer trust. Explore templates for positive and negative reviews, timing best practices, and how AI can help you respond faster without sounding robotic.",
    slug: "best-practices-responding-reviews",
  },
  {
    title: "How Google Reviews Impact Local SEO",
    description:
      "Understand the connection between reviews, ratings, and local search visibility. Learn how review quantity, recency, and keywords influence your ranking in the local pack. Data-backed insights for improving your local SEO.",
    slug: "google-reviews-local-seo",
  },
  {
    title: "AI and the Future of Reputation Management",
    description:
      "How AI is changing review management software. From draft generation to automated replies, discover how smart tools are helping businesses scale their reputation efforts while staying authentic and compliant.",
    slug: "ai-future-reputation-management",
  },
];

export default function Articles() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              Reputation Growth Resources
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              Guides, tips, and insights to help you get more Google reviews, improve your local SEO, and build a stronger online reputation. Learn from best practices and stay ahead of trends in review management.
            </p>
          </header>

          <section className="grid md:grid-cols-2 gap-6 mb-20">
            {articles.map((article, i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 flex flex-col"
              >
                <div className="flex items-start gap-3 mb-3">
                  <FileText className="w-5 h-5 text-[var(--landing-accent)] shrink-0 mt-0.5" />
                  <h2 className="text-lg font-bold text-[var(--landing-text-primary)]">{article.title}</h2>
                </div>
                <p className="text-[var(--landing-text-secondary)] text-sm mb-4 flex-1">{article.description}</p>
                <Link
                  href={`/articles/${article.slug}`}
                  className="text-sm font-medium text-[var(--landing-accent)] hover:underline inline-flex items-center gap-1"
                >
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </section>

          <section className="py-16">
            <div
              className="rounded-2xl py-16 px-8 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, var(--landing-teal-soft) 0%, rgba(46, 232, 230, 0.05) 100%)",
                border: "1px solid var(--landing-border-strong)",
              }}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--landing-text-primary)] mb-4">
                Start growing your reviews today
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                Explore <Link href="/features" className="text-[var(--landing-accent)] font-medium hover:underline">features</Link> or <Link href="/pricing" className="text-[var(--landing-accent)] font-medium hover:underline">view pricing</Link>.
              </p>
              <Link href="/signup" className="inline-flex items-center gap-2 font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </section>
        </article>
      </div>
      <LandingFooter />
    </div>
  );
}
