"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useLending } from "@/hooks/useLending";
import { useUserStats } from "@/hooks/useContracts";
import LoanTierCard from "@/components/dashboard/LoanTierCard";
import { ShieldCheck, Info, WarningCircle, Coins, Spinner, Lock } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

export default function BorrowPage() {
  const { isVerified, profile } = useUserProfile();
  const { borrowWithZK, isBorrowing, isRepaying, zkProving, error, getStats } = useLending();
  const userStats = useUserStats();
  const [stats, setStats] = useState<any>(null);
  const [activeBorrowTier, setActiveBorrowTier] = useState<string | null>(null);

  // Sync real-time on-chain stats (Tier, Limits)
  useEffect(() => {
    const sync = async () => {
      const data = await getStats();
      if (data) setStats(data);
    };
    sync();
  }, [getStats, isBorrowing]);

  const handleBorrow = async (amount: number, tierName: string) => {
    if (!isVerified) return;
    setActiveBorrowTier(tierName);

    // Pass on-chain stats into the ZK circuit (private inputs).
    // These stay hidden from the contract — only the proof goes on-chain.
    const sbtCount      = userStats.sbtCount ?? 0;
    const totalRepaidWei = userStats.totalRepaid
      ? ethers.parseEther(userStats.totalRepaid)
      : 0n;

    const success = await borrowWithZK(
      amount,
      profile?.worldid_nullifier || undefined,
      sbtCount,
      totalRepaidWei,
      tierName
    );
    setActiveBorrowTier(null);
    if (success) {
      window.location.href = "/dashboard/loans";
    }
  };

  const tiers = [
    { name: "Bronze", limit: "0.02", amount: 0.02 },
    { name: "Silver", limit: "0.05", amount: 0.05 },
    { name: "Gold", limit: "0.1", amount: 0.1 },
  ];

  const hasActiveLoan = stats?.activeLoan?.status === 1;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Borrow Assets</h1>
          <p className="text-slate-500 text-sm">Select a tier based on your ZK-verified identity.</p>
        </div>
      </div>

      {/* ZK Proof Generation Status Banner */}
      {zkProving && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex items-center gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4 text-emerald-400" weight="fill" />
          </div>
          <div>
            <p className="text-emerald-300 text-sm font-bold">Generating Zero-Knowledge Proof</p>
            <p className="text-emerald-400/70 text-xs">Computing eligibility proof locally — your credit data never leaves your device.</p>
          </div>
          <Spinner className="w-5 h-5 text-emerald-400 ml-auto animate-spin" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-xs font-bold flex items-center gap-2">
          <WarningCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          // Qualification logic based on real-time on-chain tier
          const tierLimit = Number(stats?.loanLimit || 0);
          const isQualified = isVerified && !hasActiveLoan && tierLimit >= tier.amount;
          
          return (
            <LoanTierCard 
              key={tier.name}
              tier={tier.name}
              limit={tier.limit}
              isQualified={isQualified}
              isBorrowing={activeBorrowTier === tier.name}
              isRepaying={isRepaying}
              onBorrow={() => handleBorrow(tier.amount, tier.name)}
              amount={tier.amount}
            />
          );
        })}
      </div>

      {/* Loan Implications Section */}
      <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Info className="w-6 h-6 text-blue-400" weight="fill" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest">Loan Implications & Guidelines</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Collateral Mechanism</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every loan requires a <strong className="text-white">10% soft collateral</strong>. This collateral is locked and returned upon full repayment.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Repayment Terms</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Standard loan duration is <strong className="text-white">30 days</strong>. Timely repayment unlocks higher Silver/Gold limits.
            </p>
          </div>

          {/* ZK Privacy Note */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Zero-Knowledge Privacy</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your loan eligibility is verified via a <strong className="text-white">Groth16 ZK proof</strong> generated entirely in your browser.
              Your SBT count and repayment history are <strong className="text-white">never revealed</strong> to the smart contract — only a
              cryptographic proof that you qualify.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

