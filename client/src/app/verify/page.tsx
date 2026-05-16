"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, CheckCircle2, XCircle, Copy, ExternalLink,
  Shield, Calendar, User, BookOpen, Hash
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "@/components/ui/Toaster";
import { verifyCertificateAPI } from "@/lib/api";
import { verifyCertificateOnChain } from "@/lib/blockchain";
import { formatDate, shortenHash, copyToClipboard } from "@/lib/utils";
import { Certificate } from "@/types";

// ─── Form Schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  certificateId: z.string().min(1, "Please enter a certificate ID"),
});
type FormData = z.infer<typeof schema>;

// ─── Result types ─────────────────────────────────────────────────────────────

type VerifyState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "valid"; cert: Certificate; onChain: boolean }
  | { status: "invalid"; message: string };

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerifyPage() {
  const [result, setResult] = useState<VerifyState>({ status: "idle" });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async ({ certificateId }: FormData) => {
    setResult({ status: "loading" });

    try {
      // 1. Check PostgreSQL database
      const dbResult = await verifyCertificateAPI(certificateId.trim());

      if (!dbResult.valid || !dbResult.data) {
        setResult({ status: "invalid", message: "Certificate not found in database." });
        return;
      }

      // 2. Also verify on blockchain (best-effort — may fail if no MetaMask)
      let onChain = false;
      try {
        const chainResult = await verifyCertificateOnChain(certificateId.trim());
        onChain = chainResult.exists;
      } catch {
        // Blockchain check optional — proceed with DB result
        console.warn("Blockchain check skipped (no MetaMask or network issue)");
      }

      setResult({ status: "valid", cert: dbResult.data, onChain });
    } catch (err: any) {
      setResult({ status: "invalid", message: err.message || "Verification failed." });
    }
  };

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast({ title: `${label} copied!`, variant: "success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-4xl font-display mb-3">Verify Certificate</h1>
          <p className="text-muted-foreground">
            Enter a certificate ID to check its authenticity on the blockchain.
          </p>
        </motion.div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="certificateId">Certificate ID</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="certificateId"
                      placeholder="e.g. CERT-2024-001"
                      className="pl-9 font-mono"
                      {...register("certificateId")}
                    />
                  </div>
                  {errors.certificateId && (
                    <p className="text-sm text-red-500">{errors.certificateId.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={result.status === "loading"}
                >
                  {result.status === "loading" ? (
                    <>
                      <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4" />
                      Verify Certificate
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result.status === "valid" && (
            <motion.div
              key="valid"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35 }}
              className="mt-6"
            >
              {/* Status banner */}
              <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 px-5 py-4 mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-green-800 dark:text-green-300">
                    ✓ Certificate is Valid
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-400">
                    {result.onChain
                      ? "Verified on both database and Ethereum blockchain."
                      : "Verified in database. Connect MetaMask to also verify on-chain."}
                  </p>
                </div>
              </div>

              {/* Certificate details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Certificate Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: User,     label: "Student Name",    value: result.cert.studentName },
                    { icon: BookOpen, label: "Course",          value: result.cert.courseName },
                    { icon: Calendar, label: "Issue Date",      value: formatDate(result.cert.issueDate) },
                    { icon: Hash,     label: "Certificate ID",  value: result.cert.certificateId },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3 rounded-lg bg-muted/40 px-4 py-3">
                      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="font-medium text-sm">{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* Transaction Hash with copy button */}
                  <div className="flex items-start gap-3 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3">
                    <ExternalLink className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">Blockchain Transaction</p>
                      <p className="font-mono text-xs text-primary break-all">
                        {shortenHash(result.cert.transactionHash, 12)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(result.cert.transactionHash, "Transaction hash")}
                      className="flex-shrink-0 p-1 rounded hover:bg-primary/10 transition-colors"
                      title="Copy full hash"
                    >
                      <Copy className="h-3.5 w-3.5 text-primary" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result.status === "invalid" && (
            <motion.div
              key="invalid"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-6"
            >
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30 px-5 py-5">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    ✗ Invalid Certificate
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-400">
                    {result.message || "This certificate could not be verified."}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
