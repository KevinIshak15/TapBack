import { Link } from "wouter";
import "@/styles/landing-tokens.css";
import { LandingFooter } from "@/components/LandingFooter";

export default function Privacy() {
  return (
    <div className="landing-page min-h-screen" style={{ background: "var(--landing-bg)" }}>
      <div className="max-w-3xl mx-auto px-6 py-24">
        <article>
          <header className="mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)] mb-4">
              Privacy Policy
            </h1>
            <p className="text-sm text-[var(--landing-text-muted)]">
              Last updated: {new Date().toLocaleDateString("en-US")}
            </p>
          </header>

          <div className="prose prose-slate max-w-none space-y-8 text-[var(--landing-text-secondary)]">
            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">1. Introduction</h2>
              <p>
                RevsBoost (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Google review management software and related services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">2. Data Collection</h2>
              <p className="mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Account information (name, email address, phone number, username)</li>
                <li>Business information (business name, category, address, Google review link)</li>
                <li>Payment and billing information (processed securely through Stripe)</li>
                <li>Customer feedback and review-related data collected through our QR code review system</li>
              </ul>
              <p className="mt-4">
                We also automatically collect certain information when you use our services, such as IP address, browser type, device information, and usage data through analytics.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">3. Use of Analytics</h2>
              <p>
                We use analytics tools to understand how our services are used, improve user experience, and measure the effectiveness of our platform. This may include aggregated data about scans, redirects, and engagement. We do not sell your personal information to third parties.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">4. Google Business Profile Integration</h2>
              <p>
                When you connect or use Google Business Profile features, we may receive information from Google in accordance with Google&apos;s API Services User Data Policy. We use this information solely to provide our review management services. We do not post reviews on your behalf; customers submit reviews directly to Google.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">5. Stripe Billing</h2>
              <p>
                Payment processing is handled by Stripe. We do not store your full credit card details. Stripe&apos;s privacy policy applies to payment data: <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[var(--landing-accent)] hover:underline">stripe.com/privacy</a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">6. Data Security</h2>
              <p>
                We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure authentication, and access controls. We regularly review and update our security practices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">7. User Rights</h2>
              <p className="mb-4">
                Depending on your jurisdiction, you may have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct or update your personal data</li>
                <li>Request deletion of your personal data</li>
                <li>Object to or restrict certain processing</li>
                <li>Data portability</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at the address below.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[var(--landing-text-primary)] mb-3">8. Contact</h2>
              <p>
                For privacy-related inquiries: <a href="mailto:privacy@revsboost.com" className="text-[var(--landing-accent)] hover:underline">privacy@revsboost.com</a>. For general contact, see our <Link href="/contact" className="text-[var(--landing-accent)] hover:underline">Contact page</Link>.
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
