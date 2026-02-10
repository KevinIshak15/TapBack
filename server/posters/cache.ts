import { createHash } from "crypto";
import fs from "fs/promises";
import path from "path";

export type PaperSize = "LETTER" | "A4";
export type PosterFormat = "pdf" | "png";

const CACHE_DIR = process.env.POSTER_CACHE_DIR || path.join(process.cwd(), ".poster-cache");

function safeDir(...parts: string[]): string {
  return path.join(CACHE_DIR, ...parts);
}

export function getCacheKey(
  businessId: number,
  templateId: string,
  size: PaperSize,
  format: PosterFormat,
  updatedAt: string | Date
): string {
  const ts = typeof updatedAt === "string" ? updatedAt : updatedAt.toISOString();
  const raw = `${businessId}-${templateId}-${size}-${format}-${ts}`;
  return createHash("sha256").update(raw).digest("hex").slice(0, 16);
}

export function getCachedPath(
  businessId: number,
  templateId: string,
  size: PaperSize,
  format: PosterFormat,
  updatedAt: string | Date
): string {
  const key = getCacheKey(businessId, templateId, size, format, updatedAt);
  const ext = format === "pdf" ? "pdf" : "png";
  return safeDir(String(businessId), `${templateId}-${size}-${key}.${ext}`);
}

export async function readCached(filePath: string): Promise<Buffer | null> {
  try {
    return await fs.readFile(filePath);
  } catch {
    return null;
  }
}

export async function writeCached(filePath: string, data: Buffer): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, data);
}
