import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FeatureFlagKey } from "@/lib/featureFlags";

interface ComingSoonPageProps {
  title: string;
  description: string;
  /** If set, show hint to enable in Feature Flags. */
  flag?: FeatureFlagKey;
}

/** Stub page for gated or not-yet-built admin modules. */
export default function ComingSoonPage({ title, description, flag }: ComingSoonPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
        <p className="text-sm text-slate-600 mt-0.5">{description}</p>
      </div>
      <Card className="border-dashed border-slate-300 bg-slate-50/50">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            This module is not available yet. When it’s enabled, full functionality will appear here.
          </p>
          {flag && (
            <p className="text-xs text-slate-500 mt-2">
              You can enable it in Admin → System → Feature Flags.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
