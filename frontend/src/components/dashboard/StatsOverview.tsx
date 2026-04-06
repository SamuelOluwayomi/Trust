"use client";
import { HandCoins, Wallet, Certificate, ShieldCheck, ArrowUpRight, ArrowDownRight } from "@phosphor-icons/react";

interface StatItem {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: any;
}

interface StatsOverviewProps {
  totalBorrowed: number;
  totalDue: number;
  totalSbts: number;
  hskBalance: number;
  isVerified: boolean;
  tier: string;
  onSendClick?: () => void;
}

export default function StatsOverview({ 
  totalBorrowed, 
  totalDue, 
  totalSbts, 
  hskBalance, 
  isVerified, 
  tier,
  onSendClick 
}: StatsOverviewProps) {
  const stats: StatItem[] = [
    { 
      label: "Wallet Balance", 
      value: `${hskBalance.toFixed(4)} HSK`, 
      change: "LIVE", 
      positive: true, 
      icon: HandCoins 
    },
    { 
      label: "Total Borrowed", 
      value: totalBorrowed > 0 ? `${totalBorrowed} HSK` : "0 HSK", 
      change: "+0%", 
      positive: true, 
      icon: HandCoins 
    },
    { 
      label: "Amount Due", 
      value: totalDue > 0 ? `${totalDue} HSK` : "0 HSK", 
      change: "+0%", 
      positive: true, 
      icon: Wallet 
    },
    { 
      label: "SBTs Earned", 
      value: `${totalSbts}`, 
      change: "+0", 
      positive: true, 
      icon: Certificate 
    },
    { 
      label: "Current Tier", 
      value: tier, 
      change: isVerified ? "Verified" : "Unverified", 
      positive: isVerified, 
      icon: ShieldCheck 
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="bg-[#050914] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors group">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
              <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" weight="duotone" />
            </div>
            <div className={`flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded-md ${stat.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {stat.change}
            </div>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase mb-1">{stat.label}</p>
          <div className="flex justify-between items-end">
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
            {stat.label === "Wallet Balance" && onSendClick && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onSendClick();
                }}
                className="px-3 py-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-500/20 hover:bg-blue-500/20 transition-all font-sans"
              >
                Send
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
