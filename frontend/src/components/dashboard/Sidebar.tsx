"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SquaresFour,
  Wallet,
  HandCoins,
  ShieldCheck,
  ClockCounterClockwise,
  Certificate,
  Gear,
  PaperPlaneRight,
  X,
} from "@phosphor-icons/react";

const MENU_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: SquaresFour },
  { label: "My Loans", href: "#", icon: Wallet },
  { label: "Borrow", href: "#", icon: HandCoins },
  { label: "ZK Proof", href: "#", icon: ShieldCheck },
];

const FINANCIAL_ITEMS = [
  { label: "Repayment History", href: "#", icon: ClockCounterClockwise },
  { label: "Soulbound Tokens", href: "#", icon: Certificate },
];

const TOOLS_ITEMS = [
  { label: "Settings", href: "#", icon: Gear },
  { label: "Telegram Bot", href: "https://t.me/Tru3t_Bot", icon: PaperPlaneRight },
];

export default function Sidebar({ isOpen = false, onClose }: { isOpen?: boolean, onClose?: () => void }) {
  const pathname = usePathname();

  const NavItem = ({ item }: { item: any }) => {
    const isActive = pathname === item.href;

    return (
      <Link
        href={item.href}
        target={item.href.startsWith("http") ? "_blank" : undefined}
        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
          isActive
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]"
            : "text-slate-400 hover:bg-white/5 hover:text-white"
        }`}
        onClick={() => {
          if (window.innerWidth < 1024 && onClose) onClose();
        }}
      >
        <item.icon
          className={`w-5 h-5 ${isActive ? "text-emerald-400" : "text-slate-500"}`}
          weight={isActive ? "fill" : "regular"}
        />
        {item.label}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Area */}
      <aside className={`fixed left-0 top-0 bottom-0 w-64 bg-[#050914] border-r border-white/5 overflow-y-auto z-50 flex flex-col transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand */}
        <div className="flex items-center justify-between gap-3 px-6 h-20 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <img src="/shield.svg" alt="Trust Logo" className="w-6 h-6 object-contain drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-xl font-black tracking-widest text-white uppercase mt-0.5">
              Trust<span className="text-emerald-500">.</span>
            </span>
          </div>
          {/* Close button for mobile */}
          <button onClick={onClose} className="lg:hidden p-2 -mr-2 text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

      <div className="flex-1 px-4 py-8 space-y-8 overflow-y-auto">
        {/* Menu Section */}
        <div>
          <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Menu</p>
          <div className="space-y-1">
            {MENU_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Financial Section */}
        <div>
          <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Financial</p>
          <div className="space-y-1">
            {FINANCIAL_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </div>

        {/* Tools Section */}
        <div>
          <p className="px-4 text-[10px] font-bold tracking-widest text-slate-500 uppercase mb-3">Tools</p>
          <div className="space-y-1">
            {TOOLS_ITEMS.map((item) => (
              <NavItem key={item.label} item={item} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer Card */}
      <div className="p-4 mt-auto mb-4 mx-4 rounded-2xl bg-linear-to-br from-[#0a0f1e] to-[#040810] border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <p className="text-xs font-semibold text-white mb-1">Need help?</p>
        <p className="text-[10px] text-slate-400 mb-4">Contact our priority support line.</p>
        <button className="w-full py-2 bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-400 text-xs font-bold text-slate-300 rounded-lg transition-colors border border-white/5 hover:border-emerald-500/30">
          Contact Support
        </button>
      </div>

    </aside>
    </>
  );
}
