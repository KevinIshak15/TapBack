import { useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import "@/styles/landing-tokens.css";
import { PricingCard } from "@/components/PricingCard";
import { PricingFAQ } from "@/components/PricingFAQ";

const basicFeatures = [
  "Custom QR templates (poster, counter card, sticker)",
  '"Great / Concern" review flow',
  "AI-assisted review draft (3 regenerations max)",
  "Real-time scan and redirect analytics",
  "Email alerts for customer concerns",
  "Unlimited review redirects",
];

const proFeatures = [
  "Everything in Basic",
  "Automatic AI-generated review replies",
  "Priority support",
];

const faqItems = [
  {
    question: "Does RevsBoost post reviews automatically?",
    answer:
      "No. Customers always review, edit, and submit their review directly on Google.",
  },
  {
    question: "What's the difference between Basic and Pro?",
    answer:
      "Pro includes automatic AI-generated review replies. Basic does not.",
  },
  {
    question: "Can I upgrade later?",
    answer: "Yes. You can switch plans anytime.",
  },
  {
    question: "What happens if a customer selects \"Concern\"?",
    answer:
      "They can submit private feedback and still leave a Google review if they choose.",
  },
  {
    question: "Is this compliant with Google policies?",
    answer:
      "Yes. RevsBoost assists with drafting but never posts on behalf of customers.",
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
          <p className="text-lg text-[var(--landing-text-secondary)] max-w-xl mx-auto mb-8">
            Choose the plan that fits your business. Upgrade anytime.
          </p>
          {/* Toggle - UI only */}
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
            price="100"
            subtext="per location / month"
            description="Everything you need to collect and manage Google reviews."
            features={basicFeatures}
            ctaLabel="Get Started with Basic"
            ctaHref="/signup"
          />
          <PricingCard
            name="Pro"
            price="150"
            subtext="per location / month"
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
    </div>
  );
}
