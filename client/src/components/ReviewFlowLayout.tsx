/**
 * Shared layout for the customer review flow (/r/:slug, /r/:slug/review, /r/:slug/feedback).
 * - Header: company name only (logo is shown per-page where needed, e.g. under the question on landing).
 * - Footer: Revues logo + "Want this for your business?" — mobile-friendly, always visible.
 */

import React from "react";
import { ExternalLink, Star } from "lucide-react";

const FOOTER_LINK = "https://ai.revues.ca";
const REVUES_LOGO = "/tapback-logo.png";

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#4285F4", "#34A853", "#EA4335"] as const;
function ReviewUsOnGoogle() {
  const letters = "Google".split("");
  return (
    <div className="flex flex-col items-center justify-center gap-1.5 py-3 px-4">
      <p className="text-sm font-semibold text-slate-700 tracking-wide">
        Review us on{" "}
        <span className="inline-flex font-bold" style={{ letterSpacing: "-0.02em" }}>
          {letters.map((char, i) => (
            <span key={i} style={{ color: GOOGLE_COLORS[i] }}>
              {char}
            </span>
          ))}
        </span>
      </p>
      <span className="flex items-center gap-0.5 text-amber-500" aria-label="5 stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="w-5 h-5 fill-current" strokeWidth={0} />
        ))}
      </span>
    </div>
  );
}

interface ReviewFlowLayoutProps {
  companyName: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ReviewFlowLayout({ companyName, children, style }: ReviewFlowLayoutProps) {
  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col" style={style}>
      {/* Header — company name only */}
      <header className="flex-shrink-0 pt-6 sm:pt-8 pb-3 sm:pb-4 px-4 text-center">
        <span className="text-sm font-medium opacity-90">
          {companyName}
        </span>
      </header>

      <div className="flex-shrink-0">
        <ReviewUsOnGoogle />
      </div>

      {/* Main — card content; extra bottom padding so content stays above footer on mobile */}
      <main className="flex-1 flex flex-col items-center justify-start px-4 pt-2 pb-40 sm:pb-36">
        {children}
      </main>

      {/* Footer — fixed bottom, mobile-friendly tap target and safe area */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 flex-shrink-0 pt-3 px-4 pb-6 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}>
        <a
          href={FOOTER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 text-center no-underline group min-h-[44px] min-w-[44px] touch-manipulation"
        >
          <img
            src={REVUES_LOGO}
            alt="Revues"
            className="h-7 sm:h-8 w-auto max-w-[90px] sm:max-w-[100px] object-contain opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <span className="text-xs sm:text-sm text-slate-600 group-hover:text-slate-900 transition-colors inline-flex items-center gap-1.5">
            Want this for your business?
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" aria-hidden />
          </span>
        </a>
      </footer>
    </div>
  );
}
