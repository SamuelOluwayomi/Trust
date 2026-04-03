"use client";

import { 
  ShieldCheck, Wallet, HandCoins, Certificate, 
  ArrowUpRight, ArrowDownRight, TelegramLogo, 
  CheckCircle, Clock, LockKey
} from "@phosphor-icons/react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useLending } from "@/hooks/useLending";
import { useDashboardData } from "@/hooks/useDashboardData";
import WorldIDVerify from "@/components/WorldIDVerify";

// --- Stub Data ---
const defaultStatsData = [
  { label: "Total Borrowed", value: "$4,500", change: "+12.5%", positive: true, icon: HandCoins },
  { label: "Amount Due", value: "$520", change: "-2.4%", positive: true, icon: Wallet },
  { label: "SBTs Earned", value: "2", change: "+1", positive: true, icon: Certificate },
  { label: "Current Tier", value: "None", change: "Unverified", positive: false, icon: ShieldCheck },
];

const historyData = [
  { date: 'Mar', amount: 120 },
  { date: 'Apr', amount: 250 },
  { date: 'May', amount: 150 },
  { date: 'Jun', amount: 480 },
  { date: 'Jul', amount: 300 },
  { date: 'Aug', amount: 550 },
];

const pieData = [
  { name: 'Progress', value: 75, color: '#10B981' },
  { name: 'Remaining', value: 25, color: 'rgba(255,255,255,0.05)' },
];

const tableData = [
  { date: "Oct 24, 2025", amount: "500 HSK", tier: "Bronze", status: "Repaid", sbt: "#0142" },
  { date: "Nov 12, 2025", amount: "1,200 HSK", tier: "Silver", status: "Active", sbt: "Pending" },
  { date: "Dec 05, 2025", amount: "300 HSK", tier: "Silver", status: "Repaid", sbt: "#0891" },
];

