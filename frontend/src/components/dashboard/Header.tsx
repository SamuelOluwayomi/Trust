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

  // Sync internal state with URL on mount only
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearchValue(q);
  }, []); // Only on mount

  // Debounce URL update
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchValue) {
        params.set("q", searchValue);
      } else {
        params.delete("q");
      }
      
      // Update URL without a full page reload or scroll jump
      const newUrl = `${pathname}?${params.toString()}`;
      if (window.location.search !== `?${params.toString()}`) {
        router.replace(newUrl, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchValue, pathname, router, searchParams]);

  const handleSearch = (val: string) => {
    setSearchValue(val);
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.wallet?.address) {
      navigator.clipboard.writeText(user.wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const primaryWallet = user?.wallet?.address;
  const userEmail = user?.email?.address || user?.google?.email;
  
  const truncatedAddress = primaryWallet
    ? `${primaryWallet.slice(0, 6)}...${primaryWallet.slice(-4)}`
    : "No Wallet";

  return (
    <header className="h-20 lg:ml-64 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-30">
      
      {/* Left items - Hamburger & Search */}
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

      {/* Right items */}
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
          <div className="hidden md:flex flex-col items-end">
            {userEmail && <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">{userEmail}</span>}
            <div className="flex items-center gap-2 group cursor-pointer" onClick={handleCopy}>
              <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">{truncatedAddress}</span>
              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${copied ? 'bg-emerald-500 text-black' : 'bg-white/5 text-slate-500'} transition-all`}>
                {copied ? 'Copied' : 'Copy'}
              </span>
            </div>
          </div>
          <button 
            onClick={handleCopy}
            className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-emerald-700 flex items-center justify-center border border-white/10 shadow-lg"
          >
            <Wallet className="w-5 h-5 text-[#020617]" weight="fill" />
          </button>
        </div>

      </div>
    </header>
  );
}
