import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";
import {
  getDimensions,
  SPACE,
  QR,
  baseBodyStyles,
  qrCardStyles,
  hierarchyStyles,
} from "../designSystem";

export const metadata: TemplateMetadata = {
  id: "elegant-pastel",
  name: "Elegant Pastel",
  description: "Soft pink, script accent — for salons and boutiques.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "We'd love to hear from you — scan to leave a review!";

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const bg = "#fdf5f7";
  const text = "#2d2a26";
  const muted = "#7a6a6e";
  const accent = "#b84a6b";
  const cardBg = "#ffffff";
  const border = "1px solid rgba(184,74,107,0.12)";
  const shadow = "0 2px 12px rgba(0,0,0,0.04)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Reviews</title>
  <style>
    ${baseBodyStyles(dims, bg, text)}
    .edge-accent {
      position: absolute;
      top: ${SPACE.lg};
      left: ${SPACE.xl};
      right: ${SPACE.xl};
      height: 1px;
      background: rgba(184,74,107,0.15);
      z-index: 0;
    }
    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; }
    .script-accent {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 1.4rem;
      font-weight: 600;
      font-style: italic;
      color: ${accent};
      margin-bottom: ${SPACE.xs};
    }
    ${qrCardStyles(cardBg, border, shadow, "14px")}
    .qr-card { margin-bottom: ${SPACE.md}; }
    ${hierarchyStyles("1.5rem", text, muted)}
    .google-line .g-word { color: ${accent}; }
  </style>
</head>
<body>
  <div class="edge-accent" aria-hidden="true"></div>
  <div class="content">
    <p class="script-accent">Reviews</p>
    <p class="headline">${name}</p>
    <p class="sub">We'd love to hear from you.</p>
    <p class="google-line">Share on <span class="g-word">Google</span></p>
    <div class="qr-card">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
    <p class="helper">${cta}</p>
    <div class="brand"><strong>${name}</strong></div>
  </div>
</body>
</html>`;
}
