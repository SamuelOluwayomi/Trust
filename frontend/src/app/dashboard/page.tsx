"use client";

import { useSearchParams } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { useUserStats, useActiveLoan } from "@/hooks/useContracts";
import StatsOverview from "@/components/dashboard/StatsOverview";
import ActiveLoanCard from "@/components/dashboard/ActiveLoanCard";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { ShieldCheck, LockKey, CheckCircle } from "@phosphor-icons/react";
import WorldIDVerify from "@/components/WorldIDVerify";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useDashboardData } from "@/hooks/useDashboardData"; // Keep for history/transactions

export default function DashboardOverview() {
  const { user } = usePrivy();
  const { isVerified, verify } = useUserProfile();
  const { sbtCount, totalBorrowed, totalRepaid, loanLimit, tierName, balance, loading: statsLoading } = useUserStats();
  const { hasActiveLoan, amount, status, repay, repaying, loading: loanLoading } = useActiveLoan();
  const { transactions, loading: historyLoading } = useDashboardData();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const totalDueAmount = Number(totalBorrowed) - Number(totalRepaid);
  const activeLoanData = hasActiveLoan ? { amount: Number(amount), amount_paid: 0, id: 'chain-active' } : null;

  // Identity logic for display
  const primaryId = user?.email?.address || user?.google?.email || (user?.wallet?.address ? `${user.wallet.address.slice(0, 6)}...${user.wallet.address.slice(-4)}` : 'identity');

  // Filter transactions for charts based on query
  const filteredTransactions = transactions.filter(tx => 
    tx.type.toLowerCase().includes(query) || 
    tx.amount.toString().includes(query)
  );

  const dynamicHistoryData = filteredTransactions.length > 0 
    ? filteredTransactions.filter(tx => tx.type === 'repay').map((tx, idx) => ({ date: `Tx ${idx+1}`, amount: tx.amount }))
    : [{ date: 'No Data', amount: 0 }];

  if (statsLoading || loanLoading || historyLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-emerald-500 text-sm tracking-widest animate-pulse font-black uppercase">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Identity & Active Loan Header */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ZK Proof Compact */}
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isVerified ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                  {isVerified ? (
                    <ShieldCheck className="w-5 h-5 text-emerald-400" weight="fill" />
                  ) : (
                    <LockKey className="w-5 h-5 text-red-400" weight="fill" />
                  )}
                </div>
                <h2 className="text-lg font-black tracking-widest text-white uppercase">
                  {isVerified ? "ZK Proof Active" : "Unverified"}
                </h2>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-sm mb-6">
                {isVerified ? (
                  <> Your identity is verified as a unique human. You have unlocked the <strong className="text-emerald-400">Bronze Tier</strong>.</>
                ) : (
                  <> Verify account <strong className="text-white italic">{primaryId}</strong> with World ID to unlock lending tiers and start borrowing.</>
                )}
              </p>
            </div>
            {!isVerified && (
              <div className="w-full max-w-[200px]">
                <WorldIDVerify onVerified={verify} />
              </div>
            )}
            {isVerified && (
              <div className="px-3 py-1.5 w-fit rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase flex items-center gap-2">
                <CheckCircle className="w-4 h-4" weight="fill" />
                Verified via WorldID
              </div>
            )}
          </div>
        </div>

        {/* Active Loan Card */}
        <ActiveLoanCard 
           activeLoan={activeLoanData} 
           isVerified={isVerified}
           isRepaying={repaying}
           isBorrowing={false}
           onRepay={repay}
        />
      </div>

      {/* 2. Stats Row */}
      <StatsOverview 
        totalBorrowed={Number(totalBorrowed)}
        totalDue={totalDueAmount}
        totalSbts={sbtCount}
        hskBalance={Number(balance)}
        isVerified={isVerified}
        tier={tierName}
      />

      {/* 3. Analytics Section */}
      <div className="bg-[#050914] border border-white/5 rounded-3xl p-6 flex flex-col h-80">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h3 className="text-white font-black tracking-widest uppercase text-sm">Protocol Activity</h3>
            <p className="text-slate-500 text-xs mt-1">Your recent HSK repayment volume.</p>
          </div>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicHistoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="date" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}`} />
              <Tooltip 
                cursor={{fill: 'rgba(255,255,255,0.02)'}}
                contentStyle={{ backgroundColor: '#0a0f1e', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#10B981', fontWeight: 'bold' }}
              />
              <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
