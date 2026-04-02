"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { ShieldCheckIcon, CompassIcon, GithubLogoIcon, BookOpenIcon, SignInIcon, UserPlusIcon, ListIcon, XIcon } from "@phosphor-icons/react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", icon: CompassIcon, href: "#dashboard" },
    { label: "Github", icon: GithubLogoIcon, href: "https://github.com/SamuelOluwayomi/Trust" },
    { label: "Docs", icon: BookOpenIcon, href: "#docs" },
  ];

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 2.2 }}
      className="fixed top-0 left-0 right-0 z-60 px-4 sm:px-6 py-4 sm:py-6"
    >
      <div className="flex items-center justify-between">
        {/* Left: Logo */}
        <a
          href="/"
          className="flex items-center gap-2.5 h-12 max-w-[200px] px-4 bg-[#020617]/40 backdrop-blur-3xl rounded-full shadow-2xl border border-white/10 group transition-all duration-300 hover:border-emerald-500/30 overflow-hidden cursor-pointer no-underline"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 shrink-0 animate-pulse-slow">
            <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
          </svg>
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="text-[11px] font-black tracking-widest text-white uppercase whitespace-nowrap">
              Trust<span className="text-emerald-500">.</span>
            </span>
            <div className="h-4 w-px bg-white/15 shrink-0" />
            <div className="h-8 w-8 shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden group-hover:scale-110 transition-transform duration-300">
              <svg viewBox="144 71 48 48" className="w-full h-full">
                <path fill-rule="evenodd" clip-rule="evenodd" d="M154.442 80.3881L161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.902 108.005 161.835 108.089 161.745 108.106L154.436 109.612C154.313 109.64 154.2 109.544 154.2 109.421V80.5791C154.2 80.4555 154.318 80.36 154.442 80.3881ZM181.559 80.3881L174.25 82.0454C174.16 82.0622 174.098 82.1409 174.098 82.2307V107.915C174.098 108.005 174.166 108.089 174.256 108.106L181.564 109.612C181.688 109.64 181.8 109.544 181.8 109.421V80.5791C181.8 80.4555 181.682 80.36 181.559 80.3881ZM171.851 91.2249V98.5898V98.7583H171.683H164.318H164.149V98.5898V91.2249V91.0563H164.318H171.683H171.851V91.2249Z" fill="black"/>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M161.119 82.7051L154.983 81.3138V108.7L161.119 107.436V82.7051ZM174.881 82.7051V107.436L181.017 108.7V81.3138L174.881 82.7051ZM161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.902 108.005 161.835 108.089 161.745 108.106L154.436 109.612C154.313 109.64 154.2 109.544 154.2 109.421V80.5791C154.2 80.4555 154.318 80.36 154.442 80.3881L161.75 82.0454ZM181.564 109.612L174.256 108.106C174.166 108.089 174.098 108.005 174.098 107.915V82.2307C174.098 82.1409 174.16 82.0622 174.25 82.0454L181.559 80.3881C181.682 80.36 181.8 80.4555 181.8 80.5791V109.421C181.8 109.544 181.688 109.64 181.564 109.612ZM171.068 97.9753V91.8394H164.932V97.9753H171.068ZM164.149 98.7583V91.0563H171.851V98.7583H164.149Z" fill="black"/>
              </svg>
            </div>
          </div>
        </a>

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
            <SignInIcon className="w-4 h-4" weight="bold" />
            Login
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[11px] font-extrabold px-6 py-2.5 rounded-full transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-lg shadow-emerald-500/20 tracking-widest uppercase">
            <UserPlusIcon className="w-4 h-4" weight="bold" />
            Register
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile: Hamburger toggle */}
        <div className="md:hidden z-50">
          <button
            onClick={() => setMobileOpen((open) => !open)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-[#020617]/40 backdrop-blur-3xl border border-white/10 text-white/70 hover:text-emerald-400 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <XIcon className="w-5 h-5" weight="bold" /> : <ListIcon className="w-5 h-5" weight="bold" />}
          </button>
        </div>
      </div>

      {/* Mobile: Slide-down menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop for closing when clicking outside */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-[#020617]/20 backdrop-blur-sm md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="md:hidden absolute top-16 left-2 right-2 z-50 mt-1 rounded-2xl border border-white/10 overflow-hidden"
              style={{
                background: "linear-gradient(135deg, rgba(2,6,23,0.96) 0%, rgba(8,20,38,0.98) 100%)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
                boxShadow: "inset 0 1px 0 0 rgba(255,255,255,0.06), 0 12px 36px rgba(0,0,0,0.55)",
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
                  <SignInIcon className="w-4 h-4" weight="bold" />
                  Login
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25, duration: 0.3 }}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[11px] font-extrabold px-6 py-3 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-emerald-500/20 tracking-widest uppercase"
                >
                  <UserPlusIcon className="w-4 h-4" weight="bold" />
                  Register
                  <ChevronRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}