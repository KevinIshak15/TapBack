import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";
import { serializeDates } from "../utils/serialize";
import { listLocationReviews } from "../integrations/googleGbpClient";

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

  // List businesses (include pendingConcernsCount for dashboard action-needed)
  app.get(
    api.businesses.list.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const businesses = await storage.getBusinessesByOwner(req.user!.id);
      const withPending = await Promise.all(
        businesses.map(async (b) => {
          const pending = await storage.getConcernsCount(b.id);
          return serializeDates({ ...b, pendingConcernsCount: pending });
        })
      );
      res.json(withPending);
    })
  );

  // Portfolio alert count: concerns + unreplied 1–2 star Google reviews (for top bar and sidebar badge)
  app.get(
    "/api/portfolio/alerts",
    requireAuth,
    asyncHandler(async (req, res) => {
      const userId = req.user!.id;
      const businesses = await storage.getBusinessesByOwner(userId);
      let concerns = 0;
      let unrepliedLowRating = 0;
      for (const b of businesses) {
        concerns += await storage.getConcernsCount(b.id);
        const locationResourceName = (b as { locationResourceName?: string }).locationResourceName;
        if (!locationResourceName) continue;
        try {
          const result = await listLocationReviews(userId, locationResourceName);
          unrepliedLowRating += result.reviews.filter(
            (r) => (r.starRating === 1 || r.starRating === 2) && !r.reviewReply?.trim()
          ).length;
        } catch {
          // Skip this business if Google API fails (e.g. token expired)
        }
      }
      res.json({ count: concerns + unrepliedLowRating });
    })
  );

  // Concerns count for a business (optionally since date) — for "new since last viewed" badge
  app.get(
    "/api/businesses/:id/concerns-count",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = Number(req.params.id);
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const sinceParam = req.query.since as string | undefined;
      const since = sinceParam ? new Date(sinceParam) : undefined;
      if (sinceParam && (Number.isNaN(since!.getTime()) || since!.getTime() <= 0)) {
        return res.status(400).json({ message: "Invalid since date" });
      }
      const count = await storage.getConcernsCount(businessId, since);
      res.json({ count });
    })
  );

  // Update a concern's status (pending | contacted). Badge counts only pending.
  app.patch(
    "/api/businesses/:id/concerns/:reviewId",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = Number(req.params.id);
      const reviewId = Number(req.params.reviewId);
      const business = await storage.getBusiness(businessId);
      if (!business) return res.status(404).json({ message: "Business not found" });
      if (business.ownerId !== req.user!.id) return res.status(403).json({ message: "Not authorized" });
      const body = req.body as { concernStatus?: string };
      const concernStatus = body.concernStatus === "contacted" ? "contacted" : body.concernStatus === "pending" ? "pending" : undefined;
      if (!concernStatus) return res.status(400).json({ message: "concernStatus must be 'pending' or 'contacted'" });
      const updated = await storage.updateReviewConcernStatus(businessId, reviewId, concernStatus);
      if (!updated) return res.status(404).json({ message: "Concern not found" });
      res.json(serializeDates(updated));
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

  // List reviews for a business (owner only) — in-app reviews from your review link
  app.get(
    api.businesses.listReviews.path,
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = Number(req.params.id);
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this business's reviews" });
      }
      const reviews = await storage.getReviewsByBusiness(businessId);
      res.json(reviews.map((r) => serializeDates(r)));
    })
  );

  // Delete a business (owner only)
  app.delete(
    "/api/businesses/:id",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = Number(req.params.id);
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to delete this business" });
      }
      await storage.deleteBusiness(businessId);
      res.status(204).send();
    })
  );

  // List Google Business Profile reviews for a business (owner only)
  app.get(
    "/api/businesses/:id/google-reviews",
    requireAuth,
    asyncHandler(async (req, res) => {
      const businessId = Number(req.params.id);
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }
      if (business.ownerId !== req.user!.id) {
        return res.status(403).json({ message: "Not authorized to view this business's reviews" });
      }
      const locationResourceName = (business as { locationResourceName?: string }).locationResourceName;
      if (!locationResourceName) {
        return res.json({
          reviews: [],
          averageRating: 0,
          totalReviewCount: 0,
          message: "This business is not linked to a Google Business Profile location.",
        });
      }
      try {
        const result = await listLocationReviews(req.user!.id, locationResourceName);
        res.json(result);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        res.status(502).json({
          reviews: [],
          averageRating: 0,
          totalReviewCount: 0,
          error: msg,
        });
      }
    })
  );
}
