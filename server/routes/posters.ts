import type { Express } from "express";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { storage } from "../storage";
import { listTemplates, renderTemplate } from "../posters/templateRegistry";
import { generateQrDataUrl } from "../posters/qr";
import { renderToPdf, renderToPng } from "../posters/renderer";
import {
  getCachedPath,
  readCached,
  writeCached,
  type PaperSize,
  type PosterFormat,
} from "../posters/cache";
import type { PosterData } from "../posters/types";

const TEMPLATE_IDS = [
  "minimal-professional",
  "google-corners",
  "modern-cafe",
  "elegant-boutique",
  "elegant-pastel",
  "structured-steps",
  "teal-steps",
  "dark-premium",
  "friendly-casual",
  "friendly-blobs",
];

function getBusinessId(req: { params: { businessId?: string } }): number {
  const id = Number(req.params.businessId);
  if (!Number.isInteger(id) || id < 1) throw new Error("Invalid businessId");
  return id;
}

function getPaperSize(q: Record<string, unknown>): PaperSize {
  const s = (q.size as string)?.toUpperCase();
  if (s === "A4" || s === "LETTER") return s as PaperSize;
  return "LETTER";
}

function getVariant(q: Record<string, unknown>): "light" | "dark" {
  const v = (q.variant as string)?.toLowerCase();
  if (v === "dark") return "dark";
  return "light";
}

async function ensureBusinessAndOwnership(businessId: number, userId: number) {
  const business = await storage.getBusiness(businessId);
  if (!business) {
    const err = new Error("Business not found");
    (err as any).status = 404;
    throw err;
  }
  if (business.ownerId !== userId) {
    const err = new Error("Forbidden");
    (err as any).status = 403;
    throw err;
  }
  return business;
}

function buildPosterData(business: any, origin: string): PosterData {
  const qrUrl = `${origin}/r/${business.slug}`;
  return {
    businessName: business.name,
    logoUrl: (business as any).logo ?? (business as any).logoUrl ?? null,
    qrUrl,
    qrDataUrl: "",
    ctaLine: "Scan to leave us a review",
    website: business.website ?? null,
    phone: business.phone ?? null,
  };
}

