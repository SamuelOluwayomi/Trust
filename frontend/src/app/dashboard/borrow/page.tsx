"use client";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useLending } from "@/hooks/useLending";
import LoanTierCard from "@/components/dashboard/LoanTierCard";
import { ShieldCheck, Info, WarningCircle, Coins } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

export default function BorrowPage() {
  const { isVerified, profile } = useUserProfile();
  const { borrow, isBorrowing, isRepaying, error, getStats } = useLending();
  const [stats, setStats] = useState<any>(null);

  // Sync real-time on-chain stats (Tier, Limits)
  useEffect(() => {
    const sync = async () => {
      const data = await getStats();
      if (data) setStats(data);
    };
    sync();
  }, [getStats, isBorrowing]);

  const handleBorrow = async (amount: number) => {
    if (!isVerified) return;
    // Pass the real World ID nullifier stored in Supabase
    const success = await borrow(amount, profile?.worldid_nullifier || undefined);
    if (success) {
      window.location.href = "/dashboard/my-loans";
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
              isBorrowing={isBorrowing}
              isRepaying={isRepaying}
              onBorrow={() => handleBorrow(tier.amount)}
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
        </div>
      </div>
    </div>
  );
}
