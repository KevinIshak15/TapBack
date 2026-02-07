import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport)
  setupAuth(app);

  // === Auth Routes ===
  // (Handled in setupAuth: /api/login, /api/register, /api/logout, /api/user)

  // === Business Routes ===
  app.post(api.businesses.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.businesses.create.input.parse(req.body);
      const business = await storage.createBusiness({ ...input, ownerId: req.user!.id });
      res.status(201).json(business);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.businesses.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const businesses = await storage.getBusinessesByOwner(req.user!.id);
    res.json(businesses);
  });

  app.get(api.businesses.get.path, async (req, res) => {
    const business = await storage.getBusiness(Number(req.params.id));
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json(business);
  });

  app.get(api.businesses.getBySlug.path, async (req, res) => {
    const business = await storage.getBusinessBySlug(req.params.slug);
    if (!business) return res.status(404).json({ message: "Business not found" });
    res.json(business);
  });

  app.patch(api.businesses.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const business = await storage.getBusiness(Number(req.params.id));
    if (!business) return res.status(404).json({ message: "Business not found" });
    if (business.ownerId !== req.user!.id) return res.sendStatus(401);

    const updated = await storage.updateBusiness(business.id, req.body);
    res.json(updated);
  });

  app.get(api.businesses.getStats.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const stats = await storage.getStats(Number(req.params.id));
    res.json(stats);
  });

  // === Review Routes ===
  app.post(api.reviews.create.path, async (req, res) => {
    try {
      const input = api.reviews.create.input.parse(req.body);
      const review = await storage.createReview(input);
      res.status(201).json(review);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // === AI Generation Route ===
  app.post(api.reviews.generateAI.path, async (req, res) => {
    try {
      const { businessId, tags, experienceType, customText } = req.body;
      const business = await storage.getBusiness(businessId);
      if (!business) return res.status(404).json({ message: "Business not found" });

      // Rate limiting could go here (check storage for recent generations from IP)

      const prompt = `
        Write a short Google review (2-5 sentences) for a business named "${business.name}" (${business.category}).
        Experience: ${experienceType} (User chose: ${tags.join(", ")}).
        User notes: "${customText || "None"}".
        Tone: Authentic, human, natural. No emojis. Do not sound robotic or overly enthusiastic.
        If experience is "concern", be constructive but clear.
      `;

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: [{ role: "user", content: prompt }],
        max_completion_tokens: 200,
      });

      const reviewText = response.choices[0].message.content?.trim() || "Great experience!";
      
      // Log the generation (optional, creates a draft review entry)
      // await storage.createReview({ ... });

      res.json({ review: reviewText });
    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate review" });
    }
  });

  return httpServer;
}
