"use client";

import { useState, useEffect, useCallback } from "react";
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

// --- FAUCET ---
export function useFaucet() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const address = user?.wallet?.address;
  const [timeUntilClaim, setTimeUntilClaim] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCooldown = useCallback(async () => {
    if (!address) return;
    try {
      const contract = getFaucetContract();
      const time = await contract.timeUntilNextClaim(address);
      setTimeUntilClaim(Number(time));
    } catch (err) {
      console.error("Faucet cooldown fetch failed:", err);
    }
  }, [address]);

  useEffect(() => {
    fetchCooldown();
  }, [address, fetchCooldown]);

  const claim = useCallback(async () => {
    if (wallets.length === 0) {
      setError("No wallet connected. Please setup your wallet first.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      // Pass the Privy wallet to the signer to avoid MetaMask popups
      const contract = await getFaucetContractSigned(wallets[0]);
      const tx = await contract.claim();
      await tx.wait();
      await fetchCooldown();
      return true;
    } catch (err: any) {
      console.error("Claim failed:", err);
      setError(err?.reason || err?.message || "Claim failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchCooldown, wallets]);

  const canClaim = timeUntilClaim === 0;

  return { claim, canClaim, timeUntilClaim, loading, error, refetch: fetchCooldown };
}

// --- USER STATS ---
export function useUserStats() {
  const { user } = usePrivy();
  const address = user?.wallet?.address;

  const [stats, setStats] = useState({
    sbtCount: 0,
    tier: 0, // 0=None, 1=Bronze, 2=Silver, 3=Gold
    totalBorrowed: "0",
    totalRepaid: "0",
    loanLimit: "0",
    balance: "0", // Local HSK Balance
    blacklisted: false,
  });
  const [loading, setLoading] = useState(true);

  const TIER_NAMES = ["None", "Bronze", "Silver", "Gold"];

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
        console.error("Failed to fetch user stats:", err);
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
  const { wallets } = useWallets();
  const address = user?.wallet?.address;

  const [loan, setLoan] = useState<{
    id?: string;
    amount: string;
    collateral: string;
    dueDate: Date | null;
    daysLeft: number;
    tier: number;
    status: number; // 0=None, 1=Active, 2=Repaid, 3=Defaulted
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
    if (!address) {
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

        // Fetch ID from Supabase using .limit(1) to avoid 406 errors
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
        console.error("Failed to fetch loan:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [address, user?.id]);

  const repay = useCallback(async () => {
    if (!user || !loan.id || wallets.length === 0) return false;
    setRepaying(true);
    try {
      // Pass the Privy wallet to avoid MetaMask
      const contract = await getLoanManagerContractSigned(wallets[0]);
      const amountWei = ethers.parseEther(loan.amount);
      const tx = await contract.repayLoan({ value: amountWei });
      await tx.wait();

      // SYNC WITH SUPABASE
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
      console.error("Repay failed:", err);
      return false;
    } finally {
      setRepaying(false);
    }
  }, [loan.amount, user, loan.id, wallets]);

  return { ...loan, repay, repaying, loading };
}

// --- APPLY FOR LOAN ---
export function useApplyForLoan() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (amountHSK: string, nullifierHash: string) => {
    if (!user || wallets.length === 0) return false;
    setLoading(true);
    setError(null);
    try {
      // Pass the Privy wallet to avoid MetaMask
      const contract = await getLoanManagerContractSigned(wallets[0]);
      const amountWei = ethers.parseEther(amountHSK);
      const collateral = amountWei / 10n; // 10%
      const nullifierBytes = ethers.zeroPadValue(
        ethers.toBeHex(BigInt(nullifierHash)),
        32
      );

      const tx = await contract.applyForLoan(amountWei, nullifierBytes, {
        value: collateral,
      });
      await tx.wait();

      // SYNC WITH SUPABASE
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
      console.error("Loan application failed:", err);
      setError(err?.reason || err?.message || "Loan application failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, wallets]);

  return { apply, loading, error };
}
