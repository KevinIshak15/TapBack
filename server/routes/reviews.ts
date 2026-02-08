import type { Express } from "express";
import { api } from "@shared/routes";
import { storage } from "../storage";
import { generateReview } from "../services/openai";
import { asyncHandler } from "../middleware/errorHandler";

export function registerReviewRoutes(app: Express) {
  // Create review
  app.post(
    api.reviews.create.path,
    asyncHandler(async (req, res) => {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    })
  );

  // Generate AI review
  app.post(
    api.reviews.generateAI.path,
    asyncHandler(async (req, res) => {
      const { businessId, tags, experienceType, customText } = req.body;
      
      const business = await storage.getBusiness(businessId);
      if (!business) {
        return res.status(404).json({ message: "Business not found" });
      }

      // Rate limiting could go here (check storage for recent generations from IP)

      const reviewText = await generateReview({
        businessName: business.name,
        category: business.category,
        experienceType,
        tags,
        customText,
      });

      res.json({ review: reviewText });
    })
  );
}
