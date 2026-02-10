import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "google-corners",
  name: "Review Us on Google",
  description: "Google colors, diagonal corners & multicolor text — bold and recognizable.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Scan the QR code below to leave us a review!";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") {
    return { widthIn: "8.27in", heightIn: "11.69in" };
  }
  return { widthIn: "8.5in", heightIn: "11in" };
}

const G = "#4285F4";
const o1 = "#EA4335";
const o2 = "#FBBC04";
const g = "#34A853";
const l = "#4285F4";
const e = "#EA4335";

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const website = data.website ? escapeHtml(data.website) : "";

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
      background: #fff;
      color: #1a1a1a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.4in;
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .corner {
      position: absolute;
      width: 2.2in;
      height: 2.2in;
      z-index: 0;
    }
    .corner-tl { top: 0; left: 0; background: #EA4335; clip-path: polygon(0 0, 100% 0, 0 100%); }
    .corner-tr { top: 0; right: 0; background: #FBBC04; clip-path: polygon(100% 0, 100% 100%, 0 0); }
    .corner-bl { bottom: 0; left: 0; background: #34A853; clip-path: polygon(0 0, 100% 100%, 0 100%); }
    .corner-br { bottom: 0; right: 0; background: #4285F4; clip-path: polygon(100% 0, 100% 100%, 0 100%); }
    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .review-on {
      font-size: 0.95rem;
      font-weight: 800;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: #1a1a1a;
      margin-bottom: 0.2rem;
    }
    .google-word {
      font-size: 2.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 0.35rem;
      line-height: 1.1;
    }
    .stars {
      font-size: 1rem;
      letter-spacing: 0.15em;
      color: #FBBC04;
      margin-bottom: 0.9rem;
    }
    .scan-cta {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #333;
      max-width: 4.2in;
      line-height: 1.35;
      margin-bottom: 0.75rem;
    }
    .qr-wrap {
      background: #fff;
      border: 3px solid #e5e7eb;
      border-radius: 12px;
      padding: 18px;
      margin: 0 auto 0.85rem;
      width: 2.9in;
      height: 2.9in;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .footer {
      font-size: 0.75rem;
      color: #6b7280;
      text-align: center;
    }
    .footer strong { color: #1a1a1a; }
  </style>
</head>
<body>
  <div class="corner corner-tl" aria-hidden="true"></div>
  <div class="corner corner-tr" aria-hidden="true"></div>
  <div class="corner corner-bl" aria-hidden="true"></div>
  <div class="corner corner-br" aria-hidden="true"></div>
  <div class="content">
    <p class="review-on">Review us on</p>
    <p class="google-word" aria-hidden="true">
      <span style="color:${G}">G</span><span style="color:${o1}">o</span><span style="color:${o2}">o</span><span style="color:${g}">g</span><span style="color:${l}">l</span><span style="color:${e}">e</span>
    </p>
    <p class="stars" aria-hidden="true">★ ★ ★ ★ ★</p>
    <p class="scan-cta">${cta}</p>
    <div class="qr-wrap">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
    <div class="footer">
      <strong>${name}</strong>
      ${website ? `<br/><span>${website}</span>` : ""}
    </div>
  </div>
</body>
</html>`;
}
