/**
 * Converts an uploaded logo (any image format) to PNG with transparent background
 * so it looks good on the QR code and review flow (no white box).
 * Light/white pixels are made transparent using a simple threshold.
 */

const LUMINANCE_THRESHOLD = 0.92; // Pixels brighter than this become transparent
const MAX_SIDE = 512; // Cap size for performance

export function makeLogoTransparent(dataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (dataUrl.startsWith("data:image/svg")) {
      // SVG can already be transparent; keep as-is (or we could inline and leave)
      resolve(dataUrl);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        let w = img.width;
        let h = img.height;
        if (w > MAX_SIDE || h > MAX_SIDE) {
          if (w > h) {
            h = Math.round((h * MAX_SIDE) / w);
            w = MAX_SIDE;
          } else {
            w = Math.round((w * MAX_SIDE) / h);
            h = MAX_SIDE;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(dataUrl);
          return;
        }

        ctx.drawImage(img, 0, 0, w, h);
        const imageData = ctx.getImageData(0, 0, w, h);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i] / 255;
          const g = data[i + 1] / 255;
          const b = data[i + 2] / 255;
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          if (luminance >= LUMINANCE_THRESHOLD) {
            data[i + 3] = 0; // transparent
          }
        }

        ctx.putImageData(imageData, 0, 0);
        const pngUrl = canvas.toDataURL("image/png");
        resolve(pngUrl);
      } catch (e) {
        reject(e);
      }
    };

    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
}
