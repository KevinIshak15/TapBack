import type { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * Centralized error handling middleware
 */
export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Zod validation errors
  if (err instanceof z.ZodError) {
    return res.status(400).json({
      message: err.errors[0]?.message || "Validation error",
      errors: err.errors,
    });
  }

  // Known error with status
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("Error:", err);

  if (res.headersSent) {
    return;
  }

  return res.status(status).json({ message });
}

/**
 * Async route handler wrapper to catch errors
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
