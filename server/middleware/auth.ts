import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  next();
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.sendStatus(401);
  }
  
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  next();
}

/**
 * Middleware to require ownership of a resource
 */
export function requireOwnership(getOwnerId: (req: Request) => number | Promise<number>) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.sendStatus(401);
    }
    
    const ownerId = await getOwnerId(req);
    if (ownerId !== req.user!.id) {
      return res.sendStatus(403);
    }
    
    next();
  };
}
