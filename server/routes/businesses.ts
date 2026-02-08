import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { requireAuth, requireOwnership } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { serializeDates } from "../utils/serialize";

export function registerBusinessRoutes(app: Express) {
  // Create business
  app.post(
    api.businesses.create.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const input = api.businesses.create.input.parse(req.body);
      const business = await storage.createBusiness({
        ...input,
        ownerId: req.user!.id,
      });
      res.status(201).json(serializeDates(business));
    })
  );

  // List businesses
  app.get(
    api.businesses.list.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const businesses = await storage.getBusinessesByOwner(req.user!.id);
      res.json(businesses.map(b => serializeDates(b)));
    })
  );

  // Get business by ID
  app.get(
    api.businesses.get.path,
    asyncHandler(async (req, res) => {
      const business = await storage.getBusiness(Number(req.params.id));
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(serializeDates(business));
    })
  );

  // Get business by slug
  app.get(
    api.businesses.getBySlug.path,
    asyncHandler(async (req, res) => {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      res.json(serializeDates(business));
    })
  );

  // Update business
  app.patch(
    api.businesses.update.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const business = await storage.getBusiness(Number(req.params.id));
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.sendStatus(403);
      }
      const updated = await storage.updateBusiness(business.id, req.body);
      res.json(serializeDates(updated));
    })
  );

  // Get business stats
  app.get(
    api.businesses.getStats.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const stats = await storage.getStats(Number(req.params.id));
      res.json(stats);
    })
  );
}
