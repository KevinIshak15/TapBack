import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "minimal-professional",
  name: "Minimal Professional",
  description: "Clean & professional — ideal for clinics and offices.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: true,
};

const DEFAULT_CTA = "Scan to leave us a review";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") {
    return { widthMm: 210, heightMm: 297, widthIn: "8.27in", heightIn: "11.69in" };
  }
  return { widthMm: 215.9, heightMm: 279.4, widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const { size, variant = "light" } = options;
  const dims = getDimensions(size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const website = data.website ? escapeHtml(data.website) : "";
  const isDark = variant === "dark";
  const bg = isDark ? "#1a1a1a" : "#fafafa";
  const text = isDark ? "#f4f4f5" : "#18181b";
  const muted = isDark ? "#a1a1aa" : "#71717a";
  const cardBg = isDark ? "#27272a" : "#ffffff";
  const border = isDark ? "#3f3f46" : "#e4e4e7";

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
      width: ${dims.widthIn};
      height: ${dims.heightIn};
      background: ${bg};
      color: ${text};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.35in;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .headline { font-size: 1.65rem; font-weight: 700; letter-spacing: -0.025em; text-align: center; margin-bottom: 0.4rem; line-height: 1.25; max-width: 100%; }
    .sub { font-size: 0.875rem; color: ${muted}; text-align: center; margin-bottom: 1.1rem; line-height: 1.4; }
    .scan-label { font-size: 0.6875rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: ${muted}; text-align: center; margin-bottom: 0.35rem; }
    .qr-wrap {
      background: ${cardBg};
      border: 2px solid ${border};
      border-radius: 12px;
      padding: 18px;
      margin: 0 auto 1rem;
      width: 3in;
      height: 3in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .cta { font-size: 0.9rem; color: ${muted}; text-align: center; margin-bottom: 1rem; line-height: 1.4; }
    .footer { font-size: 0.75rem; color: ${muted}; text-align: center; line-height: 1.5; }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <p class="headline">${name}</p>
  <p class="sub">We'd love your feedback</p>
  <p class="scan-label" aria-hidden="true">Scan me</p>
  <div class="qr-wrap">
    <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
  </div>
  <p class="cta">${cta}</p>
  <div class="footer">
    <strong>${name}</strong>
    ${website ? `<br/><span>${website}</span>` : ""}
  </div>
</body>
</html>`;
}
