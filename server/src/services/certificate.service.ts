import { prisma } from "../prisma/client";

export interface IssueCertificateInput {
  studentName: string;
  courseName: string;
  certificateId: string;
  issueDate: string;        // ISO date string from frontend
  transactionHash: string;  // Ethereum tx hash (saved AFTER blockchain write)
  issuerWallet: string;     // MetaMask address
}

/**
 * Save a newly issued certificate to PostgreSQL.
 * The blockchain write happens on the frontend before this is called.
 */
export async function createCertificate(data: IssueCertificateInput) {
  // Check for duplicate certificate ID in DB as a safety net
  const existing = await prisma.certificate.findUnique({
    where: { certificateId: data.certificateId },
  });

  if (existing) {
    throw new Error(`Certificate ID "${data.certificateId}" already exists.`);
  }

  const certificate = await prisma.certificate.create({
    data: {
      studentName:     data.studentName,
      courseName:      data.courseName,
      certificateId:   data.certificateId,
      issueDate:       new Date(data.issueDate),
      transactionHash: data.transactionHash,
      issuerWallet:    data.issuerWallet,
    },
  });

  return certificate;
}

/**
 * Look up a certificate by its unique certificate ID.
 * Returns null if not found.
 */
export async function findCertificateById(certificateId: string) {
  return prisma.certificate.findUnique({
    where: { certificateId },
  });
}

/**
 * Return all certificates, newest first (for admin dashboard table).
 */
export async function getAllCertificates() {
  return prisma.certificate.findMany({
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Return aggregate stats for the admin dashboard cards.
 */
export async function getCertificateStats() {
  const total = await prisma.certificate.count();

  // Count distinct courses
  const courses = await prisma.certificate.groupBy({
    by: ["courseName"],
    _count: { courseName: true },
  });

  // Count issued today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const issuedToday = await prisma.certificate.count({
    where: { createdAt: { gte: startOfDay } },
  });

  return {
    total,
    uniqueCourses: courses.length,
    issuedToday,
  };
}
