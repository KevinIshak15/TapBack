/**
 * Poster template data injected into every render.
 * All user-provided strings must be escaped before use in HTML.
 */
export interface PosterData {
  businessName: string;
  logoUrl?: string | null;
  qrUrl: string;
  qrDataUrl: string;
  ctaLine?: string;
  website?: string | null;
  phone?: string | null;
}

export type PaperSize = "LETTER" | "A4";

export interface PosterRenderOptions {
  size: PaperSize;
  variant?: "light" | "dark";
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description: string;
  previewThumbnailUrl?: string;
  supportedSizes: PaperSize[];
  supportsVariant?: boolean;
}

export interface PosterTemplate {
  metadata: TemplateMetadata;
  render: (data: PosterData, options: PosterRenderOptions) => string;
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function truncateName(name: string, maxLen: number = 40): string {
  const t = name.trim();
  if (t.length <= maxLen) return t;
  return t.slice(0, maxLen - 1).trim() + "…";
}
