import { Request, Response, NextFunction } from "express";
import { z, ZodSchema } from "zod";

/**
 * Factory that returns an Express middleware validating req.body
 * against the given Zod schema. On failure, responds with 400 + errors.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors: result.error.flatten().fieldErrors,
      });
    }
    // Replace req.body with the parsed (type-safe) version
    req.body = result.data;
    next();
  };
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

export const issueCertificateSchema = z.object({
  studentName:     z.string().min(2, "Student name is required"),
  courseName:      z.string().min(2, "Course name is required"),
  certificateId:   z.string().min(3, "Certificate ID is required"),
  issueDate:       z.string().datetime({ message: "Invalid date format" }),
  transactionHash: z.string().startsWith("0x", "Must be a valid tx hash"),
  issuerWallet:    z.string().startsWith("0x", "Must be a valid wallet address"),
});
