import * as React from "react";
import { cn } from "@/lib/utils";

const inputClass =
  "h-12 rounded-xl border-slate-200 bg-white focus:border-slate-500 focus:ring-slate-500/20 transition-all";
const labelClass = "text-sm font-semibold";

export interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({ title, description, children, className }: SettingsSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h3 className={cn("text-base font-semibold text-slate-900", labelClass)}>{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export { inputClass, labelClass };
