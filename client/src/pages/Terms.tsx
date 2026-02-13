import { Link } from "wouter";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function Terms() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <article>
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4">
              Terms of Service
            </h1>
            <p className="text-sm text-[var(--landing-text-muted)]">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-[var(--landing-text-secondary)]">
            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">1. Acceptance</h2>
              <p>
                By accessing or using RevsBoost, you agree to be bound by these Terms of Service. If you do not agree, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">2. Subscription Terms</h2>
              <p>
                RevsBoost is provided as a subscription service. By subscribing, you receive access to our review management software, including our QR code review system, AI review draft generation, and analytics dashboard. Access continues for the duration of your active subscription.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">3. Billing Terms</h2>
              <p className="mb-4">
                Billing is charged per business location. Basic and Pro plans are billed monthly or annually. You authorize us to charge your payment method on a recurring basis until you cancel. Prices are subject to change with reasonable notice. Taxes may apply based on your jurisdiction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">4. Cancellation Policy</h2>
              <p>
                You may cancel your subscription at any time. Upon cancellation, you retain access until the end of your current billing period. No refunds are provided for partial periods. You may export your data prior to cancellation.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">5. Acceptable Use</h2>
              <p className="mb-4">
                You agree not to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use RevsBoost to solicit, incentivize, or fabricate fake reviews</li>
                <li>Violate Google&apos;s review policies or any applicable laws</li>
                <li>Use the service for spam, harassment, or illegal activity</li>
                <li>Resell or sublicense RevsBoost without authorization</li>
                <li>Reverse engineer, compromise, or disrupt our systems</li>
              </ul>
              <p className="mt-4">
                We may suspend or terminate accounts that violate these terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">6. AI Usage Disclaimers</h2>
              <p>
                RevsBoost uses AI to generate review drafts and, on Pro plans, automated replies. AI-generated content is provided as a suggestion only. You are responsible for ensuring that any content you use complies with Google&apos;s policies and applicable laws. We do not guarantee that AI output will meet any particular standard or be free from errors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, RevsBoost and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits, data, or business opportunities. Our total liability for any claims arising from your use of the service shall not exceed the amount you paid us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">8. Changes</h2>
              <p>
                We may update these terms from time to time. Material changes will be communicated via email or in-product notice. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">9. Contact</h2>
              <p>
                For questions about these terms: <a href="mailto:legal@revsboost.com" className="text-[var(--landing-accent)] hover:underline">legal@revsboost.com</a>. See our <Link href="/contact" className="text-[var(--landing-accent)] hover:underline">Contact page</Link> for general inquiries.
              </p>
            </section>
          </div>

          <div className="mt-16 pt-8 border-t border-[var(--landing-border-strong)]">
            <Link href="/" className="text-sm font-medium text-[var(--landing-accent)] hover:underline">
              ← Back to Home
            </Link>
          </div>
        </article>
      </div>
      <LandingFooter />
    </div>
  );
}
