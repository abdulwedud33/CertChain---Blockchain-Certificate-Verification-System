import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import certificateRoutes from "./routes/certificate.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

function normalizeOrigin(value?: string) {
  if (!value) return undefined;

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => {
      try {
        return new URL(origin).origin;
      } catch {
        return origin.replace(/\/$/, "");
      }
    });
}

const allowedOrigins = normalizeOrigin(process.env.CLIENT_URL) || ["http://localhost:3000"];

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/certificates", certificateRoutes);

// ─── Error Handler (must be last) ────────────────────────────────────────────

app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

export default app;
