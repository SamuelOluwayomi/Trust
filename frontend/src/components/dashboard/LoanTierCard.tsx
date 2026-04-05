"use client";
import { HandCoins } from "@phosphor-icons/react";

interface LoanTierCardProps {
  tier: string;
  limit: string;
  isQualified: boolean;
  isBorrowing: boolean;
  isRepaying: boolean;
  onBorrow: (amount: number) => void;
  amount: number;
}

export default function LoanTierCard({ tier, limit, isQualified, isBorrowing, isRepaying, onBorrow, amount }: LoanTierCardProps) {
  return (
    <div className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${isQualified ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#050914] border-white/5 opacity-60'}`}>
      {isQualified && <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-[#050914] text-[9px] font-black tracking-widest uppercase rounded-bl-lg">Current</div>}
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isQualified ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
          <HandCoins className="w-5 h-5" weight="fill" />
        </div>
        <div>
          <h4 className="text-white font-bold">{tier} Tier</h4>
          <p className={`text-[10px] tracking-widest uppercase ${isQualified ? 'text-emerald-500/80' : 'text-slate-500'}`}>Up to {limit} HSK</p>
        </div>
      </div>
      <button 
        disabled={!isQualified || isBorrowing || isRepaying}
        onClick={() => onBorrow(amount)}
        className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors border flex items-center justify-center ${isQualified ? 'bg-emerald-500 hover:bg-emerald-400 text-[#050914] border-transparent shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:hover:bg-emerald-500' : 'bg-transparent border-white/10 text-slate-500 cursor-not-allowed'}`}
      >
        {isBorrowing && isQualified ? "Processing..." : isQualified ? 'Apply for Loan' : 'Locked'}
      </button>
    </div>
  );
}
