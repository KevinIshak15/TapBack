import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { generateReview } from "../services/openai";
import { asyncHandler } from "../middleware/errorHandler";
import { sendNewConcernNotification } from "../email";

export function registerReviewRoutes(app: Express) {
  // Create review
  app.post(
    api.reviews.create.path,
    asyncHandler(async (req, res) => {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      if (input.experienceType === "concern") {
        const business = await storage.getBusiness(input.businessId);
        const owner = business ? await storage.getUser(business.ownerId) : undefined;
        const toEmail = business?.concernsNotificationEmail?.trim() || owner?.email;
        if (toEmail) {
          sendNewConcernNotification(toEmail, business?.name ?? "Your business", {
            content: review.content,
            customerName: review.customerName,
            customerEmail: review.customerEmail,
            customerPhone: review.customerPhone,
            createdAt: review.createdAt,
          }).catch((err) => console.error("[reviews] Concern notification error:", err));
        }
      }
      res.status(201).json(review);
    })
  );

  // Generate AI review
  app.post(
    api.reviews.generateAI.path,
    asyncHandler(async (req, res) => {
      const input = api.reviews.generateAI.input.parse(req.body);
      const { businessId, tags, experienceType, customText, variation } = input;

      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      const reviewText = await generateReview({
        businessName: business.name,
        category: business.category,
        experienceType,
        tags,
        customText,
        variation,
      });

      res.json({ review: reviewText });
    })
  );
}
