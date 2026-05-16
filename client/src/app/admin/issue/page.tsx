"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Loader2, CheckCircle2, AlertCircle,
  Wallet, Cpu, Database
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "@/components/ui/Toaster";
import { useWallet } from "@/hooks/useWallet";
import { issueCertificateOnChain } from "@/lib/blockchain";
import { issueCertificateAPI } from "@/lib/api";

// ─── Form Schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  studentName:   z.string().min(2, "Student name is required"),
  courseName:    z.string().min(2, "Course name is required"),
  certificateId: z.string().min(3, "Certificate ID must be at least 3 characters")
                          .regex(/^[A-Z0-9-]+$/, "Use uppercase letters, numbers, and hyphens only"),
  issueDate:     z.string().min(1, "Issue date is required"),
});

type FormData = z.infer<typeof schema>;

// ─── Progress steps ───────────────────────────────────────────────────────────

type Step = "idle" | "blockchain" | "database" | "done";

const STEPS: { id: Step; icon: typeof Wallet; label: string; description: string }[] = [
  {
    id: "blockchain",
    icon: Cpu,
    label: "Writing to Blockchain",
    description: "Calling smart contract via MetaMask…",
  },
  {
    id: "database",
    icon: Database,
    label: "Saving to Database",
    description: "Storing certificate metadata in PostgreSQL…",
  },
  {
    id: "done",
    icon: CheckCircle2,
    label: "Certificate Issued!",
    description: "Successfully recorded on chain and database.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function IssueCertificatePage() {
  const router = useRouter();
  const { isConnected, address, connect } = useWallet();
  const [step, setStep] = useState<Step>("idle");
  const [txHash, setTxHash] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { issueDate: new Date().toISOString().split("T")[0] },
  });

  const onSubmit = async (data: FormData) => {
    if (!isConnected || !address) {
      toast({
        title: "Wallet not connected",
        description: "Connect your MetaMask wallet to issue certificates.",
        variant: "destructive",
      });
      return;
    }

    try {
      // ── Step 1: Write to blockchain ───────────────────────────────────────
      setStep("blockchain");

      // issueDate as ISO string for blockchain (contract uses Unix timestamp)
      const issueDateISO = new Date(data.issueDate).toISOString();

      const hash = await issueCertificateOnChain({
        studentName:   data.studentName,
        courseName:    data.courseName,
        certificateId: data.certificateId,
        issueDate:     issueDateISO,
      });

      setTxHash(hash);

      // ── Step 2: Save to database ──────────────────────────────────────────
      setStep("database");

      await issueCertificateAPI({
        studentName:     data.studentName,
        courseName:      data.courseName,
        certificateId:   data.certificateId,
        issueDate:       issueDateISO,
        transactionHash: hash,
        issuerWallet:    address,
      });

      // ── Done ──────────────────────────────────────────────────────────────
      setStep("done");
      toast({
        title: "Certificate issued successfully!",
        description: `Tx: ${hash.slice(0, 20)}…`,
        variant: "success",
      });

      // After 2 seconds navigate to dashboard
      setTimeout(() => router.push("/admin/dashboard"), 2500);

    } catch (err: any) {
      setStep("idle");
      // Map common blockchain/provider errors to user-friendly messages
      const raw = err?.message || String(err);
      let userMsg = raw;

      if (raw.includes("No contract found at")) {
        userMsg = "No contract at configured address. Check contract address and MetaMask network.";
      } else if (raw.includes("External transactions to internal accounts cannot include data")) {
        userMsg = "MetaMask refused the transaction: contract address or network mismatch. Verify the deployed contract address and your MetaMask network.";
      } else if (raw.toLowerCase().includes("insufficient funds")) {
        userMsg = "Insufficient funds for gas. Fund your wallet with testnet ETH.";
      } else if (raw.toLowerCase().includes("user rejected")) {
        userMsg = "Transaction rejected in MetaMask.";
      } else if (raw.includes("Simulated transaction failed")) {
        // Include original message after a brief guidance
        userMsg = `Transaction simulation failed: ${raw.replace("Simulated transaction failed:","")}. Check parameters or certificate ID uniqueness.`;
      }

      toast({
        title: "Failed to issue certificate",
        description: userMsg,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = step !== "idle" && step !== "done";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Back nav */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/dashboard">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-display mb-1">Issue Certificate</h1>
          <p className="text-muted-foreground mb-8">
            Fill out the form below. The certificate will be written to the Ethereum
            blockchain and saved in the database.
          </p>

          {/* Wallet guard */}
          {!isConnected && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20 px-5 py-4">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  Connect your MetaMask wallet to issue certificates.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={connect}>
                <Wallet className="h-3.5 w-3.5" />
                Connect
              </Button>
            </div>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
              <CardDescription>
                All fields are required and will be permanently stored on-chain.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Certificate ID */}
                <div className="space-y-2">
                  <Label htmlFor="certificateId">Certificate ID</Label>
                  <Input
                    id="certificateId"
                    placeholder="e.g. CERT-2024-001"
                    className="font-mono"
                    disabled={isSubmitting || step === "done"}
                    {...register("certificateId")}
                  />
                  {errors.certificateId && (
                    <p className="text-sm text-red-500">{errors.certificateId.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Must be unique. Use uppercase letters, numbers, and hyphens.
                  </p>
                </div>

                {/* Student Name */}
                <div className="space-y-2">
                  <Label htmlFor="studentName">Student Name</Label>
                  <Input
                    id="studentName"
                    placeholder="e.g. Alice Johnson"
                    disabled={isSubmitting || step === "done"}
                    {...register("studentName")}
                  />
                  {errors.studentName && (
                    <p className="text-sm text-red-500">{errors.studentName.message}</p>
                  )}
                </div>

                {/* Course Name */}
                <div className="space-y-2">
                  <Label htmlFor="courseName">Course Name</Label>
                  <Input
                    id="courseName"
                    placeholder="e.g. Special Topics in CSE"
                    disabled={isSubmitting || step === "done"}
                    {...register("courseName")}
                  />
                  {errors.courseName && (
                    <p className="text-sm text-red-500">{errors.courseName.message}</p>
                  )}
                </div>

                {/* Issue Date */}
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    disabled={isSubmitting || step === "done"}
                    {...register("issueDate")}
                  />
                  {errors.issueDate && (
                    <p className="text-sm text-red-500">{errors.issueDate.message}</p>
                  )}
                </div>

                {/* Progress indicator */}
                {step !== "idle" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl border bg-muted/30 p-4 space-y-3"
                  >
                    {STEPS.map(({ id, icon: Icon, label, description }) => {
                      const stepOrder = ["blockchain", "database", "done"];
                      const currentIdx = stepOrder.indexOf(step);
                      const thisIdx = stepOrder.indexOf(id);
                      const isActive = step === id;
                      const isDone = thisIdx < currentIdx || step === "done";

                      return (
                        <div
                          key={id}
                          className={`flex items-center gap-3 ${
                            isDone ? "opacity-100" : isActive ? "opacity-100" : "opacity-30"
                          }`}
                        >
                          <div
                            className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isDone
                                ? "bg-accent text-accent-foreground"
                                : isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : isActive ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Icon className="h-4 w-4" />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{label}</p>
                            <p className="text-xs text-muted-foreground">{description}</p>
                          </div>
                        </div>
                      );
                    })}

                    {/* Show tx hash when done */}
                    {step === "done" && txHash && (
                      <div className="mt-2 rounded-lg bg-accent/5 border border-accent/20 px-3 py-2">
                        <p className="text-xs text-muted-foreground">Transaction Hash</p>
                        <p className="font-mono text-xs text-accent break-all">{txHash}</p>
                      </div>
                    )}
                  </motion.div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!isConnected || isSubmitting || step === "done"}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing…
                    </>
                  ) : step === "done" ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Redirecting to dashboard…
                    </>
                  ) : (
                    "Issue Certificate on Blockchain"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
