"use client";

import { Bell, MagnifyingGlass, Wallet, List } from "@phosphor-icons/react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDashboardData } from "@/hooks/useDashboardData";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useUserStats } from "@/hooks/useContracts";
import { ShieldCheck, Certificate } from "@phosphor-icons/react";

export default function Header({ onMenuClick }: { onMenuClick?: () => void }) {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { transactions } = useDashboardData();
  const { isVerified } = useUserProfile();
  const { sbtCount, tierName } = useUserStats();
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Sync internal state with URL on mount or change
  useEffect(() => {
    setSearchValue(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (val: string) => {
    setSearchValue(val);
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set("q", val);
    } else {
      params.delete("q");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const walletAddress = wallets[0]?.address;
  const truncatedAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : "Not connected";

  return (
    <header className="h-20 lg:ml-64 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      
      {/* Left items - Hamburger & Search roughly */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <List className="w-6 h-6" />
        </button>
        <div className="relative hidden md:block w-72">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-[#050914] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right items - User Profile & Context */}
      <div className="flex items-center gap-6">
        
        {/* Tier Badge */}
        <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
          isVerified ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800/50 border-slate-700/50 text-slate-400'
        }`}>
          <ShieldCheck className="w-3.5 h-3.5" weight={isVerified ? "fill" : "regular"} />
          <span className="text-[10px] font-bold tracking-widest uppercase">{tierName} Tier</span>
        </div>

        {/* SBT Count */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <Certificate className="w-3.5 h-3.5" weight="fill" />
          <span className="text-xs font-black">{sbtCount}</span>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">SBTs</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
          >
            <Bell className="w-4 h-4 text-slate-300" />
            {transactions.length > 0 && (
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute top-full right-0 mt-4 w-72 bg-[#050914] border border-white/10 rounded-2xl shadow-xl shadow-black overflow-hidden z-50">
              <div className="p-4 border-b border-white/5 font-black text-white text-xs tracking-widest uppercase">
                Recent Activity
              </div>
              <div className="max-h-64 overflow-y-auto">
                {transactions.length > 0 ? transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors">
                    <p className="text-xs text-white font-bold">{tx.type === 'borrow' ? 'Loan Approved' : 'Repayment Processed'}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{tx.type === 'borrow' ? `You borrowed ${tx.amount} HSK.` : `You repaid ${tx.amount} HSK.`}</p>
                    <p className="text-[9px] text-emerald-500 mt-2 font-mono">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                )) : (
                  <div className="p-4 text-center text-xs text-slate-500">No recent activity.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile / Wallet */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="flex-col items-end hidden md:flex">
            <span className="text-xs font-bold text-white">{truncatedAddress}</span>
            <span className="text-[10px] text-emerald-400 font-medium">Connected</span>
          </div>
          <button className="w-10 h-10 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center border-2 border-[#0a0f1e] shadow-[0_0_0_2px_rgba(255,255,255,0.1)]">
            <Wallet className="w-5 h-5 text-white" weight="fill" />
          </button>
        </div>

      </div>

    </header>
  );
}
