import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "structured-steps",
  name: "Structured Steps",
  description: "Clear 1-2-3 steps — great for any business.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan to leave us a review";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") return { widthIn: "8.27in", heightIn: "11.69in" };
  return { widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const primary = "#1e40af";
  const text = "#1e293b";
  const muted = "#64748b";

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
      background: #fff; color: ${text};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 0.35in; -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .header { font-size: 1.1rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; text-align: center; color: ${primary}; margin-bottom: 1.25rem; line-height: 1.3; }
    .qr-wrap {
      border: 2px solid ${primary}; border-radius: 12px; padding: 20px; background: #fff;
      margin: 0 auto 1.25rem; width: 3.25in; height: 3.25in;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .steps-bar { display: flex; align-items: center; justify-content: center; gap: 0.5rem 1rem; flex-wrap: wrap; font-size: 0.8rem; color: ${muted}; margin-bottom: 1rem; }
    .steps-bar span { font-weight: 600; color: ${primary}; }
    .footer { font-size: 0.75rem; color: ${muted}; text-align: center; }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <p class="header">Scan here to leave us a review</p>
  <div class="qr-wrap">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <div class="steps-bar">
    <span>1. Scan</span> &rarr; <span>2. Tap</span> &rarr; <span>3. Review</span>
  </div>
  <p style="font-size:0.85rem;color:${muted};text-align:center;margin-bottom:0.5rem;">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
