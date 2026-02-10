// @ts-ignore - qrcode has no typings in some setups
import qrcode from "qrcode";

/** Generate a QR code PNG as a data URL (no external requests). */
export async function generateQrDataUrl(url: string, sizePx: number = 400): Promise<string> {
  return qrcode.toDataURL(url, {
    type: "image/png",
    width: sizePx,
    margin: 2,
    errorCorrectionLevel: "M",
  });
}
