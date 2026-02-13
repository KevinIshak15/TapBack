import { Link } from "wouter";
import { ArrowRight, TrendingUp, Heart, Tag, Building2, Bell } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

const insights = [
  {
    icon: TrendingUp,
    title: "Track Review Growth Over Time",
    description: "Monitor how your Google reviews grow week-over-week and month-over-month. See scans, draft completions, and redirect clicks in one place. Understand which campaigns and locations drive the most 5 star reviews.",
  },
  {
    icon: Heart,
    title: "Monitor Sentiment Trends",
    description: "Identify patterns in customer feedback. Track concern rates vs. positive flows to spot issues before they impact your rating. Our review insights dashboard helps you improve your Google Business Profile ranking by acting on data.",
  },
  {
    icon: Tag,
    title: "Identify Common Keywords in Reviews",
    description: "See what customers mention most often. Use this business intelligence to refine your messaging, highlight strengths, and address common themes in your automated AI review responses.",
  },
  {
    icon: Building2,
    title: "Compare Multiple Locations",
    description: "Benchmark locations against each other. Understand which sites excel at review collection and which need support. Essential for multi-location reputation management.",
  },
  {
    icon: Bell,
    title: "Real-Time Alerts for Negative Reviews",
    description: "Get notified when customers select the Concern path. Address feedback privately before it becomes a public review. Proactive customer feedback automation protects your reputation.",
  },
];

export default function Insights() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              Review Insights &amp; Performance Analytics
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              Turn review data into actionable business intelligence. Our analytics help you understand what&apos;s working, spot trends, and improve your local SEO with data-driven decisions.
            </p>
          </header>

          <section className="space-y-8 mb-20">
            {insights.map((insight, i) => {
              const Icon = insight.icon;
              return (
                <div key={i} className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[var(--landing-accent)]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-2">{insight.title}</h2>
                    <p className="text-[var(--landing-text-secondary)]">{insight.description}</p>
                  </div>
                </div>
              );
            })}
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
                Start tracking your review performance
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                Explore our <Link href="/features" className="text-[var(--landing-accent)] font-medium hover:underline">full feature set</Link> or <Link href="/pricing" className="text-[var(--landing-accent)] font-medium hover:underline">see pricing</Link>.
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
