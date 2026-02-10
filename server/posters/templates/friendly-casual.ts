import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "friendly-casual",
  name: "Friendly Casual",
  description: "Rounded, approachable — clean and modern.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan to leave us a review — it only takes a minute!";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") return { widthIn: "8.27in", heightIn: "11.69in" };
  return { widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const primary = "#15803d";
  const text = "#14532d";
  const muted = "#4d7c5a";

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
      background: #f0fdf4; color: ${text};
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 0.35in; -webkit-print-color-adjust: exact; print-color-adjust: exact;
    }
    .headline { font-size: 1.6rem; font-weight: 700; letter-spacing: -0.01em; text-align: center; margin-bottom: 0.25rem; color: ${text}; }
    .sub { font-size: 0.95rem; color: ${muted}; text-align: center; margin-bottom: 1.25rem; }
    .qr-wrap {
      background: #fff; border-radius: 24px; padding: 20px; border: 2px solid ${primary};
      margin: 0 auto 1rem; width: 3in; height: 3in;
      display: flex; align-items: center; justify-content: center;
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .cta { font-size: 0.9rem; color: ${muted}; text-align: center; max-width: 4.5in; line-height: 1.45; margin-bottom: 1rem; }
    .footer { font-size: 0.75rem; color: ${muted}; text-align: center; }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <p class="headline">${name}</p>
  <p class="sub">Thanks for visiting — we'd love to hear from you.</p>
  <div class="qr-wrap">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <p class="cta">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
