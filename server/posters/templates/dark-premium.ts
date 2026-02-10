import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "dark-premium",
  name: "Dark Premium",
  description: "Dark background, light card — premium look.",
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
  const bg = "#0f172a";
  const cardBg = "#f8fafc";
  const text = "#f1f5f9";
  const muted = "#94a3b8";
  const accent = "#e2e8f0";

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
    .headline { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em; text-align: center; margin-bottom: 0.5rem; }
    .sub { font-size: 0.9rem; color: ${muted}; text-align: center; margin-bottom: 1.25rem; }
    .scan-label { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.12em; color: ${muted}; margin-bottom: 0.5rem; }
    .qr-card {
      background: ${cardBg}; border-radius: 16px; padding: 22px;
      margin: 0 auto 1rem; width: 3in; height: 3in;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3);
    }
    .qr-card img { width: 100%; height: 100%; object-fit: contain; }
    .cta { font-size: 0.9rem; color: ${muted}; text-align: center; margin-bottom: 1rem; }
    .footer { font-size: 0.75rem; color: ${muted}; text-align: center; }
    .footer strong { color: ${accent}; }
  </style>
</head>
<body>
  <p class="headline">${name}</p>
  <p class="sub">We'd love your feedback</p>
  <p class="scan-label">Scan me</p>
  <div class="qr-card">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <p class="cta">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
