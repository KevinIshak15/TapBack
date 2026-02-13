import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface PricingFAQProps {
  items: FAQItem[];
}

export function PricingFAQ({ items }: PricingFAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="rounded-lg border border-[var(--landing-border)] bg-[var(--landing-surface)] overflow-hidden"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 py-4 px-5 text-left text-[var(--landing-text-primary)] font-medium hover:bg-[var(--landing-surface-elevated)] transition-colors"
            >
              <span className="text-sm md:text-base">{item.question}</span>
              <ChevronDown
                className={`w-4 h-4 shrink-0 text-[var(--landing-text-muted)] transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 pt-0">
                <p className="text-sm text-[var(--landing-text-secondary)] leading-relaxed">
                  {item.answer}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
