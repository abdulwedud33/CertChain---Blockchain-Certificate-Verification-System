import { Request, Response, NextFunction } from "express";

/**
 * Global error handler. Must be registered LAST in the Express app.
 * Catches errors thrown anywhere in controllers/services.
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
) {
  console.error("[Error]", err.message);

  // Known "user" errors (duplicate, not found, etc.)
  if (err.message.includes("already exists") || err.message.includes("not found")) {
    return res.status(409).json({ success: false, message: err.message });
  }

  // Generic 500
  res.status(500).json({
    success: false,
    message: "Internal server error.",
    ...(process.env.NODE_ENV === "development" && { error: err.message }),
  });
}
