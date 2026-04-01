"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ShieldCheck, Compass, GithubLogo, BookOpen, SignIn, UserPlus } from "@phosphor-icons/react";

export default function Navbar() {
  const navLinks = [
    { label: "Sentinel Portal", icon: Compass, href: "#sentinel-portal" },
    { label: "Github", icon: GithubLogo, href: "#github" },
    { label: "Documentation", icon: BookOpen, href: "#documentation" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-2.5 h-11 px-5 bg-[#171717]/75 backdrop-blur-2xl rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-white/8">
        <ShieldCheck className="w-5 h-5 text-[#b56605]" weight="duotone" />
        <span className="text-sm font-extrabold tracking-tight text-white/90">NEXA<span className="text-[#d4850a]">GUARD</span></span>
      </div>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-1 bg-[#171717]/55 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_4px_25px_rgba(0,0,0,0.12)] border border-white/8">
        {navLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold text-white/70 hover:text-[#d4850a] hover:bg-white/8 transition-all duration-200 tracking-wide whitespace-nowrap"
          >
            <item.icon className="w-4 h-4" weight="bold" />
            {item.label}
          </a>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 bg-[#171717]/55 backdrop-blur-2xl px-1.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.12)] border border-white/8">
        <button className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white/70 hover:text-white transition-all duration-200 tracking-wide rounded-full hover:bg-white/8">
          <SignIn className="w-4 h-4" weight="bold" />
          Log in
        </button>
        <button className="flex items-center gap-1.5 bg-linear-to-r from-[#b56605] to-[#d4850a] hover:from-[#c97210] hover:to-[#e09015] text-white text-xs font-bold px-5 py-2 rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-[0_2px_12px_rgba(181,102,5,0.3)]">
          <UserPlus className="w-4 h-4" weight="bold" />
          Create Account
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.nav>
  );
}
