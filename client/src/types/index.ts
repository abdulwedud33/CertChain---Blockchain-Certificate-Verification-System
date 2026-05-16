// ─── Certificate ──────────────────────────────────────────────────────────────

export interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  certificateId: string;
  issueDate: string;        // ISO string from backend
  transactionHash: string;
  issuerWallet: string;
  createdAt: string;
}

export interface VerifyResult {
  valid: boolean;
  data?: Certificate;
  message?: string;
}

// ─── API Responses ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface StatsData {
  total: number;
  uniqueCourses: number;
  issuedToday: number;
}

// ─── Form Inputs ──────────────────────────────────────────────────────────────

export interface IssueCertificateFormData {
  studentName: string;
  courseName: string;
  certificateId: string;
  issueDate: string;
}
