import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "modern-cafe",
  name: "Modern Restaurant / Café",
  description: "Bold headline, warm neutrals — perfect for restaurants and cafés.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan to leave us a review";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") return { widthIn: "8.27in", heightIn: "11.69in" };
  return { widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const { size } = options;
  const dims = getDimensions(size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const bg = "#f5f0eb";
  const accent = "#c4a574";
  const text = "#2d2a26";
  const muted = "#6b6560";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Review</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      width: ${dims.widthIn}; height: ${dims.heightIn};
      background: ${bg}; color: ${text};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 0.35in; -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .accent-strip { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: ${accent}; }
    .headline { font-size: 1.5rem; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; text-align: center; margin-bottom: 0.35rem; line-height: 1.2; color: ${text}; }
    .stars { font-size: 0.75rem; letter-spacing: 0.2em; color: ${accent}; margin-bottom: 1rem; }
    .qr-frame {
      border: 3px solid ${accent}; border-radius: 8px; padding: 16px; background: #fff;
      margin: 0 auto 1rem; width: 3in; height: 3in;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-frame img { width: 100%; height: 100%; object-fit: contain; }
    .helper { font-size: 0.85rem; color: ${muted}; text-align: center; max-width: 4.5in; line-height: 1.4; }
    .footer { margin-top: auto; font-size: 0.7rem; color: ${muted}; text-align: center; }
  </style>
</head>
<body>
  <div class="accent-strip" aria-hidden="true"></div>
  <p class="headline">Love your experience?</p>
  <p class="stars" aria-hidden="true">★ ★ ★ ★ ★</p>
  <div class="qr-frame">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <p class="helper">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
