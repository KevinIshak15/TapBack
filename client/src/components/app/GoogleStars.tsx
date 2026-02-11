import { Star } from "lucide-react";

/** Five filled stars in Google yellow/amber – for reviews, ranking, and trust. */
export function GoogleStars({ className = "", size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-6 h-6" : "w-5 h-5";
  return (
    <span className={`inline-flex items-center gap-0.5 text-[var(--google-star)] ${className}`} aria-label="5 stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${sizeClass} fill-current`} strokeWidth={0} />
      ))}
    </span>
  );
}
