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

// Middleware to check if user is admin
function isAdmin(req: any, res: any, next: any) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.status(403).json({ message: "Forbidden: Admin access only" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  setupAuth(app);

  // === Admin Stats ===
  app.get(api.admin.stats.path, isAdmin, async (req, res) => {
    const stats = await storage.getGlobalStats();
    res.json(stats);
  });

  // === Admin Business Management ===
  app.get(api.admin.businesses.list.path, isAdmin, async (req, res) => {
    const businesses = await storage.listAllBusinesses();
    res.json(businesses);
  });

  app.post(api.admin.businesses.toggle.path, isAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { isActive } = api.admin.businesses.toggle.input.parse(req.body);
    const business = await storage.getBusiness(id);
    if (!business) return res.status(404).json({ message: "Business not found" });

    const updated = await storage.updateBusiness(id, { isActive });
    await storage.createAuditLog({
      adminId: req.user!.id,
      action: isActive ? 'enable_business' : 'disable_business',
      targetType: 'business',
      targetId: id,
      details: `Business ${business.name} ${isActive ? 'enabled' : 'disabled'}`
    });
    res.json(updated);
  });

  // === Admin User Management ===
  app.get(api.admin.users.list.path, isAdmin, async (req, res) => {
    const users = await storage.listUsers();
    res.json(users);
  });

  app.post(api.admin.users.toggle.path, isAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { isActive } = api.admin.users.toggle.input.parse(req.body);
    const user = await storage.getUser(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const updated = await storage.updateUser(id, { isActive });
    await storage.createAuditLog({
      adminId: req.user!.id,
      action: isActive ? 'enable_user' : 'disable_user',
      targetType: 'user',
      targetId: id,
      details: `User ${user.username} ${isActive ? 'enabled' : 'disabled'}`
    });
    res.json(updated);
  });

  app.get(api.admin.auditLogs.list.path, isAdmin, async (req, res) => {
    const logs = await storage.listAuditLogs();
    res.json(logs);
  });

  // === Business Routes ===
  app.post(api.businesses.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    if (!req.user!.isActive) return res.status(403).json({ message: "Account disabled" });
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
    if (!business.isActive) return res.status(403).json({ message: "Business disabled" });
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

  app.post(api.reviews.generateAI.path, async (req, res) => {
    try {
      const { businessId, tags, experienceType, customText } = req.body;
      const business = await storage.getBusiness(businessId);
      if (!business) return res.status(404).json({ message: "Business not found" });
      if (!business.isActive) return res.status(403).json({ message: "Business disabled" });

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
      res.json({ review: reviewText });
    } catch (err) {
      console.error("AI Generation Error:", err);
      res.status(500).json({ message: "Failed to generate review" });
    }
  });

  return httpServer;
}
