"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ShieldCheck, Compass, GithubLogo, BookOpen, SignIn, UserPlus } from "@phosphor-icons/react";

export default function Navbar() {
  const navLinks = [
    { label: "Dashboard", icon: Compass, href: "#dashboard" },
    { label: "Github", icon: GithubLogo, href: "https://github.com/SamuelOluwayomi/Trust" },
    { label: "Docs", icon: BookOpen, href: "#docs" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 flex items-center justify-between"
    >
      {/* Left: Logo */}
      <div className="flex items-center gap-3 h-12 px-6 bg-[#020617]/80 backdrop-blur-2xl rounded-full shadow-2xl border border-white/5">
        <ShieldCheck className="w-5 h-5 text-emerald-500" weight="fill" />
        <span className="text-sm font-black tracking-[0.2em] text-white/90 uppercase">
          Trust<span className="text-emerald-500">.</span>
        </span>
      </div>

      {/* Center: Nav links */}
      <div className="hidden md:flex items-center gap-1 bg-[#020617]/60 backdrop-blur-2xl px-2 py-2 rounded-full shadow-2xl border border-white/5">
        {navLinks.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-bold text-white/50 hover:text-emerald-400 hover:bg-white/5 transition-all duration-300 tracking-widest uppercase whitespace-nowrap"
          >
            <item.icon className="w-3.5 h-3.5" weight="bold" />
            {item.label}
          </a>
        ))}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 bg-[#020617]/60 backdrop-blur-2xl px-2 py-2 rounded-full shadow-2xl border border-white/5">
        <button className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold text-white/50 hover:text-white transition-all duration-300 tracking-widest uppercase rounded-full hover:bg-white/5">
          <SignIn className="w-4 h-4" weight="bold" />
          Login
        </button>
        <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[11px] font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-lg shadow-emerald-500/20 tracking-widest uppercase">
          <UserPlus className="w-4 h-4" weight="bold" />
          Register
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.nav>
  );
}
