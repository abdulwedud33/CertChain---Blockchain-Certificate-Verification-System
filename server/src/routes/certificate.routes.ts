import { Router } from "express";
import * as controller from "../controllers/certificate.controller";
import { validate, issueCertificateSchema } from "../middleware/validate";

const router = Router();

// Admin routes
router.post("/", validate(issueCertificateSchema), controller.issueCertificate);
router.get("/", controller.listCertificates);
router.get("/stats", controller.getStats);

// Public verification route
router.get("/verify/:certificateId", controller.verifyCertificate);

export default router;
