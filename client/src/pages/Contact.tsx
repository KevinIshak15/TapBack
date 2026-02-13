import { Link } from "wouter";
import { ArrowRight, Mail, HelpCircle, CreditCard } from "lucide-react";
import { homeCopy } from "@/content/homeCopy";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function Contact() {
  const { bookDemo } = homeCopy;

  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              Contact RevsBoost
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              Have questions about our Google review management software? We&apos;re here to help. Choose the option that fits your needs below.
            </p>
          </header>

          <section className="grid md:grid-cols-3 gap-6 mb-20">
            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-[var(--landing-accent)]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--landing-text-primary)] mb-2">General Inquiries</h2>
              <p className="text-sm text-[var(--landing-text-secondary)] mb-4">
                Questions about features, pricing, or how RevsBoost works? Reach out and we&apos;ll get back to you promptly.
              </p>
              <a
                href="mailto:info@revsboost.com"
                className="text-sm font-medium text-[var(--landing-accent)] hover:underline"
              >
                info@revsboost.com
              </a>
            </div>

            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center mb-4">
                <HelpCircle className="w-6 h-6 text-[var(--landing-accent)]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--landing-text-primary)] mb-2">Support</h2>
              <p className="text-sm text-[var(--landing-text-secondary)] mb-4">
                Existing customers: need help with your account, integrations, or troubleshooting? Our support team is ready to assist.
              </p>
              <a
                href="mailto:support@revsboost.com"
                className="text-sm font-medium text-[var(--landing-accent)] hover:underline"
              >
                support@revsboost.com
              </a>
            </div>

            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6">
              <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center mb-4">
                <CreditCard className="w-6 h-6 text-[var(--landing-accent)]" />
              </div>
              <h2 className="text-lg font-bold text-[var(--landing-text-primary)] mb-2">Sales &amp; Demo</h2>
              <p className="text-sm text-[var(--landing-text-secondary)] mb-4">
                Want a personalized walkthrough? Book a demo and we&apos;ll show you how RevsBoost can help you get more Google reviews.
              </p>
              <a
                href={bookDemo.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--landing-accent)] hover:underline"
              >
                Book a demo
                <ArrowRight className="w-4 h-4" />
              </a>
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
                Ready to see RevsBoost in action?
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                Schedule a demo or <Link href="/signup" className="text-[var(--landing-accent)] font-medium hover:underline">start your free trial</Link>.
              </p>
              <a
                href={bookDemo.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline"
              >
                Book a Demo
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </section>
        </article>
      </div>
      <LandingFooter />
    </div>
  );
}
