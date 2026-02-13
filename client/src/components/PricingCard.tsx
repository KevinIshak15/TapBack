import { Link } from "wouter";
import { Check } from "lucide-react";

interface PricingCardProps {
  name: string;
  price: string;
  subtext: string;
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlight?: boolean;
  badge?: string;
}

export function PricingCard({
  name,
  price,
  subtext,
  description,
  features,
  ctaLabel,
  ctaHref,
  highlight = false,
  badge,
}: PricingCardProps) {
  return (
    <div
      className={`
        relative rounded-lg p-6 md:p-8 flex flex-col
        bg-[var(--landing-surface)] border transition-all duration-300
        hover:translate-y-[-2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)]
        ${highlight ? "border-[var(--landing-teal)]" : "border-[var(--landing-border)]"}
      `}
    >
      {badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold text-white bg-[var(--landing-accent)]"
        >
          {badge}
        </div>
      )}
      <h3 className="text-xl font-semibold text-[var(--landing-text-primary)] mb-1">{name}</h3>
      <div className="flex items-baseline gap-1 mt-2">
        <span className="text-3xl md:text-4xl font-bold text-[var(--landing-text-primary)]">${price}</span>
        <span className="text-sm text-[var(--landing-text-muted)]">{subtext}</span>
      </div>
      <p className="text-[var(--landing-text-secondary)] text-sm mt-4 mb-6">{description}</p>
      <ul className="space-y-3 flex-1">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-[var(--landing-text-secondary)]">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-[var(--landing-accent)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link href={ctaHref} className="mt-6 block">
        <button className="w-full py-3 px-6 rounded-lg font-semibold text-sm text-white bg-[var(--landing-accent)] hover:bg-[var(--landing-accent-hover)] transition-colors">
          {ctaLabel}
        </button>
      </Link>
    </div>
  );
}
