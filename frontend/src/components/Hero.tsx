"use client";

import { motion } from "framer-motion";
import { ChevronRight, Zap, Lock, TrendingUp } from "lucide-react";
import React from "react";

const Feature = ({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-start gap-4 group"
  >
    <div className="w-12 h-12 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/25 border border-emerald-500/10 transition-all duration-300">
      <Icon className="w-5 h-5 text-emerald-400" />
    </div>
    <div className="flex flex-col gap-1">
      <h3 className="text-[17px] font-bold text-white/90 tracking-tight">{title}</h3>
      <p className="text-[15px] leading-relaxed text-slate-400">{desc}</p>
    </div>
  </motion.div>
);

export default function Hero() {
  return (
    <section className="relative z-10 min-h-screen flex items-center px-6 pt-24 pb-12 overflow-hidden">
      {/* Subtle Background Overlay for minimum text contrast */}
      <div className="absolute inset-x-0 inset-y-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.3)_0%,transparent_100%)] w-full" />
      
      <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col items-center justify-center pt-10">
        <div className="max-w-3xl flex flex-col gap-10 items-center">
          
          <div className="flex flex-col gap-6 text-center items-center">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-3xl sm:text-4xl xl:text-[5rem] font-black text-white tracking-[-0.04em] leading-[0.95]"
              style={{
                filter: "drop-shadow(1px 1px 0px #3f3f46) drop-shadow(2px 2px 0px #27272a) drop-shadow(3px 3px 0px #18181b) drop-shadow(4px 4px 0px #09090b) drop-shadow(8px 8px 15px rgba(0,0,0,0.8))"
              }}
            >
              Prove You{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-b from-emerald-400 to-emerald-600">
                Qualify.
              </span>
              <br />
              Never Show Why.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.25 }}
              className="text-lg sm:text-xl text-slate-300/90 leading-relaxed max-w-2xl"
            >
              Trust is a ZK-powered lending protocol on HashKey Chain. Access undercollateralized loans by proving your financial credentials without ever exposing your private data.
            </motion.p>
          </div>
          {/* CTAs Centered underneath the centered layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-1 w-full"
          >
            <button className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[15px] font-black px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 group shadow-2xl shadow-emerald-500/25 uppercase tracking-wide">
              Get a Loan
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 text-white/70 hover:text-white font-bold text-[15px] transition-all duration-300 px-8 py-4 border border-white/10 hover:border-emerald-500/40 rounded-full hover:bg-white/5 group backdrop-blur-md uppercase tracking-wide">
              View Docs
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
