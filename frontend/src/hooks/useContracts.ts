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
} from "@/lib/contracts";

// --- FAUCET ---
export function useFaucet() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const address = user?.wallet?.address;
  const [timeUntilClaim, setTimeUntilClaim] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address) {
      setLoading(false);
      return;
    }
    const fetch = async () => {
      try {
        const contract = getFaucetContract();
        const time = await contract.timeUntilNextClaim(address);
        setTimeUntilClaim(Number(time));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, [address]);

  const claim = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const contract = await getFaucetContractSigned();
      const tx = await contract.claim();
      await tx.wait();
      setTimeUntilClaim(86400); // 24 hours
      return true;
    } catch (err: any) {
      setError(err?.reason || err?.message || "Claim failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const canClaim = timeUntilClaim === 0;

  return { claim, canClaim, timeUntilClaim, loading, error };
}

// --- USER STATS ---
export function useUserStats() {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const address = user?.wallet?.address;

  const [stats, setStats] = useState({
    sbtCount: 0,
    tier: 0, // 0=None, 1=Bronze, 2=Silver, 3=Gold
    totalBorrowed: "0",
    totalRepaid: "0",
    loanLimit: "0",
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

        const [sbtCount, tier, totalBorrowed, totalRepaid, loanLimit, blacklisted] =
          await Promise.all([
            sbtContract.getUserSBTCount(address),
            loanContract.getUserTier(address),
            loanContract.totalBorrowed(address),
            loanContract.totalRepaid(address),
            loanContract.getLoanLimit(address),
            loanContract.blacklisted(address),
          ]);

        setStats({
          sbtCount: Number(sbtCount),
          tier: Number(tier),
          totalBorrowed: ethers.formatEther(totalBorrowed),
          totalRepaid: ethers.formatEther(totalRepaid),
          loanLimit: ethers.formatEther(loanLimit),
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
          contract.getActiveLoan(address),
          contract.getDaysUntilDue(address),
        ]);

        const status = Number(loanData.status);

        // Also fetch ID from Supabase to help with updates
        const { data: dbLoan } = await supabase
          .from('loans')
          .select('id')
          .eq('privy_id', user.id)
          .eq('status', 'Active')
          .single();

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
  }, [address, user]);

  const repay = useCallback(async () => {
    if (!user || !loan.id) return false;
    setRepaying(true);
    try {
      const contract = await getLoanManagerContractSigned();
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
  }, [loan.amount, user, loan.id]);

  return { ...loan, repay, repaying, loading };
}

// --- APPLY FOR LOAN ---
export function useApplyForLoan() {
  const { user } = usePrivy();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apply = useCallback(async (amountHSK: string, nullifierHash: string) => {
    if (!user) return false;
    setLoading(true);
    setError(null);
    try {
      const contract = await getLoanManagerContractSigned();
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
      setError(err?.reason || err?.message || "Loan application failed");
      return false;
    } finally {
      setLoading(false);
    }
  }, [user]);

  return { apply, loading, error };
}
