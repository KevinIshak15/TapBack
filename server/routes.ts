import type { Express } from "express";
import type { Server } from "http";
import { setupAuth } from "./auth";
import { registerBusinessRoutes } from "./routes/businesses";
import { registerIntegrationRoutes } from "./routes/integrations";
import { registerReviewRoutes } from "./routes/reviews";
import { registerAdminRoutes } from "./routes/admin";
import { registerPosterRoutes } from "./routes/posters";
import { errorHandler } from "./middleware/errorHandler";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth (Passport) - handles /api/login, /api/register, /api/logout, /api/user
  setupAuth(app);

  // Register route modules
  registerBusinessRoutes(app);
  registerIntegrationRoutes(app);
  registerReviewRoutes(app);
  registerAdminRoutes(app);
  registerPosterRoutes(app);

  // Global error handler (must be last)
  app.use(errorHandler);

  return httpServer;
}
