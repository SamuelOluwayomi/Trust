"use client";

import { Bell, MagnifyingGlass, Wallet } from "@phosphor-icons/react";

export default function Header() {
  return (
    <header className="h-20 lg:ml-64 bg-[#0a0f1e]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30">
      
      {/* Left items - Search roughly */}
      <div className="flex items-center gap-4 flex-1">
        <div className="relative hidden md:block w-72">
          <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search dashboard..." 
            className="w-full bg-[#050914] border border-white/5 rounded-full py-2 pl-10 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Right items - User Profile & Context */}
      <div className="flex items-center gap-6">
        
        {/* Tier Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50">
          <span className="w-2 h-2 rounded-full bg-slate-400" />
          <span className="text-[10px] font-bold tracking-widest text-slate-300 uppercase">Silver Tier</span>
        </div>

        {/* SBT Count */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
          <span className="text-xs font-black">2</span>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">SBTs</span>
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <Bell className="w-4 h-4 text-slate-300" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </button>

        {/* Profile / Wallet */}
        <div className="flex items-center gap-3 pl-6 border-l border-white/10">
          <div className="flex-col items-end hidden md:flex">
            <span className="text-xs font-bold text-white">0x71C...49A2</span>
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
