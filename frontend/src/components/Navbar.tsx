"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ShieldCheck, Compass, GithubLogo, BookOpen, SignIn, UserPlus, List, X } from "@phosphor-icons/react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4 sm:py-6"
    >
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 h-12 px-6 bg-[#020617]/40 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10">
          <ShieldCheck className="w-5 h-5 text-emerald-500" weight="fill" />
          <span className="text-sm font-black tracking-[0.2em] text-white/90 uppercase">
            Trust<span className="text-emerald-500">.</span>
          </span>
        </div>

        {/* Center: Nav links (Desktop only) */}
        <div className="hidden md:flex items-center gap-1 bg-[#020617]/30 backdrop-blur-3xl px-2 py-2 rounded-full shadow-2xl border border-white/10">
          {navLinks.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 px-6 py-2.5 rounded-full text-[11px] font-bold text-white/50 hover:text-emerald-400 hover:bg-white/10 transition-all duration-300 tracking-widest uppercase whitespace-nowrap"
            >
              <item.icon className="w-3.5 h-3.5" weight="bold" />
              {item.label}
            </a>
          ))}
        </div>

        {/* Right: Actions (Desktop only) */}
        <div className="hidden md:flex items-center gap-2 bg-[#020617]/30 backdrop-blur-3xl px-2 py-2 rounded-full shadow-2xl border border-white/10">
          <button className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-bold text-white/60 hover:text-white transition-all duration-300 tracking-widest uppercase rounded-full hover:bg-white/10">
            <SignIn className="w-4 h-4" weight="bold" />
            Login
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[11px] font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-lg shadow-emerald-500/20 tracking-widest uppercase">
            <UserPlus className="w-4 h-4" weight="bold" />
            Register
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile: Hamburger toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-12 h-12 rounded-full bg-[#020617]/40 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-emerald-400 transition-colors duration-300"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5" weight="bold" /> : <List className="w-5 h-5" weight="bold" />}
        </button>
      </div>

      {/* Mobile: Slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="md:hidden mt-3 rounded-2xl border border-white/10 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(2,6,23,0.85) 0%, rgba(15,23,42,0.9) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Top shimmer */}
            <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/15 to-transparent pointer-events-none" />

            {/* Nav links */}
            <div className="p-3 space-y-1">
              {navLinks.map((item, i) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.3 }}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold text-white/50 hover:text-emerald-400 hover:bg-white/6 transition-all duration-300 tracking-widest uppercase"
                >
                  <item.icon className="w-4 h-4" weight="bold" />
                  {item.label}
                </motion.a>
              ))}
            </div>

            {/* Divider */}
            <div className="mx-4 border-t border-white/6" />

            {/* Actions */}
            <div className="p-3 space-y-2">
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-[11px] font-bold text-white/60 hover:text-white transition-all duration-300 tracking-widest uppercase rounded-xl hover:bg-white/6"
              >
                <SignIn className="w-4 h-4" weight="bold" />
                Login
              </motion.button>
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[11px] font-extrabold px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-500/20 tracking-widest uppercase"
              >
                <UserPlus className="w-4 h-4" weight="bold" />
                Register
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
