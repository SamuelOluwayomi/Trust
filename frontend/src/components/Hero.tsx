"use client";

import { motion } from "framer-motion";
import { ChevronRight, Cpu, Zap, Lock, TrendingUp, Shield } from "lucide-react";
import React from "react";

const Feature = ({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5 }}
    viewport={{ once: true }}
    className="flex items-start gap-4 group"
  >
    <div className="mt-0.5 w-10 h-10 shrink-0 flex items-center justify-center rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/25 border border-emerald-500/10 transition-all duration-300">
      <Icon className="w-5 h-5 text-emerald-400" />
    </div>
    <div>
      <h3 className="text-base font-bold text-white/90 tracking-tight mb-1">{title}</h3>
      <p className="text-sm leading-relaxed text-slate-400">{desc}</p>
    </div>
  </motion.div>
);

function LoanTierCard({ tier, max, rate, label }: { tier: string; max: string; rate: string; label: string }) {
  const isGold = tier === "Gold";
  const isSilver = tier === "Silver";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all duration-300 ${
        isGold
          ? "border-emerald-500/40 bg-emerald-500/10"
          : isSilver
          ? "border-slate-500/30 bg-white/4"
          : "border-slate-700/30 bg-white/2"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`text-base font-black tracking-tight ${isGold ? "text-emerald-400" : isSilver ? "text-slate-300" : "text-slate-500"}`}>
          {label}
        </div>
        <div className={`text-xs font-semibold tracking-widest uppercase px-2 py-0.5 rounded-full ${
          isGold ? "bg-emerald-500/20 text-emerald-400" : isSilver ? "bg-slate-500/20 text-slate-400" : "bg-slate-700/30 text-slate-500"
        }`}>
          {tier}
        </div>
      </div>
      <div className="text-right">
        <div className={`text-sm font-black ${isGold ? "text-emerald-400" : "text-white/70"}`}>{max}</div>
        <div className="text-[10px] text-slate-500 font-mono">{rate} APR</div>
      </div>
    </motion.div>
  );
}

function InfographicPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 60 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-4 bg-emerald-500/5 rounded-3xl blur-2xl" />

      {/* Main Panel */}
      <div className="relative bg-[#0a1628]/90 border border-white/8 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl shadow-black/50">
        
        {/* Window Chrome Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5 bg-white/2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.3em] text-white/20 uppercase">
            <Shield className="w-3 h-3" />
            Secure Connection
          </div>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Shield className="w-7 h-7 text-[#020617]" />
            </div>
            <div>
              <div className="text-lg font-black tracking-tight text-white">Trust Protocol</div>
              <div className="text-[10px] font-bold text-emerald-400/80 tracking-[0.2em] uppercase">ZK-Proof Verified</div>
            </div>
          </div>

          {/* ZK Proof Status */}
          <div className="bg-emerald-500/8 border border-emerald-500/15 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-emerald-400 tracking-[0.2em] uppercase">Proof Status</span>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-400">Valid</span>
              </div>
            </div>
            <div className="space-y-2">
              {[
                { label: "Credit Score Range", value: "Verified", status: true },
                { label: "Account Age", value: "Verified", status: true },
                { label: "Income Level", value: "Verified", status: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{item.label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                    </div>
                    <span className="text-emerald-400 font-semibold text-[11px]">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Loan Tiers */}
          <div className="flex flex-col gap-2.5">
            <div className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase mb-1">Loan Tiers</div>
            <LoanTierCard tier="Gold" max="5,000 HSK" rate="8.5%" label="Au" />
            <LoanTierCard tier="Silver" max="2,000 HSK" rate="12%" label="Ag" />
            <LoanTierCard tier="Bronze" max="500 HSK" rate="18%" label="Cu" />
          </div>

          {/* CTA inside panel */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3.5 rounded-xl bg-emerald-500 text-[#020617] text-sm font-black tracking-wide shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors duration-200"
          >
            Apply Now — No Collateral Required
          </motion.button>

          {/* Footer note */}
          <div className="flex items-center justify-center gap-2 text-[9px] text-white/20 font-mono tracking-widest uppercase">
            <div className="w-px h-3 bg-white/10" />
            Powered by HashKey Chain
            <div className="w-px h-3 bg-white/10" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative z-10 min-h-screen flex items-center px-6 pt-28 pb-20">
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* Left Column: Text Content */}
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-6">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-5xl sm:text-6xl xl:text-7xl font-black text-white tracking-[-0.04em] leading-[0.95]"
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
              className="text-lg text-slate-400 leading-relaxed max-w-lg"
            >
              Trust is the first ZK-powered lending protocol on HashKey Chain. Access undercollateralized loans by proving your financial credentials without ever exposing your private data.
            </motion.p>
          </div>

          {/* Feature List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col gap-5"
          >
            <Feature
              icon={Lock}
              title="Zero-Knowledge Privacy"
              desc="Prove your credentials meet loan requirements without revealing the actual numbers to anyone."
            />
            <Feature
              icon={Zap}
              title="Undercollateralized Loans"
              desc="Borrow based on ZK-proven reputation, not just capital — no overcollateralization required."
            />
            <Feature
              icon={TrendingUp}
              title="On-Chain Credit History"
              desc="Each repaid loan mints a Soulbound Token, building a verifiable credit record entirely on-chain."
            />
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-wrap items-center gap-4"
          >
            <button className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-black px-8 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 group shadow-2xl shadow-emerald-500/25">
              Get a Loan
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center gap-2 text-white/60 hover:text-white font-bold text-sm transition-all duration-300 px-6 py-4 border border-white/10 hover:border-emerald-500/40 rounded-full hover:bg-white/5 group">
              View Documentation
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>

        {/* Right Column: Infographic Panel */}
        <div className="hidden lg:block">
          <InfographicPanel />
        </div>
      </div>
    </section>
  );
}
