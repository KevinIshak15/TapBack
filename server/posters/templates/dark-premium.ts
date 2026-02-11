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
  id: "dark-premium",
  name: "Dark Premium",
  description: "Dark background, light card — premium look.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan to leave a review";

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const bg = "#0f172a";
  const text = "#f1f5f9";
  const muted = "#94a3b8";
  const cardBg = "#f8fafc";
  const border = QR.cardBorderDark;
  const shadow = QR.cardShadowDark;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Review</title>
  <style>
    ${baseBodyStyles(dims, bg, text)}
    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; }
    ${qrCardStyles(cardBg, border, shadow)}
    .qr-card { margin-bottom: ${SPACE.md}; }
    ${hierarchyStyles("1.6rem", text, muted, true)}
    .brand strong { color: #e2e8f0; }
  </style>
</head>
<body>
  <div class="content">
    <p class="headline">${name}</p>
    <p class="sub">We'd love your feedback</p>
    <p class="google-line">Share your experience on <span class="g-word">Google</span></p>
    <div class="qr-card">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
    <p class="helper">${cta}</p>
    <div class="brand"><strong>${name}</strong></div>
  </div>
</body>
</html>`;
}
