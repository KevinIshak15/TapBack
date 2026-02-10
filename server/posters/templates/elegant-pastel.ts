import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "elegant-pastel",
  name: "Elegant Pastel",
  description: "Soft pink, script accent & starburst details — for salons and boutiques.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "We'd love to hear from you — scan to leave a review!";

function getDimensions(size: PosterRenderOptions["size"]) {
  if (size === "A4") {
    return { widthIn: "8.27in", heightIn: "11.69in" };
  }
  return { widthIn: "8.5in", heightIn: "11in" };
}

export function render(data: PosterData, options: PosterRenderOptions): string {
  const dims = getDimensions(options.size);
  const name = escapeHtml(truncateName(data.businessName));
  const cta = escapeHtml(data.ctaLine || DEFAULT_CTA);
  const bg = "#FCE8EC";
  const accent = "#C7155E";
  const text = "#2d2a26";
  const muted = "#7a6a6e";
  const starColor = "#E07C24";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${name} - Reviews</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Georgia, 'Times New Roman', serif;
      width: ${dims.widthIn};
      height: ${dims.heightIn};
      background: ${bg};
      color: ${text};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.4in;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .intro {
      font-size: 1.05rem;
      font-style: italic;
      color: ${muted};
      margin-bottom: 0.2rem;
    }
    .script-word {
      font-family: 'Brush Script MT', 'Segoe Script', Georgia, serif;
      font-size: 3rem;
      font-weight: 400;
      color: ${accent};
      letter-spacing: 0.02em;
      margin-bottom: 0.5rem;
    }
    .divider {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      width: 100%;
      max-width: 4in;
      margin: 0.5rem 0;
    }
    .divider-line { flex: 1; height: 1px; background: ${muted}; opacity: 0.6; }
    .divider-star { font-size: 0.6rem; color: ${accent}; letter-spacing: 0.2em; }
    .sub {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 1rem;
      font-style: italic;
      color: ${muted};
      text-align: center;
      max-width: 4.2in;
      line-height: 1.45;
      margin-bottom: 0.6rem;
    }
    .google-line {
      font-family: system-ui, sans-serif;
      font-size: 0.95rem;
      font-weight: 600;
      color: ${muted};
      text-align: center;
      margin-bottom: 0.75rem;
    }
    .google-line span { color: ${accent}; }
    .qr-outer {
      border: 2px dashed ${accent};
      border-radius: 20px;
      padding: 6px;
      background: #fff;
      margin: 0 auto 0.5rem;
    }
    .scan-me {
      font-family: system-ui, sans-serif;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: ${text};
      text-align: center;
      margin-bottom: 0.35rem;
    }
    .qr-wrap {
      width: 2.85in;
      height: 2.85in;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px;
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .stars {
      font-size: 0.95rem;
      letter-spacing: 0.2em;
      color: ${starColor};
      margin: 0.5rem 0 0.6rem;
    }
    .cta {
      font-family: system-ui, sans-serif;
      font-size: 0.9rem;
      font-style: italic;
      color: ${muted};
      text-align: center;
      max-width: 4.2in;
      line-height: 1.5;
    }
    .footer {
      font-family: system-ui, sans-serif;
      font-size: 0.8rem;
      color: ${muted};
      text-align: center;
      margin-top: 0.75rem;
    }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <p class="intro">Please leave us a</p>
  <p class="script-word">Reviews</p>
  <div class="divider" aria-hidden="true">
    <span class="divider-line"></span>
    <span class="divider-star">✦ ✦</span>
    <span class="divider-line"></span>
  </div>
  <p class="sub">We'd love to hear from you.</p>
  <p class="google-line">Share on <span>Google</span></p>
  <div class="qr-outer">
    <p class="scan-me">Scan me</p>
    <div class="qr-wrap">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
  </div>
  <p class="stars" aria-hidden="true">★ ★ ★ ★ ★</p>
  <p class="cta">${cta}</p>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
