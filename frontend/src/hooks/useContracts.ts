"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import {
  getFaucetContract,
  getFaucetContractSigned,
  getLoanSBTContract,
  getLoanManagerContract,
  getLoanManagerContractSigned,
  getProvider,
} from "@/lib/contracts";

/**
 * Helper hook to retrieve the Privy embedded wallet specifically.
 * We use this to avoid picking MetaMask/External wallets if they are also connected.
 */
function useEmbeddedWallet() {
  const { wallets } = useWallets();
  return useMemo(() => {
    return wallets.find(w => w.walletClientType === 'privy');
  }, [wallets]);
}

// --- FAUCET ---
export function useFaucet() {
  const { user } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const address = user?.wallet?.address;
  const [timeUntilClaim, setTimeUntilClaim] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchCooldown = useCallback(async () => {
    if (!address) return;
    try {
      setIsSyncing(true);
      const contract = getFaucetContract();
      const time = await contract.timeUntilNextClaim(address);
      setTimeUntilClaim(Number(time));
    } catch (err) {
      console.warn("Faucet check timed out, enabling Safe Mode.");
      setTimeUntilClaim(0); 
    } finally {
      setIsSyncing(false);
    }
  }, [address]);

  useEffect(() => {
    fetchCooldown();
  }, [address, fetchCooldown]);

  const claim = useCallback(async () => {
    if (!embeddedWallet) {
      setError("Embedded wallet not found. Please setup your wallet in the dashboard.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      // FORCE use of the embedded wallet specifically
      const contract = await getFaucetContractSigned(embeddedWallet);
      const tx = await contract.claim();
      await tx.wait();
      await fetchCooldown();
      return true;
    } catch (err: any) {
      console.error("Claim transaction failed:", err);
      const msg = err?.reason || err?.message || "Internal network error.";
      setError(msg.includes("wait") ? "Cooldown active. Try again later." : "Funding failed. The network is busy.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCooldown, embeddedWallet]);

  const canClaim = timeUntilClaim === 0;

  return { claim, canClaim, timeUntilClaim, loading, error, isSyncing, refetch: fetchCooldown };
}

// --- USER STATS ---
export function useUserStats() {
  const { user } = usePrivy();
  const address = user?.wallet?.address;

  const [stats, setStats] = useState({
    sbtCount: 0,
    tier: 0, 
    totalBorrowed: "0",
    totalRepaid: "0",
    loanLimit: "0",
    balance: "0", 
    blacklisted: false,
  });
  const [loading, setLoading] = useState(true);

  const TIER_NAMES = ["Bronze", "Silver", "Gold"];

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const sbtContract = getLoanSBTContract();
        const loanContract = getLoanManagerContract();
        const provider = getProvider();

        const [sbtCount, tier, totalBorrowed, totalRepaid, loanLimit, blacklisted, balance] =
          await Promise.all([
            sbtContract.getUserSBTCount(address).catch(() => 0n),
            loanContract.getUserTier(address).catch(() => 0n),
            loanContract.totalBorrowed(address).catch(() => 0n),
            loanContract.totalRepaid(address).catch(() => 0n),
            loanContract.getLoanLimit(address).catch(() => 0n),
            loanContract.blacklisted(address).catch(() => false),
            provider.getBalance(address).catch(() => 0n),
          ]);

        setStats({
          sbtCount: Number(sbtCount),
          tier: Number(tier),
          totalBorrowed: ethers.formatEther(totalBorrowed),
          totalRepaid: ethers.formatEther(totalRepaid),
          loanLimit: ethers.formatEther(loanLimit),
          balance: ethers.formatEther(balance),
          blacklisted,
        });
      } catch (err) {
        console.error("Stats sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [address]);

  return { ...stats, tierName: TIER_NAMES[stats.tier], loading };
}

// --- ACTIVE LOAN ---
export function useActiveLoan() {
  const { user } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const address = user?.wallet?.address;

  const [loan, setLoan] = useState<{
    id?: string;
    amount: string;
    collateral: string;
    dueDate: Date | null;
    daysLeft: number;
    tier: number;
    status: number; 
    hasActiveLoan: boolean;
  }>({
    amount: "0",
    collateral: "0",
    dueDate: null,
    daysLeft: 0,
    tier: 0,
    status: 0,
    hasActiveLoan: false,
  });
  const [loading, setLoading] = useState(true);
  const [repaying, setRepaying] = useState(false);

  useEffect(() => {
    if (!address || !user?.id) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const contract = getLoanManagerContract();
        const [loanData, daysLeft] = await Promise.all([
          contract.getActiveLoan(address).catch(() => ({ amount: 0n, collateral: 0n, dueDate: 0n, tier: 0, status: 0 })),
          contract.getDaysUntilDue(address).catch(() => 0n),
        ]);

        const status = Number(loanData.status);

        const { data: dbLoans } = await supabase
          .from('loans')
          .select('id')
          .eq('privy_id', user.id)
          .eq('status', 'Active')
          .limit(1);

        const dbLoan = dbLoans?.[0];

        setLoan({
          id: dbLoan?.id,
          amount: ethers.formatEther(loanData.amount),
          collateral: ethers.formatEther(loanData.collateral),
          dueDate: new Date(Number(loanData.dueDate) * 1000),
          daysLeft: Number(daysLeft),
          tier: Number(loanData.tier),
          status,
          hasActiveLoan: status === 1,
        });
      } catch (err) {
        console.error("Loan sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [address, user?.id]);

  const repay = useCallback(async () => {
    if (!user || !loan.id || !embeddedWallet) return false;
    setRepaying(true);
    try {
      const contract = await getLoanManagerContractSigned(embeddedWallet);
      const amountWei = ethers.parseEther(loan.amount);
      const tx = await contract.repayLoan({ value: amountWei });
      await tx.wait();

      await supabase
        .from('loans')
        .update({ status: 'Repaid', amount_paid: Number(loan.amount) })
        .eq('id', loan.id);

      await supabase
        .from('transactions')
        .insert({
          privy_id: user.id,
          type: 'repay',
          amount: Number(loan.amount)
        });

      setLoan((prev) => ({ ...prev, status: 2, hasActiveLoan: false }));
      return true;
    } catch (err: any) {
      console.error("Repayment failed:", err);
      return false;
    } finally {
      setRepaying(false);
    }
  }, [loan.amount, user, loan.id, embeddedWallet]);

  return { ...loan, repay, repaying, loading };
}

// --- APPLY FOR LOAN ---
export function useApplyForLoan() {
  const { user } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (amountHSK: string, nullifierHash: string) => {
    if (!user || !embeddedWallet) return false;
    setLoading(true);
    setError(null);
    try {
      const contract = await getLoanManagerContractSigned(embeddedWallet);
      const amountWei = ethers.parseEther(amountHSK);
      const collateral = (amountWei * 10n) / 100n;
      const nullifierBytes = ethers.zeroPadValue(ethers.toBeHex(BigInt(nullifierHash)), 32);

      const tx = await contract.applyForLoan(amountWei, nullifierBytes, {
        value: collateral,
      });
      await tx.wait();

      const tierId = Number(amountHSK) <= 0.02 ? 'Bronze' : Number(amountHSK) <= 0.05 ? 'Silver' : 'Gold';
      
      await supabase
        .from('loans')
        .insert({
          privy_id: user.id,
          amount: Number(amountHSK),
          tier: tierId,
          status: 'Active',
          amount_paid: 0
        });

      await supabase
        .from('transactions')
        .insert({
          privy_id: user.id,
          type: 'borrow',
          amount: Number(amountHSK)
        });

      return true;
    } catch (err: any) {
      console.error("Borrow failed:", err);
      setError(err?.reason || err?.message || "Network error. Try a smaller loan.");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, embeddedWallet]);

  return { apply, loading, error };
}
