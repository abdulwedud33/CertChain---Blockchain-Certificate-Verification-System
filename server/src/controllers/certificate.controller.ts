import { Request, Response, NextFunction } from "express";
import * as certificateService from "../services/certificate.service";

/**
 * POST /api/certificates
 * Issue a new certificate (called by admin after blockchain write)
 */
export async function issueCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const certificate = await certificateService.createCertificate(req.body);
    res.status(201).json({
      success: true,
      message: "Certificate issued successfully.",
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/certificates/verify/:certificateId
 * Public endpoint — verify a certificate by ID
 */
export async function verifyCertificate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { certificateId } = req.params;
    const certificate = await certificateService.findCertificateById(certificateId);

    if (!certificate) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: "Certificate not found.",
      });
    }

    res.json({
      success: true,
      valid: true,
      data: certificate,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/certificates
 * Admin — list all issued certificates
 */
export async function listCertificates(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const certificates = await certificateService.getAllCertificates();
    res.json({ success: true, data: certificates });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/certificates/stats
 * Admin — dashboard statistics
 */
export async function getStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const stats = await certificateService.getCertificateStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
}
