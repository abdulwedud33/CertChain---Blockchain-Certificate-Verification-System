"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Award, PlusCircle, Copy, ExternalLink, RefreshCw,
  Wallet, ShieldAlert, TrendingUp, BookOpen, CalendarCheck
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Navbar } from "@/components/layout/Navbar";
import { toast } from "@/components/ui/Toaster";
import { useWallet } from "@/hooks/useWallet";
import { getAllCertificatesAPI, getStatsAPI } from "@/lib/api";
import { formatDate, shortenHash, copyToClipboard } from "@/lib/utils";
import { Certificate, StatsData } from "@/types";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function AdminDashboard() {
  const { isConnected, displayAddress, connect } = useWallet();
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [certsData, statsData] = await Promise.all([
        getAllCertificatesAPI(),
        getStatsAPI(),
      ]);
      setCerts(certsData);
      setStats(statsData);
    } catch (err: any) {
      toast({ title: "Error loading data", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = async (text: string, label: string) => {
    const ok = await copyToClipboard(text);
    if (ok) toast({ title: `${label} copied!`, variant: "success" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <motion.div variants={fadeUp}>
            <h1 className="text-3xl font-display">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Issue and manage blockchain certificates
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>

            {isConnected ? (
              <Button asChild>
                <Link href="/admin/issue">
                  <PlusCircle className="h-4 w-4" />
                  Issue Certificate
                </Link>
              </Button>
            ) : (
              <Button onClick={connect}>
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </Button>
            )}
          </motion.div>
        </motion.div>

        {/* Wallet warning */}
        {!isConnected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20 px-5 py-4"
          >
            <ShieldAlert className="h-5 w-5 text-yellow-600 flex-shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              Connect your MetaMask wallet to issue certificates on the blockchain.
            </p>
          </motion.div>
        )}

        {/* Stats Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8"
        >
          {[
            {
              icon: Award,
              label: "Total Certificates",
              value: stats?.total ?? "—",
              color: "text-primary bg-primary/10",
            },
            {
              icon: BookOpen,
              label: "Unique Courses",
              value: stats?.uniqueCourses ?? "—",
              color: "text-accent bg-accent/10",
            },
            {
              icon: CalendarCheck,
              label: "Issued Today",
              value: stats?.issuedToday ?? "—",
              color: "text-orange-500 bg-orange-500/10",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <motion.div key={label} variants={fadeUp}>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className={`h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <p className="text-2xl font-bold">{loading ? "…" : value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Certificates Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Issued Certificates</CardTitle>
              <CardDescription>
                All certificates recorded on the blockchain and in the database.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                /* Skeleton loader */
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              ) : certs.length === 0 ? (
                <div className="text-center py-16">
                  <Award className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No certificates issued yet.</p>
                  {isConnected && (
                    <Button className="mt-4" asChild>
                      <Link href="/admin/issue">Issue your first certificate</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        {["Cert ID", "Student", "Course", "Issue Date", "Tx Hash", "Issuer"].map((h) => (
                          <th
                            key={h}
                            className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {certs.map((cert) => (
                        <tr
                          key={cert.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-mono text-primary font-medium whitespace-nowrap">
                            {cert.certificateId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{cert.studentName}</td>
                          <td className="px-6 py-4 max-w-[180px] truncate">{cert.courseName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-muted-foreground">
                            {formatDate(cert.issueDate)}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs text-muted-foreground">
                                {shortenHash(cert.transactionHash)}
                              </span>
                              <button
                                onClick={() => handleCopy(cert.transactionHash, "Tx hash")}
                                className="p-0.5 rounded hover:text-primary transition-colors"
                                title="Copy transaction hash"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-mono text-xs text-muted-foreground">
                              {shortenHash(cert.issuerWallet, 4)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
