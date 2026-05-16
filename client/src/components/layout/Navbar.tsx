"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Wallet, LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useWallet } from "@/hooks/useWallet";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { isConnected, displayAddress, connect, disconnect, isConnecting } = useWallet();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/verify", label: "Verify" },
    { href: "/admin/dashboard", label: "Admin" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow group-hover:shadow-md transition-shadow">
              <Shield className="h-4 w-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Cert<span className="text-primary">Chain</span>
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden sm:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Wallet Button */}
          <div>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-3 py-1.5 text-sm">
                  <span className="inline-block h-2 w-2 rounded-full bg-accent animate-pulse" />
                  <span className="font-mono text-accent">{displayAddress}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={disconnect}
                  title="Disconnect wallet"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={connect}
                disabled={isConnecting}
                className="gap-2"
              >
                <Wallet className="h-4 w-4" />
                {isConnecting ? "Connecting…" : "Connect Wallet"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
