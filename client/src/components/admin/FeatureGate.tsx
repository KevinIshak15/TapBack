import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";
import type { FeatureFlagKey } from "@/lib/featureFlags";
import { getFlag } from "@/lib/featureFlags";

interface FeatureGateProps {
  flag: FeatureFlagKey;
  children: ReactNode;
  /** Shown in the "Coming soon" card when disabled. */
  title?: string;
  description?: string;
  /** If true, show hint to enable in Feature Flags (admin-only). */
  showEnableHint?: boolean;
}

export function FeatureGate({ flag, children, title = "Coming soon", description, showEnableHint = true }: FeatureGateProps) {
  const enabled = getFlag(flag);

  if (enabled) return <>{children}</>;

  return (
    <Card className="border-dashed border-slate-300 bg-slate-50/50">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-slate-400" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
        <CardDescription>
          {description ?? "This module is not enabled yet. When it’s turned on, full functionality will appear here."}
          {showEnableHint && (
            <span className="block mt-2 text-xs text-slate-500">
              You can enable it in Admin → System → Feature Flags.
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent />
    </Card>
  );
}
