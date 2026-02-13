import { Link } from "wouter";
import { ArrowRight, QrCode, GitBranch, Sparkles, BarChart3 } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function HowItWorks() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              How RevsBoost Works
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              RevsBoost is a QR code review system that helps you get more Google reviews from real customers. Here&apos;s how our review management software turns happy moments into 5-star reviews.
            </p>
          </header>

          <section className="space-y-16 mb-20">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                <QrCode className="w-7 h-7 text-[var(--landing-accent)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--landing-text-primary)] mb-3">
                  Step 1: Customer Scans QR Code
                </h2>
                <p className="text-[var(--landing-text-secondary)] mb-4">
                  Place RevsBoost QR codes on posters, counter cards, or stickers at your location. Customers scan with their phone camera and land on your branded review page. No app download required, making it effortless to increase 5 star reviews.
                </p>
                <p className="text-[var(--landing-text-secondary)]">
                  Our QR code review system is designed for real customer feedback automation while staying compliant with Google guidelines.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                <GitBranch className="w-7 h-7 text-[var(--landing-accent)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--landing-text-primary)] mb-3">
                  Step 2: Smart Review Routing
                </h2>
                <p className="text-[var(--landing-text-secondary)] mb-4">
                  Customers choose &ldquo;Great&rdquo; or &ldquo;Concern.&rdquo; Happy customers get guided to leave a Google review. Those with concerns can submit private feedback first, then still leave a public review if they choose. This negative feedback routing protects your reputation and improves your Google Business Profile ranking.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                <Sparkles className="w-7 h-7 text-[var(--landing-accent)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--landing-text-primary)] mb-3">
                  Step 3: AI-Generated Review Draft
                </h2>
                <p className="text-[var(--landing-text-secondary)] mb-4">
                  Our AI review draft generation helps customers articulate their experience. They provide a few details, and RevsBoost suggests a draft they can edit before posting. Customers always review, edit, and submit on Google themselves. This customer feedback automation drives more authentic reviews without fake reviews.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-14 h-14 rounded-xl bg-[var(--landing-surface)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                <BarChart3 className="w-7 h-7 text-[var(--landing-accent)]" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-[var(--landing-text-primary)] mb-3">
                  Step 4: Insights &amp; Analytics Dashboard
                </h2>
                <p className="text-[var(--landing-text-secondary)] mb-4">
                  Track scans, draft completions, and redirect clicks in your review insights dashboard. Monitor trends, compare locations, and understand what&apos;s working. Our reputation management software gives you the data to improve your local SEO and get more Google reviews over time.
                </p>
              </div>
            </div>
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
                Start increasing your Google reviews today.
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                Join businesses using RevsBoost to grow their online reputation. <Link href="/features" className="text-[var(--landing-accent)] font-medium hover:underline">Explore features</Link> or <Link href="/pricing" className="text-[var(--landing-accent)] font-medium hover:underline">view pricing</Link>.
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
