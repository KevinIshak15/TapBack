import { useState, useEffect } from "react";

const FALLBACK_CHART_ACCENT = "#162C4E";

/**
 * Reads --chart-accent from :root for Recharts/SVG (hex). Safe for SSR.
 */
export function useChartAccent(): string {
  const [accent, setAccent] = useState(FALLBACK_CHART_ACCENT);

  useEffect(() => {
    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue("--chart-accent")
        .trim();
      if (value) setAccent(value);
    } catch {
      // keep fallback
    }
  }, []);

  return accent;
}
