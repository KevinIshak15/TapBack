import { Link } from "wouter";
import { ArrowRight, Sparkles, MessageSquare, AlertCircle, BarChart3, Building2, Palette } from "lucide-react";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

const features = [
  {
    icon: Sparkles,
    title: "AI Review Draft Generation",
    description: "Help customers write authentic Google reviews with AI-assisted drafting. Customers provide a few details, and RevsBoost suggests a draft they can edit before posting. Always their words, always compliant.",
    benefits: [
      "Reduces friction for customers who struggle to write reviews",
      "Up to 3 regenerations per session for the perfect draft",
      "Compliant with Google guidelines—customers post themselves",
      "Increases completion rates and helps you get more Google reviews",
    ],
  },
  {
    icon: MessageSquare,
    title: "Automatic Google Review Replies (Pro only)",
    description: "Automated AI-powered Google review replies save time and ensure every review gets a thoughtful response. Pro plans include automatic AI review responses for hands-off reputation management.",
    benefits: [
      "AI-generated responses tailored to each review",
      "Professional tone that matches your brand",
      "Faster response times improve customer perception",
      "Part of our full reputation management software suite",
    ],
  },
  {
    icon: AlertCircle,
    title: "Negative Feedback Routing",
    description: "Route concerns privately before they become public. Customers with issues can submit feedback to management while still having the option to leave a Google review. Protect your rating and address issues proactively.",
    benefits: [
      "Private concern flow keeps sensitive feedback off Google",
      "Email alerts when customers select Concern",
      "Customers can still leave a review after sharing feedback",
      "Improve your Google Business Profile ranking by addressing issues first",
    ],
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics Dashboard",
    description: "Your review insights dashboard shows scans, drafts generated, and redirect clicks. Track review growth over time and understand what drives results.",
    benefits: [
      "Real-time scan and redirect analytics",
      "Compare week-over-week and month-over-month performance",
      "Identify which locations or campaigns perform best",
      "Data-driven decisions to improve local SEO",
    ],
  },
  {
    icon: Building2,
    title: "Multi-Business Management",
    description: "Manage multiple locations from one dashboard. Perfect for franchises, chains, and businesses with several Google Business Profiles. Charged per location for transparent scaling.",
    benefits: [
      "Single login for all your locations",
      "Per-location insights and performance tracking",
      "Consistent branding and review flow across locations",
      "Scalable reputation management software",
    ],
  },
  {
    icon: Palette,
    title: "Custom QR Code Themes",
    description: "Print-ready QR templates in poster, counter card, and sticker formats. Choose themes that match your brand so your QR code review system looks professional, not generic.",
    benefits: [
      "Multiple design themes for different industries",
      "Poster, counter card, and sticker formats",
      "Print-ready files, no design skills needed",
      "Unlimited QR template downloads",
    ],
  },
];

export default function Features() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-6xl mx-auto px-6 py-24">
        <article>
          <header className="text-center mb-16">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--landing-text-primary)] mb-4">
              Powerful Review Management Features
            </h1>
            <p className="text-lg text-[var(--landing-text-secondary)] max-w-2xl mx-auto">
              Everything you need to get more Google reviews, automate customer feedback, and improve your online reputation. Our Google review management software is built for real businesses.
            </p>
          </header>

          <section className="space-y-16 mb-20">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div key={i} className="rounded-xl border border-[var(--landing-border)] bg-[var(--landing-surface)] p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-[var(--landing-surface-elevated)] border border-[var(--landing-border)] flex items-center justify-center shrink-0">
                      <Icon className="w-6 h-6 text-[var(--landing-accent)]" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-2">{feature.title}</h2>
                      <p className="text-[var(--landing-text-secondary)] mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, j) => (
                          <li key={j} className="flex items-start gap-2 text-sm text-[var(--landing-text-secondary)]">
                            <span className="text-[var(--landing-accent)] mt-1">•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
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
                Ready to grow your reviews?
              </h2>
              <p className="text-[var(--landing-text-secondary)] mb-6 max-w-xl mx-auto">
                See <Link href="/how-it-works" className="text-[var(--landing-accent)] font-medium hover:underline">how it works</Link> or <Link href="/pricing" className="text-[var(--landing-accent)] font-medium hover:underline">view pricing</Link>.
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
