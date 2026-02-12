/**
 * Feature flags for admin-gated modules.
 * Persisted in localStorage; can be swapped to DB later.
 */

const STORAGE_KEY = "tapback_admin_feature_flags";

export type FeatureFlagKey =
  | "google_integration_enabled"
  | "billing_enabled"
  | "reviews_enabled"
  | "insights_enabled"
  | "auto_replies_enabled"
  | "jobs_sync_enabled";

export const FEATURE_FLAG_DEFAULTS: Record<FeatureFlagKey, boolean> = {
  google_integration_enabled: false,
  billing_enabled: false,
  reviews_enabled: false,
  insights_enabled: false,
  auto_replies_enabled: false,
  jobs_sync_enabled: false,
};

function loadFlags(): Record<FeatureFlagKey, boolean> {
  if (typeof window === "undefined") return { ...FEATURE_FLAG_DEFAULTS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...FEATURE_FLAG_DEFAULTS };
    const parsed = JSON.parse(raw) as Record<string, boolean>;
    return { ...FEATURE_FLAG_DEFAULTS, ...parsed };
  } catch {
    return { ...FEATURE_FLAG_DEFAULTS };
  }
}

let cache: Record<FeatureFlagKey, boolean> | null = null;

export function getFlag(key: FeatureFlagKey): boolean {
  if (cache === null) cache = loadFlags();
  return cache[key] ?? FEATURE_FLAG_DEFAULTS[key];
}

export function setFlag(key: FeatureFlagKey, value: boolean): void {
  if (cache === null) cache = loadFlags();
  cache[key] = value;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

export function getAllFlags(): Record<FeatureFlagKey, boolean> {
  if (cache === null) cache = loadFlags();
  return { ...cache };
}

export function setAllFlags(flags: Record<FeatureFlagKey, boolean>): void {
  cache = { ...FEATURE_FLAG_DEFAULTS, ...flags };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore
  }
}

/** Call after changing flags to refresh UI (e.g. trigger re-render). */
export function invalidateFlagsCache(): void {
  cache = null;
}
