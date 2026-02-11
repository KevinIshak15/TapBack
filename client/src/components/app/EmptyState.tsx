import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { GoogleStars } from "./GoogleStars";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  primaryAction?: React.ReactNode;
  className?: string;
  /** Show 5 stars and "Get more Google reviews" vibe */
  showStars?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  primaryAction,
  className,
  showStars = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[14px] border border-slate-200 border-dashed bg-white p-8 text-center shadow-card",
        showStars && "google-gradient-soft border-slate-200",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--app-surface))] text-[hsl(var(--primary))]">
        <Icon className="h-6 w-6" />
      </div>
      {showStars && (
        <div className="mt-3 flex items-center gap-2">
          <GoogleStars size="md" />
          <span className="text-xs font-medium text-slate-500">Google Reviews</span>
        </div>
      )}
      <h3 className="mt-4 text-lg font-medium text-slate-900">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          {description}
        </p>
      )}
      {primaryAction != null && (
        <div className="mt-6">{primaryAction}</div>
      )}
    </div>
  );
}
