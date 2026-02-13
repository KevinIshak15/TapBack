import { Link } from "wouter";
import { ArrowRight, Shield, Sparkles, CheckCircle } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function About() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              About RevsBoost
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              RevsBoost is a modern AI-powered reputation growth platform. We help businesses get more Google reviews, manage feedback ethically, and improve their Google Business Profile ranking through genuine customer experiences.
            </p>
          </header>

          <section className="space-y-12 mb-20">
            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-4">
                Helping Businesses Grow Organically
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-4">
                We believe the best reviews come from real customers who had a great experience. RevsBoost removes friction so satisfied customers can easily share their feedback on Google. No fake reviews. No manipulation. Just a streamlined path from happy moment to 5-star review.
              </p>
              <p className="text-[var(--landing-text-secondary)]">
                Our QR code review system and AI-assisted drafting make it simple for customers to leave authentic reviews while staying in control of what they post.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--landing-accent)]" />
                Ethical Review Generation
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-4">
                RevsBoost is designed for compliance with Google&apos;s review policies. Customers always write, edit, and submit their own reviews on Google. We assist with drafting suggestions based on their input, but we never post on their behalf. This ethical approach protects your business and builds trust with customers.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[var(--landing-accent)]" />
                Built for Multi-Location Businesses
              </h2>
              <p className="text-[var(--landing-text-secondary)]">
                Whether you run one location or hundreds, RevsBoost scales with you. Our reputation management software supports multiple Google Business Profiles from a single dashboard. Track performance by location, compare insights, and grow your online presence across your entire footprint.
              </p>
            </div>

            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 md:p-8">
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[var(--landing-accent)]" />
                AI That Assists, Doesn&apos;t Replace
              </h2>
              <p className="text-[var(--landing-text-secondary)]">
                Our AI review draft generation and automatic Google review replies are tools that save you time while keeping the human touch. Customers write their own reviews; we help them get started. You can customize or approve AI-generated responses. We&apos;re here to amplify your reputation, not replace authentic engagement.
              </p>
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
                Ready to grow your reputation?
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                <Link href="/how-it-works" className="text-[var(--landing-accent)] font-medium hover:underline">See how it works</Link> or <Link href="/pricing" className="text-[var(--landing-accent)] font-medium hover:underline">view pricing</Link>.
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
