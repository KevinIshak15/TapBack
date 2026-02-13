import { Link } from "wouter";
import { homeCopy } from "@/content/homeCopy";

export function LandingFooter() {
  const { footer } = homeCopy;
  return (
    <footer className="py-12 px-6 border-t border-[var(--landing-border-strong)]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 mb-8">
          {footer.columns.map((col, i) => (
            <div key={i}>
              <h3 className="font-semibold text-[var(--landing-text-primary)] text-sm mb-3">{col.title}</h3>
              <ul className="space-y-2 list-none p-0 m-0">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-[var(--landing-text-muted)] hover:text-[var(--landing-text-secondary)] no-underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-sm text-[var(--landing-text-muted)] text-center pt-6 border-t border-[var(--landing-border)]">
          {footer.bottomLine}
        </p>
      </div>
    </footer>
  );
}