export function registerPosterRoutes(app: Express) {
  app.get(
    "/api/businesses/:businessId/posters/templates",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = getBusinessId(req);
      await ensureBusinessAndOwnership(businessId, req.user!.id);
      res.json(listTemplates());
    })
  );

  // GET /api/businesses/:businessId/posters/html?templateId=...&size=...&variant=...&embed=1
  app.get(
    "/api/businesses/:businessId/posters/html",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = getBusinessId(req);
      const business = await ensureBusinessAndOwnership(businessId, req.user!.id);
      const templateId = (req.query.templateId as string) || "minimal-professional";
      if (!TEMPLATE_IDS.includes(templateId)) {
        return res.status(400).json({ message: "Invalid templateId" });
      }
      const size = getPaperSize(req.query as Record<string, unknown>);
      const variant = getVariant(req.query as Record<string, unknown>);
      const embed = (req.query.embed as string) === "1";

      const origin = req.protocol + "://" + req.get("host") || "http://localhost:5000";
      const data = buildPosterData(business, origin);
      data.qrDataUrl = await generateQrDataUrl(data.qrUrl);

      let html = renderTemplate(templateId, data, { size, variant });

      if (embed) {
        const isA4 = size === "A4";
        const w = isA4 ? 794 : 816;
        const h = isA4 ? 1123 : 1056;
        const scale = Math.min(170 / w, 220 / h);
        const boxW = Math.round(w * scale);
        const boxH = Math.round(h * scale);
        const embedStyle = `.embed-wrap{margin:0;padding:0;overflow:hidden;width:${boxW}px;height:${boxH}px;background:#fff}.embed-scaler{transform:scale(${scale});transform-origin:0 0;width:${w}px;height:${h}px}`;
        html = html.replace(/<head>/i, `<head><style>${embedStyle}</style>`);
        html = html.replace(/<body([^>]*)>/i, `<body$1 class="embed-wrap"><div class="embed-scaler">`);
        html = html.replace("</body>", "</div></body>");
      }

      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.send(html);
    })
  );

  app.get(
    "/api/businesses/:businessId/posters/preview",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = getBusinessId(req);
      const business = await ensureBusinessAndOwnership(businessId, req.user!.id);
      const templateId = (req.query.templateId as string) || "minimal-professional";
      if (!TEMPLATE_IDS.includes(templateId)) {
        return res.status(400).json({ message: "Invalid templateId" });
      }
      const size = getPaperSize(req.query as Record<string, unknown>);
      const variant = getVariant(req.query as Record<string, unknown>);
      const origin = req.protocol + "://" + req.get("host") || "http://localhost:5000";
      const data = buildPosterData(business, origin);
      data.qrDataUrl = await generateQrDataUrl(data.qrUrl);
      const html = renderTemplate(templateId, data, { size, variant });
      const pngBuffer = await renderToPng(html, size);
      res.setHeader("Content-Type", "image/png");
      res.send(pngBuffer);
    })
  );

  app.get(
    "/api/businesses/:businessId/posters/download.pdf",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = getBusinessId(req);
      const business = await ensureBusinessAndOwnership(businessId, req.user!.id);
      const templateId = (req.query.templateId as string) || "minimal-professional";
      if (!TEMPLATE_IDS.includes(templateId)) {
        return res.status(400).json({ message: "Invalid templateId" });
      }
      const size = getPaperSize(req.query as Record<string, unknown>);
      const variant = getVariant(req.query as Record<string, unknown>);
      const ts = business.updatedAt ?? business.createdAt;
      const updatedAt = ts instanceof Date ? ts.toISOString() : (typeof ts === "string" ? ts : "0");
      const cachePath = getCachedPath(businessId, templateId, size, "pdf", updatedAt);
      let buffer = await readCached(cachePath);
      if (!buffer) {
        const origin = req.protocol + "://" + req.get("host") || "http://localhost:5000";
        const data = buildPosterData(business, origin);
        data.qrDataUrl = await generateQrDataUrl(data.qrUrl);
        const html = renderTemplate(templateId, data, { size, variant });
        buffer = await renderToPdf(html, size);
        await writeCached(cachePath, buffer);
      }
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${business.slug}-${templateId}-${size}.pdf"`);
      res.send(buffer);
    })
  );

  app.get(
    "/api/businesses/:businessId/posters/download.png",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = getBusinessId(req);
      const business = await ensureBusinessAndOwnership(businessId, req.user!.id);
      const templateId = (req.query.templateId as string) || "minimal-professional";
      if (!TEMPLATE_IDS.includes(templateId)) {
        return res.status(400).json({ message: "Invalid templateId" });
      }
      const size = getPaperSize(req.query as Record<string, unknown>);
      const variant = getVariant(req.query as Record<string, unknown>);
      const ts = business.updatedAt ?? business.createdAt;
      const updatedAt = ts instanceof Date ? ts.toISOString() : (typeof ts === "string" ? ts : "0");
      const cachePath = getCachedPath(businessId, templateId, size, "png", updatedAt);
      let buffer = await readCached(cachePath);
      if (!buffer) {
        const origin = req.protocol + "://" + req.get("host") || "http://localhost:5000";
        const data = buildPosterData(business, origin);
        data.qrDataUrl = await generateQrDataUrl(data.qrUrl);
        const html = renderTemplate(templateId, data, { size, variant });
        buffer = await renderToPng(html, size);
        await writeCached(cachePath, buffer);
      }
      res.setHeader("Content-Type", "image/png");
      res.setHeader("Content-Disposition", `attachment; filename="${business.slug}-${templateId}-${size}.png"`);
      res.send(buffer);
    })
  );
}
