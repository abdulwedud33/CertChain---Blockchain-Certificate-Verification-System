import { Certificate, StatsData, VerifyResult } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

// ─── Certificate API ──────────────────────────────────────────────────────────

/**
 * Issue a certificate — saves to PostgreSQL after blockchain write succeeds.
 */
export async function issueCertificateAPI(data: {
  studentName: string;
  courseName: string;
  certificateId: string;
  issueDate: string;
  transactionHash: string;
  issuerWallet: string;
}): Promise<Certificate> {
  const res = await fetch(`${API_URL}/certificates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to save certificate.");
  return json.data;
}

/**
 * Verify a certificate by ID (checks PostgreSQL).
 */
export async function verifyCertificateAPI(
  certificateId: string
): Promise<VerifyResult> {
  const res = await fetch(`${API_URL}/certificates/verify/${encodeURIComponent(certificateId)}`);
  const json = await res.json();

  if (res.status === 404) return { valid: false, message: json.message };
  if (!res.ok) throw new Error(json.message || "Verification failed.");

  return { valid: true, data: json.data };
}

/**
 * Get all certificates for admin dashboard.
 */
export async function getAllCertificatesAPI(): Promise<Certificate[]> {
  const res = await fetch(`${API_URL}/certificates`);
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch certificates.");
  return json.data;
}

/**
 * Get dashboard statistics.
 */
export async function getStatsAPI(): Promise<StatsData> {
  const res = await fetch(`${API_URL}/certificates/stats`);
  const json = await res.json();
  if (!res.ok) throw new Error("Failed to fetch stats.");
  return json.data;
}
