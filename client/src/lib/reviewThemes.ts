/**
 * Themes for the customer-facing review flow (/r/:slug).
 * Each theme is visually distinct: different palettes, surfaces, shadows, and button treatments.
 * References: modern SaaS palettes, calm oceanic/earthy tones, premium dark, editorial minimal.
 */

export type ReviewThemeId =
  | "classic"
  | "modern-bold"
  | "clean-clinic"
  | "warm-friendly"
  | "dark-luxe"
  | "fresh-minimal";

export type ButtonVariant = "gradient" | "solid" | "soft" | "outline";

export interface ReviewTheme {
  id: ReviewThemeId;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  /** Optional: gradient or different page background (e.g. subtle mesh) */
  pageBackground?: string;
  backgroundAccent: string;
  text: string;
  /** Card surface (e.g. white or dark) */
  cardBg: string;
  /** CSS box-shadow for the main card */
  cardShadow: string;
  /** Card border, e.g. "1px solid rgba(0,0,0,0.06)" */
  cardBorder: string;
  cardRadius: number;
  fontFamily: string;
  /** How the primary CTA looks */
  buttonVariant: ButtonVariant;
}

export const REVIEW_THEMES: Record<ReviewThemeId, ReviewTheme> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Navy-to-blue gradient, elevated card. Trust and clarity.",
    primary: "#0f172a",
    secondary: "#2563eb",
    background: "#f1f5f9",
    pageBackground: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    backgroundAccent: "#e0e7ff",
    text: "#0f172a",
    cardBg: "#ffffff",
    cardShadow: "0 4px 6px -1px rgba(15, 23, 42, 0.08), 0 10px 20px -5px rgba(15, 23, 42, 0.06)",
    cardBorder: "1px solid rgba(15, 23, 42, 0.06)",
    cardRadius: 16,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    buttonVariant: "gradient",
  },
  "modern-bold": {
    id: "modern-bold",
    name: "Modern Bold",
    description: "Violet to fuchsia, soft glow. Confident and on-brand.",
    primary: "#5b21b6",
    secondary: "#c026d3",
    background: "#faf5ff",
    pageBackground: "linear-gradient(180deg, #fdf4ff 0%, #f3e8ff 50%, #ede9fe 100%)",
    backgroundAccent: "#ede9fe",
    text: "#1e1b4b",
    cardBg: "#ffffff",
    cardShadow: "0 25px 50px -12px rgba(91, 33, 182, 0.15), 0 0 0 1px rgba(139, 92, 246, 0.08)",
    cardBorder: "1px solid rgba(139, 92, 246, 0.12)",
    cardRadius: 20,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    buttonVariant: "gradient",
  },
  "fresh-minimal": {
    id: "fresh-minimal",
    name: "Fresh Minimal",
    description: "Near-white with teal accent. Editorial, minimal.",
    primary: "#0d9488",
    secondary: "#14b8a6",
    background: "#fafafa",
    pageBackground: "#ffffff",
    backgroundAccent: "#f0fdfa",
    text: "#134e4a",
    cardBg: "#ffffff",
    cardShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
    cardBorder: "1px solid rgba(13, 148, 136, 0.12)",
    cardRadius: 8,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    buttonVariant: "outline",
  },
  "warm-friendly": {
    id: "warm-friendly",
    name: "Friendly",
    description: "Soft grey and modern. Clean and approachable.",
    primary: "#475569",
    secondary: "#64748b",
    background: "#f1f5f9",
    pageBackground: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    backgroundAccent: "#e2e8f0",
    text: "#1e293b",
    cardBg: "#ffffff",
    cardShadow: "0 4px 14px -2px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(71, 85, 105, 0.08)",
    cardBorder: "1px solid rgba(71, 85, 105, 0.12)",
    cardRadius: 16,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    buttonVariant: "solid",
  },
  "dark-luxe": {
    id: "dark-luxe",
    name: "Dark Luxe",
    description: "Slate and gold accent. Premium, high-end feel.",
    primary: "#f59e0b",
    secondary: "#fbbf24",
    background: "#0f172a",
    pageBackground: "linear-gradient(180deg, #020617 0%, #0f172a 40%, #1e293b 100%)",
    backgroundAccent: "#1e293b",
    text: "#f8fafc",
    cardBg: "#1e293b",
    cardShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(248, 250, 252, 0.06)",
    cardBorder: "1px solid rgba(248, 250, 252, 0.08)",
    cardRadius: 16,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    buttonVariant: "solid",
  },
  "clean-clinic": {
    id: "clean-clinic",
    name: "Clean Clinic",
    description: "Sage and warm white. Calm, healthcare-friendly.",
    primary: "#047857",
    secondary: "#0d9488",
    background: "#f0fdf4",
    pageBackground: "#f8faf8",
    backgroundAccent: "#ccfbf1",
    text: "#134e4a",
    cardBg: "#ffffff",
    cardShadow: "0 1px 3px 0 rgba(4, 120, 87, 0.06), 0 4px 12px -2px rgba(4, 120, 87, 0.08)",
    cardBorder: "1px solid rgba(6, 95, 70, 0.1)",
    cardRadius: 12,
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    buttonVariant: "solid",
  },
};

export const DEFAULT_REVIEW_THEME_ID: ReviewThemeId = "classic";

export function getReviewTheme(id: string | undefined | null): ReviewTheme {
  if (id && id in REVIEW_THEMES) {
    return REVIEW_THEMES[id as ReviewThemeId];
  }
  return REVIEW_THEMES[DEFAULT_REVIEW_THEME_ID];
}

/** Inline style for the page wrapper (background, color, font). */
export function getReviewThemeStyle(theme: ReviewTheme): Record<string, string> {
  return {
    background: theme.pageBackground ?? theme.background,
    color: theme.text,
    fontFamily: theme.fontFamily,
    minHeight: "100vh",
  };
}

/** Inline style for the main content card (bg, shadow, border, radius). */
export function getReviewCardStyle(theme: ReviewTheme): Record<string, string | number> {
  return {
    background: theme.cardBg,
    boxShadow: theme.cardShadow,
    border: theme.cardBorder,
    borderRadius: theme.cardRadius,
  };
}

/** Inline style for the primary CTA button. */
export function getPrimaryButtonStyle(theme: ReviewTheme): Record<string, string> {
  switch (theme.buttonVariant) {
    case "gradient":
      return {
        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
        color: "#ffffff",
        border: "none",
      };
    case "solid":
      return {
        background: theme.primary,
        color: "#ffffff",
        border: "none",
      };
    case "soft":
      return {
        background: theme.backgroundAccent,
        color: theme.primary,
        border: `2px solid ${theme.primary}`,
      };
    case "outline":
      return {
        background: "transparent",
        color: theme.primary,
        border: `2px solid ${theme.primary}`,
      };
    default:
      return {
        background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`,
        color: "#ffffff",
        border: "none",
      };
  }
}

/** Inline style for the secondary/outline button. */
export function getSecondaryButtonStyle(theme: ReviewTheme): Record<string, string> {
  const isDark = theme.id === "dark-luxe";
  return {
    background: isDark ? "transparent" : "transparent",
    color: theme.text,
    border: `2px solid ${theme.backgroundAccent}`,
  };
}
