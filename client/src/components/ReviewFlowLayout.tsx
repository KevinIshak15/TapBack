/**
 * Shared layout for the customer review flow (/r/:slug).
 * Clean, modern hero ("Review us on Google"), smooth transitions, minimal footer.
 */

import React from "react";
import { ExternalLink, Star } from "lucide-react";

const FOOTER_LINK = "https://ai.revues.ca";
const REVUES_LOGO = "/revsboost-logo.png";
const REVIEW_HEADING_FONT = "'Plus Jakarta Sans', system-ui, sans-serif";

const GOOGLE_COLORS = ["#4285F4", "#EA4335", "#FBBC04", "#4285F4", "#34A853", "#EA4335"] as const;

function ReviewUsOnGoogle() {
  const letters = "Google".split("");
  return (
    <header
      className="flex-shrink-0 flex flex-col items-center justify-center animate-in"
      style={{ fontFamily: REVIEW_HEADING_FONT }}
    >
      <div className="flex flex-col items-center justify-center gap-4 sm:gap-5 py-6 sm:py-8 px-4">
        <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-slate-700 tracking-tight antialiased text-center">
          Review us on{" "}
          <span
            className="inline-flex font-bold tracking-tight"
            style={{ letterSpacing: "-0.03em" }}
          >
            {letters.map((char, i) => (
              <span key={i} style={{ color: GOOGLE_COLORS[i] }}>
                {char}
              </span>
            ))}
          </span>
        </p>
        <p className="text-xs sm:text-sm text-slate-500 font-medium text-center max-w-[280px]">
          Love your experience? Share it on Google. You post directly.
        </p>
        <span
          className="flex items-center gap-1 sm:gap-1.5 text-amber-500 [filter:drop-shadow(0_1px_2px_rgba(251,191,36,0.3))]"
          aria-label="5 stars"
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <Star
              key={i}
              className="w-10 h-10 sm:w-12 sm:h-12 fill-current transition-transform duration-300 ease-out"
              strokeWidth={0}
            />
          ))}
        </span>
      </div>
    </header>
  );
}

interface ReviewFlowLayoutProps {
  companyName?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}

export function ReviewFlowLayout({ children, style }: ReviewFlowLayoutProps) {
  return (
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col transition-colors duration-300 ease-out"
      style={style}
    >
      <ReviewUsOnGoogle />

      <main className="flex-1 flex flex-col items-center justify-start px-4 sm:px-6 md:px-8 pt-0 pb-48 sm:pb-44 w-full max-w-4xl mx-auto">
        {children}
      </main>

      <footer
        className="fixed bottom-0 left-0 right-0 z-50 flex-shrink-0 pt-4 px-4 bg-white/98 backdrop-blur-sm border-t border-slate-100 shadow-[0_-2px_20px_rgba(0,0,0,0.04)] transition-shadow duration-300"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom, 0px))",
          fontFamily: REVIEW_HEADING_FONT,
        }}
      >
        <a
          href={FOOTER_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 text-center no-underline group min-h-[52px] min-w-[52px] touch-manipulation transition-opacity duration-200 ease-out hover:opacity-100"
        >
          <img
            src={REVUES_LOGO}
            alt="RevsBoost"
            className="h-12 sm:h-16 w-auto max-w-[160px] sm:max-w-[200px] object-contain opacity-85 group-hover:opacity-100 transition-all duration-300 ease-out"
          />
          <span className="text-xs sm:text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors duration-300 ease-out inline-flex items-center gap-1.5">
            Want this for your business?
            <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-60" aria-hidden />
          </span>
        </a>
      </footer>
    </div>
  );
}
