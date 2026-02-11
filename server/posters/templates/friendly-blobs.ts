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
  id: "friendly-blobs",
  name: "Friendly Blobs",
  description: "Organic shapes at edges — approachable and modern.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Your feedback helps us improve. Scan to leave a review!";

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const website = data.website ? escapeHtml(data.website) : "";
  const bg = "#f8f7f5";
  const text = "#2C3E50";
  const muted = "#5a6c7d";
  const blobColor = "rgba(107,142,196,0.12)";
  const cardBg = "#ffffff";
  const border = "1px solid rgba(107,142,196,0.15)";
  const shadow = "0 2px 12px rgba(0,0,0,0.04)";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Review</title>
  <style>
    ${baseBodyStyles(dims, bg, text)}
    .blob {
      position: absolute;
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      background: ${blobColor};
      z-index: 0;
    }
    .blob-1 { width: 2in; height: 2in; top: -0.4in; left: -0.4in; }
    .blob-2 { width: 1.5in; height: 1.5in; top: -0.2in; right: -0.3in; border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%; }
    .blob-3 { width: 1.6in; height: 1.6in; bottom: -0.3in; left: -0.3in; border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%; }
    .blob-4 { width: 1.8in; height: 1.8in; bottom: -0.35in; right: -0.35in; border-radius: 30% 70% 70% 30% / 70% 30% 70% 30%; }
    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; width: 100%; }
    ${qrCardStyles(cardBg, border, shadow, "16px")}
    .qr-card { margin-bottom: ${SPACE.md}; }
    ${hierarchyStyles("1.6rem", text, muted)}
  </style>
</head>
<body>
  <div class="blob blob-1" aria-hidden="true"></div>
  <div class="blob blob-2" aria-hidden="true"></div>
  <div class="blob blob-3" aria-hidden="true"></div>
  <div class="blob blob-4" aria-hidden="true"></div>
  <div class="content">
    <p class="headline">Leave us a review</p>
    <p class="sub">Did you enjoy your experience with us?</p>
    <p class="google-line">Share on <span class="g-word">Google</span></p>
    <div class="qr-card">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
    <p class="helper">${cta}</p>
    <div class="brand">
      <strong>${name}</strong>
      ${website ? `<br/><span>${website}</span>` : ""}
    </div>
  </div>
</body>
</html>`;
}
