import { chromium } from "playwright";
import type { PaperSize } from "./cache";

/** Render HTML to PDF buffer. */
export async function renderToPdf(html: string, size: PaperSize): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 15000,
    });
    const pdfBuffer = await page.pdf({
      format: size === "A4" ? "A4" : "Letter",
      printBackground: true,
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdfBuffer);
  } finally {
    await browser.close();
  }
}

/** Render HTML to PNG buffer (high resolution for print/digital). */
export async function renderToPng(html: string, size: PaperSize, scale: number = 2): Promise<Buffer> {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    const w = size === "LETTER" ? 816 * scale : 794 * scale;
    const h = size === "LETTER" ? 1056 * scale : 1123 * scale;
    await page.setViewportSize({ width: w, height: h });
    await page.setContent(html, {
      waitUntil: "networkidle",
      timeout: 15000,
    });
    const body = await page.locator("body").first();
    const pngBuffer = await body.screenshot({ type: "png" });
    return Buffer.from(pngBuffer!);
  } finally {
    await browser.close();
  }
}
