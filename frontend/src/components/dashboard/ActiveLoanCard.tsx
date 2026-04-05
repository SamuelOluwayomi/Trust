"use client";
import { Clock, CheckCircle } from "@phosphor-icons/react";

interface ActiveLoanCardProps {
  activeLoan: any;
  isVerified: boolean;
  isRepaying: boolean;
  isBorrowing: boolean;
  onRepay: (amount: number, id: string) => void;
}

export default function ActiveLoanCard({ activeLoan, isVerified, isRepaying, isBorrowing, onRepay }: ActiveLoanCardProps) {
  const amount = activeLoan ? activeLoan.amount : 0;
  const amountPaid = activeLoan ? activeLoan.amount_paid : 0;
  const percentage = activeLoan ? Math.floor((amountPaid / amount) * 100) : 0;
  const amountDue = amount - amountPaid;

  return (
    <div className="bg-linear-to-br from-[#10B981]/20 to-[#050914] border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-emerald-400 tracking-widest text-[10px] font-bold uppercase mb-1">Active Loan</p>
          <h2 className="text-3xl font-black text-white">{amount} <span className="text-lg text-emerald-500">HSK</span></h2>
        </div>
        <div className="text-right">
          <p className="text-slate-400 tracking-widest text-[10px] font-bold uppercase mb-1">Amount Due</p>
          <p className="text-white font-bold">{amountDue} HSK</p>
        </div>
      </div>
      
      <div className="bg-[#050914]/50 rounded-2xl p-4 mb-6 border border-white/5 backdrop-blur-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-slate-400 flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-400"/> {activeLoan ? 'Due in 14 days' : 'No active loan'}</span>
          <span className="text-xs font-bold text-white">{percentage}% paid</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-linear-to-r from-emerald-600 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-1000"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button 
          disabled={!isVerified || isRepaying || isBorrowing || !activeLoan}
          onClick={() => activeLoan && onRepay(amountDue, activeLoan.id)}
          className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#050914] font-black text-xs tracking-widest py-3 rounded-xl uppercase transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center"
        >
          {isRepaying ? "Processing..." : "Repay Now"}
        </button>
        <button disabled={!activeLoan} className="px-6 bg-white/5 hover:bg-white/10 text-white font-bold text-xs tracking-widest rounded-xl transition-colors border border-white/5 disabled:opacity-50">
          Details
        </button>
      </div>
    </div>
  );
}
