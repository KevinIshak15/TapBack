import { useEffect, useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import {
  BarChart3,
  QrCode,
  Star,
  Building2,
  LayoutGrid,
  TrendingUp,
  MessageSquare,
  Bell,
  FileImage,
  Sparkles,
  Shield,
  LayoutDashboard,
} from "lucide-react";
import "@/styles/landing-tokens.css";
import { LaptopMockup } from "@/components/LaptopMockup";
import { PricingCard } from "@/components/PricingCard";
import { LandingFooter } from "@/components/LandingFooter";
import { homeCopy } from "@/content/homeCopy";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const featureIcons = [FileImage, Sparkles, Shield, LayoutDashboard];

export default function Home() {
  const { hero, howItWorks, features, insights, testimonials, pricing, bookDemo, finalCta } = homeCopy;
  const [isAnnual, setIsAnnual] = useState(false);

  // Scroll to hash on mount (e.g. after nav from /pricing to /#pricing)
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      {/* Hero */}
      <section className="min-h-[100vh] flex flex-col items-center justify-center px-6 pt-8 pb-16 gap-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-6xl mx-auto text-center flex flex-col items-center gap-8"
        >
          <motion.h1
            variants={itemVariants}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--landing-text-primary)] leading-tight max-w-4xl"
          >
            {hero.headline}
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-lg text-[var(--landing-text-secondary)] max-w-2xl"
          >
            {hero.subheadline}
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href={hero.ctas.primary.href}
              className="inline-flex font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline"
            >
              {hero.ctas.primary.label}
            </Link>
            <Link
              href={hero.ctas.secondary.href}
              className="inline-flex font-semibold rounded-lg px-6 py-3 text-sm border border-[var(--landing-border)] text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface)] transition-colors no-underline"
            >
              {hero.ctas.secondary.label}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          id="demo"
          className="w-full flex justify-center flex-1 min-h-0 px-2 scroll-mt-20"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.42, 0, 0.58, 1] }}
        >
          <LaptopMockup />
        </motion.div>
      </section>

      {/* How it works */}
      <section id={howItWorks.id} className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-[var(--landing-accent)] uppercase tracking-wide text-center mb-2">
            {howItWorks.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-3">
            {howItWorks.title}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-center max-w-2xl mx-auto mb-12">
            {howItWorks.subtitle}
          </p>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {howItWorks.steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface)] border border-[var(--landing-border)] flex items-center justify-center">
                  {i === 0 && <Building2 className="w-6 h-6 text-[var(--landing-accent)]" />}
                  {i === 1 && <QrCode className="w-6 h-6 text-[var(--landing-accent)]" />}
                  {i === 2 && <LayoutGrid className="w-6 h-6 text-[var(--landing-accent)]" />}
                </div>
                <h3 className="font-semibold text-[var(--landing-text-primary)]">{step.title}</h3>
                <p className="text-sm text-[var(--landing-text-secondary)] max-w-xs">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id={features.id} className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-[var(--landing-accent)] uppercase tracking-wide text-center mb-2">
            {features.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-12">
            {features.title}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.items.map((item, i) => {
              const Icon = featureIcons[i] ?? BarChart3;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[var(--landing-accent)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[var(--landing-text-primary)] mb-1">{item.title}</h3>
                    <p className="text-sm text-[var(--landing-text-secondary)]">{item.body}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[var(--landing-text-muted)] text-center mt-8 max-w-2xl mx-auto">
            {features.complianceNote}
          </p>
        </div>
      </section>

      {/* Insights */}
      <section id={insights.id} className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-[var(--landing-accent)] uppercase tracking-wide text-center mb-2">
            {insights.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-3">
            {insights.title}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-center max-w-2xl mx-auto mb-12">
            {insights.subtitle}
          </p>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] aspect-video flex items-center justify-center min-h-[280px]">
              <div className="flex flex-col items-center gap-3 text-[var(--landing-text-muted)]">
                <BarChart3 className="w-16 h-16 opacity-50" />
                <span className="text-sm">Dashboard preview</span>
              </div>
            </div>
            <div className="flex flex-col gap-6">
              {insights.bullets.map((bullet, i) => {
                const icons = [BarChart3, TrendingUp, MessageSquare, Bell];
                const Icon = icons[i] ?? BarChart3;
                return (
                  <div
                    key={i}
                    className="flex items-start gap-4 py-3 border-b border-[var(--landing-border)] last:border-0"
                  >
                    <Icon className="w-5 h-5 text-[var(--landing-accent)] shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-[var(--landing-text-primary)] text-sm">{bullet.title}</h3>
                      <p className="text-sm text-[var(--landing-text-secondary)] mt-0.5">{bullet.body}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-[var(--landing-text-muted)] text-center mt-8 max-w-2xl mx-auto">
            {insights.disclaimer}
          </p>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <p className="text-sm font-semibold text-[var(--landing-accent)] uppercase tracking-wide text-center mb-2">
            {testimonials.eyebrow}
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-12">
            {testimonials.title}
          </h2>
          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {testimonials.items.map((t, i) => (
              <div
                key={i}
                className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 flex flex-col gap-4 min-h-[180px]"
              >
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((j) => (
                    <Star key={j} className="w-4 h-4 fill-current" strokeWidth={0} />
                  ))}
                </div>
                <p className="text-sm text-[var(--landing-text-secondary)] flex-1">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[var(--landing-text-primary)] text-sm">{t.name}</p>
                  <p className="text-xs text-[var(--landing-text-muted)]">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id={pricing.id} className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] text-center mb-3">
            {pricing.title}
          </h2>
          <p className="text-[var(--landing-text-secondary)] text-center max-w-xl mx-auto mb-8">
            {pricing.subtitle}
          </p>
          <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-[var(--landing-surface)] border border-[var(--landing-border)] mx-auto mb-12 flex justify-center">
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
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-8">
            <PricingCard
              name={pricing.basic.name}
              price={isAnnual ? pricing.basic.priceAnnual : pricing.basic.price}
              subtext={isAnnual ? pricing.basic.subtextAnnual : pricing.basic.subtext}
              description={pricing.basic.description}
              features={pricing.basic.features}
              ctaLabel={pricing.basic.ctaLabel}
              ctaHref={pricing.basic.ctaHref}
            />
            <PricingCard
              name={pricing.pro.name}
              price={isAnnual ? pricing.pro.priceAnnual : pricing.pro.price}
              subtext={isAnnual ? pricing.pro.subtextAnnual : pricing.pro.subtext}
              description={pricing.pro.description}
              features={pricing.pro.features}
              ctaLabel={pricing.pro.ctaLabel}
              ctaHref={pricing.pro.ctaHref}
              highlight
              badge={pricing.pro.badge}
            />
          </div>
          <div className="h-px bg-[var(--landing-border-strong)] mb-6" />
          <p className="text-center text-sm text-[var(--landing-text-muted)] max-w-2xl mx-auto">
            {pricing.comparisonNote}
          </p>
        </div>
      </section>

      {/* Book a demo */}
      <section id={bookDemo.id} className="py-16 md:py-24 px-6 scroll-mt-20">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-3">
            {bookDemo.title}
          </h2>
          <p className="text-[var(--landing-text-secondary)] max-w-xl mx-auto mb-8">
            {bookDemo.subtitle}
          </p>
          <a
            href={bookDemo.bookingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline"
          >
            {bookDemo.ctaLabel}
          </a>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-6">
        <div
          className="max-w-6xl mx-auto rounded-2xl py-16 px-8 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, var(--landing-teal-soft) 0%, rgba(46, 232, 230, 0.05) 100%)",
            border: "1px solid var(--landing-border-strong)",
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(46, 232, 230, 0.1) 0%, transparent 70%)",
            }}
          />
          <h2 className="text-2xl md:text-3xl font-bold text-[var(--landing-text-primary)] relative mb-2">
            {finalCta.title}
          </h2>
          <p className="text-[var(--landing-text-secondary)] relative mb-6 max-w-xl mx-auto">
            {finalCta.subtitle}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 relative">
            <Link
              href={finalCta.primary.href}
              className="inline-flex font-semibold rounded-lg px-6 py-3 text-sm bg-[var(--landing-accent)] text-white hover:bg-[var(--landing-accent-hover)] transition-colors no-underline"
            >
              {finalCta.primary.label}
            </Link>
            <Link
              href={finalCta.secondary.href}
              className="inline-flex font-semibold rounded-lg px-6 py-3 text-sm border border-[var(--landing-border)] text-[var(--landing-text-primary)] hover:bg-[var(--landing-surface)] transition-colors no-underline"
            >
              {finalCta.secondary.label}
            </Link>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
