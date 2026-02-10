import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "friendly-blobs",
  name: "Friendly Blobs",
  description: "Organic shapes & bold CTA — approachable and modern.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Your feedback helps us improve and keep growing with you!";

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
  const bg = "#F5F4EF";
  const blobColor = "#C5D6EE";
  const primary = "#2C3E50";
  const muted = "#5a6c7d";
  const btnBg = "#6B8EC4";
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
      background: ${bg};
      color: ${primary};
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
    .blob {
      position: absolute;
      border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
      background: ${blobColor};
      z-index: 0;
      opacity: 0.9;
    }
    .blob-1 { width: 2.5in; height: 2.5in; top: -0.5in; left: -0.5in; }
    .blob-2 { width: 2in; height: 2in; top: -0.3in; right: -0.4in; border-radius: 40% 60% 70% 30% / 40% 70% 30% 60%; }
    .blob-3 { width: 1.8in; height: 1.8in; bottom: -0.3in; left: -0.3in; border-radius: 70% 30% 50% 50% / 30% 70% 30% 70%; }
    .blob-4 { width: 2.2in; height: 2.2in; bottom: -0.4in; right: -0.5in; border-radius: 30% 70% 70% 30% / 70% 30% 70% 30%; }
    .blob-5 { width: 1.5in; height: 1.5in; top: 50%; left: 50%; transform: translate(-50%, -50%); border-radius: 50% 50% 40% 60% / 60% 40% 60% 40%; opacity: 0.5; }
    .content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }
    .question {
      font-size: 1.05rem;
      font-weight: 500;
      color: ${muted};
      margin-bottom: 0.4rem;
      line-height: 1.4;
    }
    .headline {
      font-size: 2rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: ${primary};
      margin-bottom: 0.6rem;
      line-height: 1.2;
    }
    .sub {
      font-size: 0.95rem;
      color: ${muted};
      max-width: 4in;
      line-height: 1.5;
      margin-bottom: 0.9rem;
    }
    .qr-wrap {
      background: #fff;
      border-radius: 24px;
      padding: 20px;
      margin: 0 auto 0.9rem;
      width: 2.9in;
      height: 2.9in;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 8px 32px rgba(0,0,0,0.08);
      border: 2px solid ${blobColor};
    }
    .qr-wrap img { width: 100%; height: 100%; object-fit: contain; }
    .btn {
      display: inline-block;
      background: ${btnBg};
      color: #fff;
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 0.45rem 1rem;
      border-radius: 999px;
      text-decoration: none;
      margin-top: 0.25rem;
    }
    .footer {
      font-size: 0.75rem;
      color: ${muted};
      text-align: center;
      margin-top: 0.5rem;
    }
    .footer strong { color: ${primary}; }
  </style>
</head>
<body>
  <div class="blob blob-1" aria-hidden="true"></div>
  <div class="blob blob-2" aria-hidden="true"></div>
  <div class="blob blob-3" aria-hidden="true"></div>
  <div class="blob blob-4" aria-hidden="true"></div>
  <div class="blob blob-5" aria-hidden="true"></div>
  <div class="content">
    <p class="question">Did you enjoy your experience with us?</p>
    <p class="headline">Leave us a review!</p>
    <p class="sub">${cta}</p>
    <div class="qr-wrap">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
    ${website ? `<span class="btn">${website}</span>` : ""}
    <div class="footer"><strong>${name}</strong></div>
  </div>
</body>
</html>`;
}
