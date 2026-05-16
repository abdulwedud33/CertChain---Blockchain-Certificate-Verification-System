"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Shield, Search, Link2, CheckCircle2, Lock, Zap,
  Globe, ChevronRight, ArrowRight, Award
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";

// ─── Animation Variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Sections ─────────────────────────────────────────────────────────────────

const features = [
  {
    icon: Lock,
    title: "Tamper-Proof Records",
    desc: "Certificates are written to the Ethereum blockchain. Once issued, they cannot be altered or deleted.",
  },
  {
    icon: Globe,
    title: "Public Verification",
    desc: "Anyone can verify a certificate's authenticity without needing an account or special access.",
  },
  {
    icon: Zap,
    title: "Instant Verification",
    desc: "Enter a certificate ID and get an instant cryptographic proof of validity within seconds.",
  },
  {
    icon: Shield,
    title: "MetaMask Secured",
    desc: "Only authorized admin wallets can issue certificates, preventing fraud at the source.",
  },
];

const steps = [
  {
    step: "01",
    title: "Admin Issues Certificate",
    desc: "Instructor connects MetaMask and fills out the certificate form with student and course details.",
  },
  {
    step: "02",
    title: "Blockchain Records It",
    desc: "The certificate is written to the Ethereum Sepolia testnet smart contract, creating a permanent record.",
  },
  {
    step: "03",
    title: "Database Stores Metadata",
    desc: "Certificate details are saved in PostgreSQL along with the blockchain transaction hash.",
  },
  {
    step: "04",
    title: "Anyone Can Verify",
    desc: "Share the certificate ID. Anyone can verify it's authentic by checking both the database and blockchain.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-grid mesh-gradient">
        <div className="mx-auto max-w-5xl px-4 py-24 sm:py-36 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary mb-6">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                Built on Ethereum Blockchain
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              custom={1}
              className="text-5xl sm:text-7xl font-display leading-[1.05] tracking-tight text-foreground mb-6"
            >
              Certificates that
              <br />
              <span className="text-primary italic">can't be faked.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              custom={2}
              className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              CertChain is a blockchain-powered certificate verification system for
              universities. Issue tamper-proof digital certificates and let anyone verify
              them instantly — no trust required.
            </motion.p>

            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col sm:flex-row gap-3 justify-center"
            >
              <Button size="lg" asChild>
                <Link href="/verify">
                  <Search className="h-4 w-4" />
                  Verify a Certificate
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/admin/dashboard">
                  Admin Dashboard
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Floating card illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
            className="mt-16 mx-auto max-w-xl"
          >
            <div className="rounded-2xl border border-border/60 bg-card shadow-2xl shadow-primary/10 overflow-hidden">
              <div className="border-b border-border/60 bg-muted/50 px-4 py-3 flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />
                <span className="ml-2 text-xs text-muted-foreground font-mono">certchain.verify</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Certificate ID: CERT-2024-001</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                      <span className="text-sm font-semibold text-accent">VERIFIED ON BLOCKCHAIN</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {[
                    ["Student", "Alice Johnson"],
                    ["Course", "Special Topics in CSE"],
                    ["Issued", "May 15, 2024"],
                    ["Network", "Ethereum Sepolia"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-muted/50 px-3 py-2">
                      <p className="text-xs text-muted-foreground">{label}</p>
                      <p className="font-medium">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-lg bg-muted/50 px-3 py-2">
                  <p className="text-xs text-muted-foreground mb-0.5">Transaction Hash</p>
                  <p className="font-mono text-xs text-primary truncate">0x4a3b9c1d2e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-display mb-4">
              Why blockchain?
            </motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-xl mx-auto">
              Traditional certificate systems rely on central authorities. CertChain removes
              that dependency with cryptographic proofs.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp}>
                <Card className="h-full hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <CardContent className="pt-6">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-4 bg-secondary/30">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
          >
            <motion.h2 variants={fadeUp} className="text-4xl font-display text-center mb-16">
              How it works
            </motion.h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {steps.map(({ step, title, desc }, i) => (
                <motion.div
                  key={step}
                  variants={fadeUp}
                  custom={i}
                  className="flex gap-4"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-mono font-bold text-sm">{step}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="text-4xl font-display mb-4">
            Ready to verify?
          </h2>
          <p className="text-muted-foreground mb-8">
            Enter any certificate ID to instantly check its authenticity on the blockchain.
          </p>
          <Button size="lg" asChild>
            <Link href="/verify">
              Verify a Certificate
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">CertChain</span>
            <span className="text-muted-foreground text-sm">— Special Topics in CSE</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link2 className="h-3 w-3" />
            <span>Powered by Ethereum Sepolia Testnet</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
