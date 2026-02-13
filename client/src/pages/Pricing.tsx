import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import "@/styles/landing-tokens.css";
import { PricingCard } from "@/components/PricingCard";
import { PricingFAQ } from "@/components/PricingFAQ";
import { LandingFooter } from "@/components/LandingFooter";

const basicFeatures = [
  "QR code review system (posters, counter cards, stickers)",
  "AI review draft generation (3 regenerate limit)",
  "Insights dashboard with real-time analytics",
  "Negative feedback routing with email alerts",
  "Unlimited review redirects",
  "Multi-location support (charged per location)",
];

const proFeatures = [
  "Everything in Basic",
  "Automatic AI-powered Google review replies",
  "Priority support",
];

const faqItems = [
  {
    question: "Can I manage multiple locations?",
    answer:
      "Yes. RevsBoost supports multi-business management. Each location is charged separately. You can manage all locations from a single dashboard.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. No long-term contracts. You can cancel your subscription at any time. Your data remains accessible during the billing period.",
  },
  {
    question: "Does this integrate with Google Business Profile?",
    answer:
      "RevsBoost directs customers to your Google review link. Customers post reviews directly on Google. We do not post on your behalf, ensuring full compliance with Google's policies.",
  },
  {
    question: "Is pricing charged per business location?",
    answer:
      "Yes. Pricing is charged per business location. Basic is $100/month per location, Pro is $150/month per location. Add as many locations as you need.",
  },
];

export default function Pricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* 1. Pricing Hero */}
        <section className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
            Simple pricing. No surprises.
          </h1>
          <p className="text-lg text-[var(--landing-text-secondary)] max-w-xl mx-auto mb-2">
            Choose the plan that fits your business. Upgrade anytime.
          </p>
          <p className="text-sm text-[var(--landing-text-muted)] mb-8">
            Charged per business location.
          </p>
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[var(--landing-surface)] border border-[var(--landing-border)]">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                !isAnnual
                  ? "text-white bg-[var(--landing-accent)]"
                  : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isAnnual
                  ? "text-white bg-[var(--landing-accent)]"
                  : "text-[var(--landing-text-secondary)] hover:text-[var(--landing-text-primary)]"
              }`}
            >
              Annual (save 2 months)
            </button>
          </div>
        </section>

        {/* 2. Pricing Cards */}
        <section className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-16">
          <PricingCard
            name="Basic"
            price={isAnnual ? "1,000" : "100"}
            subtext={isAnnual ? "per location / year (save 2 months)" : "per location / month"}
            description="Everything you need to collect and manage Google reviews."
            features={basicFeatures}
            ctaLabel="Get Started with Basic"
            ctaHref="/signup"
          />
          <PricingCard
            name="Pro"
            price={isAnnual ? "1,500" : "150"}
            subtext={isAnnual ? "per location / year (save 2 months)" : "per location / month"}
            description="For businesses that want automated review engagement."
            features={proFeatures}
            ctaLabel="Upgrade to Pro"
            ctaHref="/signup"
            highlight
            badge="Most Popular"
          />
        </section>

        {/* 3. Comparison Note */}
        <section className="mb-20">
          <div className="h-px bg-[var(--landing-border-strong)] mb-8" />
          <p className="text-center text-sm text-[var(--landing-text-muted)] max-w-2xl mx-auto">
            Both plans include: Unlimited QR template downloads · Customers
            remain in control of posting · No contracts · Cancel anytime
          </p>
        </section>

        {/* 4. FAQ */}
        <section className="mb-24">
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--landing-text-primary)] text-center mb-10">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl mx-auto">
            <PricingFAQ items={faqItems} />
          </div>
        </section>

        {/* 5. Final CTA */}
        <section className="py-16 md:py-24 px-6">
          <div
            className="max-w-6xl mx-auto rounded-2xl py-16 px-8 text-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, var(--landing-teal-soft) 0%, rgba(46, 232, 230, 0.05) 100%)",
              border: "1px solid var(--landing-border-strong)",
            }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(46, 232, 230, 0.1) 0%, transparent 70%)",
              }}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-[var(--landing-text-primary)] relative mb-2">
              Start collecting better reviews today.
            </h2>
            <p className="text-[var(--landing-text-secondary)] relative mb-6 max-w-xl mx-auto">
              Generate your first QR template in minutes.
            </p>
            <Link href="/signup" className="relative inline-block">
              <button className="inline-flex items-center gap-2 font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </section>
      </div>
      <LandingFooter />
    </div>
  );
}
