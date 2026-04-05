"use client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useActiveLoan } from "@/hooks/useContracts";
import ActiveLoanCard from "@/components/dashboard/ActiveLoanCard";
import { Wallet } from "@phosphor-icons/react";
import Link from "next/link";

export default function LoansPage() {
  const { isVerified } = useUserProfile();
  const { hasActiveLoan, amount, status, repay, repaying, loading } = useActiveLoan();

  const activeLoanData = hasActiveLoan ? { amount: Number(amount), amount_paid: 0, id: 'chain-active' } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-emerald-500 text-sm tracking-widest animate-pulse font-black uppercase">Loading Loans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">My Loans</h1>
          <p className="text-slate-500 text-sm">Manage your active debt and collateral.</p>
        </div>
      </div>

      {hasActiveLoan ? (
        <div className="max-w-2xl">
          <ActiveLoanCard 
            activeLoan={activeLoanData} 
            isVerified={isVerified}
            isRepaying={repaying}
            isBorrowing={false}
            onRepay={repay}
          />
        </div>
      ) : (
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <Wallet className="w-10 h-10 text-slate-600" weight="duotone" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No Active Loans</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              You don't have any outstanding loans. Your credit capacity is ready for your next move.
            </p>
          </div>
          <Link 
            href="/dashboard/borrow"
            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-[#050914] font-black text-xs tracking-widest rounded-xl uppercase transition-transform active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            Browse Tiers
          </Link>
        </div>
      )}
    </div>
  );
}
