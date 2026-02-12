import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FEATURE_FLAG_DEFAULTS,
  getAllFlags,
  setFlag,
  invalidateFlagsCache,
  type FeatureFlagKey,
} from "@/lib/featureFlags";

const FLAG_LABELS: Record<FeatureFlagKey, string> = {
  google_integration_enabled: "Google Business Profile integration",
  billing_enabled: "Billing & subscriptions",
  reviews_enabled: "Reviews ingestion",
  insights_enabled: "Insights & analytics",
  auto_replies_enabled: "Auto-replies",
  jobs_sync_enabled: "Jobs & sync",
};

export default function AdminFeatureFlags() {
  const [flags, setFlags] = useState<Record<FeatureFlagKey, boolean>>(getAllFlags());

  useEffect(() => {
    invalidateFlagsCache();
    setFlags(getAllFlags());
  }, []);

  const handleToggle = (key: FeatureFlagKey, value: boolean) => {
    setFlag(key, value);
    invalidateFlagsCache();
    setFlags(getAllFlags());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 tracking-tight">Feature Flags</h1>
        <p className="text-sm text-slate-600 mt-0.5">
          Enable or disable modules. Stored in localStorage for now; can be moved to DB later.
        </p>
      </div>
      <Card className="app-card">
        <CardHeader>
          <CardTitle className="text-base">Flags</CardTitle>
          <CardDescription>
            Disabled modules still show their route but display a “Coming soon” state.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {(Object.keys(FLAG_LABELS) as FeatureFlagKey[]).map((key) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <Label htmlFor={key} className="font-medium text-slate-900">
                  {FLAG_LABELS[key]}
                </Label>
                <p className="text-xs text-slate-500 mt-0.5">{key}</p>
              </div>
              <Switch
                id={key}
                checked={flags[key] ?? FEATURE_FLAG_DEFAULTS[key]}
                onCheckedChange={(checked) => handleToggle(key, checked)}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