export default function DashboardPage() {
  const { user } = usePrivy();
  const { wallets } = useWallets();

  const walletAddress = wallets[0]?.address;
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  const { profile, loading: profileLoading, isVerified } = useUserProfile();
  const { borrow, repay, isBorrowing, isRepaying } = useLending();
  const { loans, transactions, loading: dashboardLoading } = useDashboardData();

  const userEmail = user?.google?.email || user?.email?.address || null;

  const currentTier = isVerified ? "Bronze" : "None";
  
  const totalBorrowedAmount = loans.reduce((acc, loan) => acc + Number(loan.amount), 0);
  const totalDueAmount = loans.reduce((acc, loan) => acc + (Number(loan.amount) - Number(loan.amount_paid)), 0);
  const activeLoan = loans.find(l => l.status === 'Active');
  const totalSbts = loans.filter(l => l.status === 'Repaid').length;

  const dynamicStatsData = [...defaultStatsData];
  dynamicStatsData[0] = { ...dynamicStatsData[0], value: totalBorrowedAmount > 0 ? `${totalBorrowedAmount} HSK` : "$0", change: "+0%" };
  dynamicStatsData[1] = { ...dynamicStatsData[1], value: totalDueAmount > 0 ? `${totalDueAmount} HSK` : "$0", change: "+0%" };
  dynamicStatsData[2] = { ...dynamicStatsData[2], value: `${totalSbts}`, change: "+0" };
  dynamicStatsData[3] = { 
    label: "Current Tier", 
    value: currentTier, 
    change: isVerified ? "Verified" : "Unverified", 
    positive: isVerified, 
    icon: ShieldCheck 
  };

  const dynamicHistoryData = transactions.length > 0 
    ? transactions.filter(tx => tx.type === 'repay').map((tx, idx) => ({ date: `Tx ${idx+1}`, amount: tx.amount }))
    : []; 
    
  if (dynamicHistoryData.length === 0) {
      dynamicHistoryData.push({ date: 'No Data', amount: 0 });
  }

  const percentage = activeLoan ? Math.floor((activeLoan.amount_paid / activeLoan.amount) * 100) : 0;
  const dynamicPieData = [
    { name: 'Progress', value: activeLoan ? percentage : 0, color: '#10B981' },
    { name: 'Remaining', value: activeLoan ? 100 - percentage : 100, color: 'rgba(255,255,255,0.05)' }
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. Top Section: ZK Proof Status & Active Loan */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ZK Proof Status */}
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <LockKey className="w-32 h-32 text-emerald-500 transform rotate-12" weight="fill" />
          </div>
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
                Connected as <span className="text-white font-bold">{userEmail || truncatedAddress}</span>. 
                {isVerified ? (
                  <> Your financial credentials have been verified locally. You unlocked the <strong className="text-emerald-400">Bronze Tier</strong> without exposing any sensitive data.</>
                ) : (
                  <> You need to verify your identity to unlock lending tiers and start borrowing.</>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {isVerified ? (
                <>
                  <div className="px-3 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-xs font-bold tracking-widest uppercase flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" weight="fill" />
                    Valid until Dec 2026
                  </div>
                  <button className="text-xs font-bold tracking-widest text-slate-500 uppercase hover:text-white transition-colors">
                    Regenerate Proof
                  </button>
                </>
              ) : (
                <div className="w-full max-w-[200px]">
                  <WorldIDVerify onVerified={() => window.location.reload()} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Active Loan Card */}
        <div className="bg-linear-to-br from-[#10B981]/20 to-[#050914] border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-emerald-400 tracking-widest text-[10px] font-bold uppercase mb-1">Active Loan</p>
              <h2 className="text-3xl font-black text-white">{activeLoan ? activeLoan.amount : 0} <span className="text-lg text-emerald-500">HSK</span></h2>
            </div>
            <div className="text-right">
              <p className="text-slate-400 tracking-widest text-[10px] font-bold uppercase mb-1">Amount Due</p>
              <p className="text-white font-bold">{activeLoan ? activeLoan.amount - activeLoan.amount_paid : 0} HSK</p>
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
              onClick={() => activeLoan && repay(activeLoan.amount - activeLoan.amount_paid, activeLoan.id)}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-[#050914] font-black text-xs tracking-widest py-3 rounded-xl uppercase transition-transform active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:hover:bg-emerald-500 flex items-center justify-center"
            >
              {isRepaying ? "Processing..." : "Repay Now"}
            </button>
            <button disabled={!activeLoan} className="px-6 bg-white/5 hover:bg-white/10 text-white font-bold text-xs tracking-widest rounded-xl transition-colors border border-white/5 disabled:opacity-50">
              Details
            </button>
          </div>
        </div>

      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dynamicStatsData.map((stat, i) => (
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
            <h3 className="text-2xl font-black text-white">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 3. Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Bar Chart: Repayment History */}
        <div className="lg:col-span-2 bg-[#050914] border border-white/5 rounded-3xl p-6 flex flex-col h-80">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h3 className="text-white font-black tracking-widest uppercase text-sm">Loan Repayment History</h3>
              <p className="text-slate-500 text-xs mt-1">Monthly HSK repaid over time.</p>
            </div>
            <select className="bg-[#0a0f1e] border border-white/10 text-xs font-bold text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500/50">
              <option>This Year</option>
              <option>All Time</option>
            </select>
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

        {/* Ring Chart: Tier Progress */}
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-6 flex flex-col h-80 items-center justify-center relative">
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start">
            <div>
              <h3 className="text-white font-black tracking-widest uppercase text-sm">Tier Progress</h3>
              <p className="text-slate-500 text-xs mt-1">To Gold Tier</p>
            </div>
          </div>
          
          <div className="w-48 h-48 relative mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  {dynamicPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-white">{percentage}<span className="text-emerald-500 text-lg">%</span></span>
              <span className="text-[10px] tracking-widest text-slate-500 uppercase font-bold mt-1">Score</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Borrow Section (Tier Cards) */}
      <div>
        <h3 className="text-white font-black tracking-widest uppercase text-sm mb-4">Available Loan Tiers</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {["Bronze", "Silver", "Gold"].map((tier, i) => {
            const isQualified = isVerified && tier === "Bronze"; // Initially only Bronze unlocked on verification
            return (
              <div key={tier} className={`border rounded-2xl p-5 relative overflow-hidden transition-all ${isQualified ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-[#050914] border-white/5 opacity-60'}`}>
                {isQualified && <div className="absolute top-0 right-0 px-3 py-1 bg-emerald-500 text-[#050914] text-[9px] font-black tracking-widest uppercase rounded-bl-lg">Current</div>}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isQualified ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-white/10 text-slate-400'}`}>
                    <HandCoins className="w-5 h-5" weight="fill" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{tier} Tier</h4>
                    <p className={`text-[10px] tracking-widest uppercase ${isQualified ? 'text-emerald-500/80' : 'text-slate-500'}`}>Up to {i===0?'500':i===1?'2k':'10k'} HSK</p>
                  </div>
                </div>
                <button 
                  disabled={!isQualified || isBorrowing || isRepaying}
                  onClick={() => borrow(i===0?500:i===1?2000:10000)}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-colors border flex items-center justify-center ${isQualified ? 'bg-emerald-500 hover:bg-emerald-400 text-[#050914] border-transparent shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:hover:bg-emerald-500' : 'bg-transparent border-white/10 text-slate-500 cursor-not-allowed'}`}
                >
                  {isBorrowing && isQualified ? "Processing..." : isQualified ? 'Apply for Loan' : 'Locked'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Repayment History Table */}
      <div className="bg-[#050914] border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h3 className="text-white font-black tracking-widest uppercase text-sm">Recent Transactions</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#0a0f1e]/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Date</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Tier</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">SBT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loans.slice().sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((loan) => (
                <tr key={loan.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-xs font-medium text-slate-300">{new Date(loan.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-xs font-bold text-white">{loan.amount} HSK</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{loan.tier}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-[6px] text-[10px] font-bold tracking-widest uppercase ${loan.status === 'Repaid' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-blue-500/10 text-blue-400'}`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono text-slate-500">{loan.status === 'Repaid' ? '#0142' : 'Pending'}</td>
                </tr>
              ))}
              {loans.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">No transaction history found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Telegram Bot Connect Banner */}
      <div className="bg-linear-to-r from-[#10B981]/20 to-[#050914] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-emerald-500/10 to-transparent pointer-events-none" />
        <div className="flex items-center gap-5 z-10 w-full sm:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <TelegramLogo className="w-7 h-7 text-[#050914]" weight="fill" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg mb-1">Get Instant Alerts</h3>
            <p className="text-slate-400 text-xs">Connect Telegram to receive loan approval and repayment reminders.</p>
          </div>
        </div>
        <a 
          href={`https://t.me/Tru3t_Bot?start=${walletAddress || 'anonymous'}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-slate-200 text-[#050914] font-black text-xs tracking-widest rounded-xl uppercase transition-colors z-10 shrink-0 text-center"
        >
          Connect Bot
        </a>
      </div>

    </div>
  );
}
