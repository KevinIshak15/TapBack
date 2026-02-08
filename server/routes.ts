import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { registerBusinessRoutes } from "./routes/businesses";
import { registerReviewRoutes } from "./routes/reviews";
import { registerAdminRoutes } from "./routes/admin";
import { errorHandler } from "./middleware/errorHandler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport) - handles /api/login, /api/register, /api/logout, /api/user
  setupAuth(app);

  // Register route modules
  registerBusinessRoutes(app);
  registerReviewRoutes(app);
  registerAdminRoutes(app);

  // Global error handler (must be last)
  app.use(errorHandler);

  return httpServer;
}
