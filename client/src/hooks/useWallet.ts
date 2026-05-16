"use client";

import { useState, useEffect, useCallback } from "react";
import { connectWallet, getCurrentWallet } from "@/lib/blockchain";

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if already connected on mount
  useEffect(() => {
    getCurrentWallet().then(setAddress).catch(console.error);

    // Listen for account changes in MetaMask
    if (window.ethereum) {
      const handler = (accounts: string[]) => setAddress(accounts[0] || null);
      window.ethereum.on("accountsChanged", handler);
      return () => window.ethereum?.removeListener("accountsChanged", handler);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    // MetaMask doesn't support programmatic disconnect; we just clear local state
    setAddress(null);
  }, []);

  return {
    address,
    isConnected: !!address,
    isConnecting,
    error,
    connect,
    disconnect,
    // Shortened display address: 0x1234…5678
    displayAddress: address
      ? `${address.slice(0, 6)}…${address.slice(-4)}`
      : null,
  };
}
