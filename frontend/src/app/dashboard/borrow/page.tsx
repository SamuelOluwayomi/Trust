"use client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLending } from "@/hooks/useLending";
import { useDashboardData } from "@/hooks/useDashboardData";
import LoanTierCard from "@/components/dashboard/LoanTierCard";
import { ShieldCheck, Info, WarningCircle, Coins } from "@phosphor-icons/react";

export default function BorrowPage() {
  const { isVerified } = useUserProfile();
  const { borrow, isBorrowing, isRepaying } = useLending();
  const { loans } = useDashboardData();

  const activeLoan = loans.find(l => l.status === 'Active');

  const tiers = [
    { name: "Bronze", limit: "0.02", amount: 0.02 },
    { name: "Silver", limit: "0.05", amount: 0.05 },
    { name: "Gold", limit: "0.1", amount: 0.1 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Borrow Assets</h1>
          <p className="text-slate-500 text-sm">Select a tier based on your ZK-verified identity.</p>
        </div>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tiers.map((tier, i) => {
          const isQualified = isVerified && tier.name === "Bronze"; // Initially only Bronze unlocked on verification
          return (
            <LoanTierCard 
              key={tier.name}
              tier={tier.name}
              limit={tier.limit}
              isQualified={isQualified}
              isBorrowing={isBorrowing}
              isRepaying={isRepaying}
              onBorrow={borrow}
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
          {/* Collateral Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Collateral Mechanism</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every loan requires a <strong className="text-white">10% soft collateral</strong>. This collateral is locked for the duration of the loan and is returned to your wallet upon full repayment.
            </p>
          </div>

          {/* Repayment Terms */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Repayment Terms</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Standard loan duration is <strong className="text-white">30 days</strong>. Repaying on time boosts your credit score and helps you unlock higher borrowing limits (Silver and Gold tiers).
            </p>
          </div>

          {/* Default Risk */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <WarningCircle className="w-5 h-5 text-red-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Default & Blacklisting</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              If a loan is not repaid within the 30-day window, your collateral will be forfeited, and your World ID identity will be <strong className="text-red-400">permanently blacklisted</strong> from our protocol.
            </p>
          </div>

          {/* Identity Protection */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" weight="fill" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identity Privacy</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your borrowing behavior is linked to your Soul-Bound Token (SBT), not your personal data. All verifications are processed via <strong className="text-emerald-400">Zero-Knowledge Proofs</strong> to ensure maximum privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
