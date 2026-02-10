import type { PosterData, PosterRenderOptions, TemplateMetadata } from "../types";
import { escapeHtml, truncateName } from "../types";

export const metadata: TemplateMetadata = {
  id: "teal-steps",
  name: "Teal Steps",
  description: "Clear 1-2-3 band & strong CTA — professional and scannable.",
  supportedSizes: ["LETTER", "A4"],
  supportsVariant: false,
};

const DEFAULT_CTA = "Your feedback helps us improve, grow, and serve you better. It only takes a minute!";

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
  const bg = "#F5F5F0";
  const teal = "#0f766e";
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
      width: ${dims.widthIn};
      height: ${dims.heightIn};
      background: ${bg};
      color: ${text};
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .main {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 0.45in 0.4in 0.5in;
      text-align: center;
    }
    .headline {
      font-size: 1.6rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      text-transform: uppercase;
      color: ${teal};
      margin-bottom: 0.4rem;
      line-height: 1.25;
    }
    .sub {
      font-size: 0.95rem;
      color: ${muted};
      max-width: 4.2in;
      line-height: 1.5;
      margin-bottom: 0.9rem;
    }
    .qr-frame {
      border: 4px solid ${teal};
      border-radius: 8px;
      padding: 18px;
      background: #fff;
      margin: 0 auto 0.6rem;
      width: 2.9in;
      height: 2.9in;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .qr-frame img { width: 100%; height: 100%; object-fit: contain; }
    .band {
      width: 100%;
      background: ${teal};
      color: #fff;
      padding: 0.45in 0.35in;
      display: flex;
      align-items: stretch;
      justify-content: center;
      gap: 0;
    }
    .step {
      flex: 1;
      max-width: 2.2in;
      display: flex;
      align-items: flex-start;
      gap: 0.5rem;
      text-align: left;
      padding: 0 0.5rem;
      border-right: 1px dashed rgba(255,255,255,0.5);
    }
    .step:last-child { border-right: none; }
    .step-num {
      width: 1.4rem;
      height: 1.4rem;
      border-radius: 50%;
      background: #fff;
      color: ${teal};
      font-size: 0.75rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-text {
      font-size: 0.7rem;
      line-height: 1.4;
      font-weight: 500;
    }
    .footer {
      padding: 0.35rem 0;
      font-size: 0.7rem;
      color: ${muted};
      text-align: center;
    }
    .footer strong { color: ${text}; }
  </style>
</head>
<body>
  <div class="main">
    <p class="headline">Scan here to leave us a review</p>
    <p class="sub">${cta}</p>
    <div class="qr-frame">
      <img src="${data.qrDataUrl}" alt="QR Code" width="400" height="400"/>
    </div>
  </div>
  <div class="band" aria-hidden="true">
    <div class="step">
      <span class="step-num">1</span>
      <span class="step-text">Scan the QR code with your phone.</span>
    </div>
    <div class="step">
      <span class="step-num">2</span>
      <span class="step-text">Leave a quick review about your visit.</span>
    </div>
    <div class="step">
      <span class="step-num">3</span>
      <span class="step-text">Smile — your input makes our day!</span>
    </div>
  </div>
  <div class="footer"><strong>${name}</strong></div>
</body>
</html>`;
}
