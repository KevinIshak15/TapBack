import type { PaperSize } from "./types";

export interface Dimensions {
  widthMm: number;
  heightMm: number;
  widthIn: string;
  heightIn: string;
}

export function getDimensions(size: PaperSize): Dimensions {
  if (size === "A4") {
    return { widthMm: 210, heightMm: 297, widthIn: "8.27in", heightIn: "11.69in" };
  }
  return { widthMm: 215.9, heightMm: 279.4, widthIn: "8.5in", heightIn: "11in" };
}

export const SPACE = {
  xs: "0.25rem",
  sm: "0.5rem",
  md: "1rem",
  lg: "1.25rem",
  xl: "1.5rem",
} as const;

export const QR = {
  cardBorderDark: "1px solid rgba(255,255,255,0.12)",
  cardShadowDark: "0 4px 24px rgba(0,0,0,0.25)",
} as const;

export function baseBodyStyles(
  dims: Dimensions,
  bg: string,
  text: string
): string {
  return `
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
      position: relative;
      overflow: hidden;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  `.trim();
}

export function qrCardStyles(
  cardBg: string,
  border: string,
  shadow: string,
  borderRadius: string = "12px"
): string {
  return `
    .qr-card, .qr-wrap {
      background: ${cardBg};
      border: ${border};
      border-radius: ${borderRadius};
      padding: 22px;
      margin: 0 auto;
      width: 3in;
      height: 3in;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: ${shadow};
    }
  `.trim();
}

export function hierarchyStyles(
  fontSize: string,
  text: string,
  muted: string,
  boldHeadline: boolean = false
): string {
  const headlineWeight = boldHeadline ? "700" : "800";
  return `
    .headline {
      font-size: ${fontSize};
      font-weight: ${headlineWeight};
      letter-spacing: -0.02em;
      text-align: center;
      margin-bottom: 0.35rem;
      line-height: 1.2;
      position: relative;
      z-index: 1;
    }
    .sub {
      font-size: 1.05rem;
      color: ${muted};
      text-align: center;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .google-line {
      font-size: 1rem;
      font-weight: 600;
      color: ${muted};
      text-align: center;
      margin-bottom: 1rem;
      letter-spacing: 0.02em;
    }
    .google-line span, .g-word { color: ${text}; }
    .helper {
      font-size: 0.95rem;
      color: ${muted};
      text-align: center;
      margin-bottom: 0.5rem;
      line-height: 1.4;
    }
    .brand {
      font-size: 0.9rem;
      color: ${muted};
      text-align: center;
      line-height: 1.4;
    }
    .brand strong { color: ${text}; }
  `.trim();
}
