import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "elegant-boutique",
  name: "Elegant Boutique",
  description: "Soft pastel, serif accent — for salons and boutiques.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan to leave a review";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") return { widthIn: "8.27in", heightIn: "11.69in" };
  return { widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const bg = "#f8f4f0";
  const accent = "#8b7355";
  const text = "#3d3834";
  const muted = "#7a726b";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Reviews</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      width: ${dims.widthIn}; height: ${dims.heightIn};
      background: ${bg}; color: ${text};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 0.35in; -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .script-word { font-family: Georgia, 'Times New Roman', serif; font-size: 2.5rem; font-weight: 600; font-style: italic; color: ${accent}; letter-spacing: 0.02em; margin-bottom: 0.25rem; }
    .sparkle { font-size: 0.65rem; letter-spacing: 0.15em; color: ${accent}; margin-bottom: 1rem; }
    .sub { font-size: 0.9rem; color: ${muted}; margin-bottom: 1.25rem; }
    .qr-wrap {
      background: #fff; border-radius: 16px; padding: 20px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      margin: 0 auto 1rem; width: 3in; height: 3in;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .cta { font-size: 0.9rem; color: ${muted}; text-align: center; margin-bottom: 1rem; }
    .footer { font-size: 0.75rem; color: ${muted}; text-align: center; }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <p class="script-word">Reviews</p>
  <p class="sparkle" aria-hidden="true">✦ ${name} ✦</p>
  <p class="sub">We value your feedback</p>
  <div class="qr-wrap">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <p class="cta">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
