import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { requireAuth, requireOwnership } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { serializeDates } from "../utils/serialize";

const PLACEHOLDER_GOOGLE_URL = "https://g.page/r/imported";

export function registerBusinessRoutes(app: Express) {
  // Create business (must be from Google Business Profile: connect Google, select locations, then create)
  app.post(
    api.businesses.create.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const integration = await storage.getGoogleIntegration(userId);
      if (!integration || integration.status !== "active") {
        return res.status(400).json({
          code: "GOOGLE_NOT_CONNECTED",
          message: "You must connect Google Business Profile to add a business.",
        });
      }

      const body = req.body as { locationResourceNames?: string[] } & Record<string, unknown>;
      const locationResourceNames = body.locationResourceNames as string[] | undefined;

      if (!Array.isArray(locationResourceNames) || locationResourceNames.length === 0) {
        const pending = await storage.getPendingLocationLinks(userId);
        if (pending.length === 0) {
          return res.status(400).json({
            code: "NO_LOCATION_SELECTED",
            message: "Select at least one Google Business Profile location to add.",
          });
        }
        // Use stored pending selection
        const created: any[] = [];
        for (const link of pending) {
          const name = link.locationName || link.storeAddress || "Business";
          const business = await storage.createBusiness({
            ownerId: userId,
            name: name.slice(0, 200),
            category: "Other",
            googleReviewUrl: PLACEHOLDER_GOOGLE_URL,
            address: link.storeAddress?.slice(0, 500),
            locationResourceName: link.locationResourceName,
          });
          await storage.setLocationLinkBusinessId(link.id, business.id);
          created.push(serializeDates(business));
        }
        return res.status(201).json(created.length === 1 ? created[0] : created);
      }

      const links = await storage.getLocationLinksByUser(userId);
      const toCreate = locationResourceNames.filter((name) => {
        const link = links.find((l) => l.locationResourceName === name);
        return link && link.businessId == null;
      });
      const alreadyAdded = locationResourceNames.filter((name) => {
        const link = links.find((l) => l.locationResourceName === name);
        return link && link.businessId != null;
      });
      if (alreadyAdded.length > 0) {
        return res.status(400).json({
          code: "LOCATION_ALREADY_ADDED",
          message: "This location is already added.",
          alreadyAdded,
        });
      }
      if (toCreate.length === 0) {
        return res.status(400).json({
          code: "NO_LOCATION_SELECTED",
          message: "Select at least one Google Business Profile location to add.",
        });
      }

      const created: any[] = [];
      for (const locationResourceName of toCreate) {
        const link = links.find((l) => l.locationResourceName === locationResourceName);
        const name = link?.locationName || link?.storeAddress || "Business";
        const business = await storage.createBusiness({
          ownerId: userId,
          name: name.slice(0, 200),
          category: "Other",
          googleReviewUrl: PLACEHOLDER_GOOGLE_URL,
          address: link?.storeAddress?.slice(0, 500),
          locationResourceName,
        });
        if (link) await storage.setLocationLinkBusinessId(link.id, business.id);
        created.push(serializeDates(business));
      }
      res.status(201).json(created.length === 1 ? created[0] : created);
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
