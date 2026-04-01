"use client";

import { motion } from "framer-motion";
import { ChevronRight, Cpu, Zap, Lock } from "lucide-react";
import React from "react";

const Feature = ({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6 }}
    viewport={{ once: true }}
    className="flex flex-col gap-4 p-7 rounded-2xl border border-[#171717]/8 bg-white/15 backdrop-blur-md group hover:bg-white/25 hover:border-[#b56605]/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
  >
    <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-[#171717]/8 group-hover:bg-[#b56605]/15 transition-all duration-300">
      <Icon className="w-6 h-6 text-[#171717]/70 group-hover:text-[#b56605] transition-colors duration-300" />
    </div>
    <h3 className="text-lg font-extrabold text-[#171717] group-hover:text-[#b56605] transition-colors duration-300">{title}</h3>
    <p className="text-sm leading-relaxed text-[#171717]/55">{desc}</p>
  </motion.div>
);

export default function SentinelHero() {
  return (
    <section className="relative z-10 pt-36 pb-20 px-6 max-w-6xl mx-auto flex flex-col items-center text-center">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="text-5xl sm:text-7xl md:text-[5.5rem] font-black text-[#171717] tracking-[-0.04em] leading-[0.92] mb-6"
      >
        Built on{" "}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#b56605] to-[#d4850a]">
          Nosana.
        </span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="max-w-xl text-base md:text-lg text-[#171717]/60 leading-relaxed mb-10 font-medium"
      >
        The fastest autonomous DevOps agent. NexaGuard transforms raw commits into verifiable, on-chain <span className="text-[#171717] font-bold">Proof of Work</span> using Nosana&apos;s GPU network and Solana&apos;s ZK-compression.
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.6 }}
        className="flex flex-col sm:flex-row items-center gap-4 mb-28"
      >
        <button className="flex items-center gap-3 bg-[#171717] hover:bg-[#222] text-[#b56605] text-sm font-extrabold px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.03] active:scale-95 group shadow-[0_8px_30px_rgba(0,0,0,0.2)]">
          Get Started
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button className="flex items-center gap-2 text-[#171717]/70 hover:text-[#b56605] font-bold text-sm transition-all duration-200 px-6 py-3.5 border border-[#171717]/15 hover:border-[#b56605]/40 rounded-full hover:bg-white/20 group backdrop-blur-sm">
          View Repository
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
        <Feature
          icon={Cpu}
          title="Heavy GPU Compute"
          desc="Justifying Nosana's power with complex code-to-summary LLMs and image generation."
        />
        <Feature
          icon={Lock}
          title="ZK-Privacy Ready"
          desc="Verification via Noir-based ZK-circuits to guard your identity on Solana."
        />
        <Feature
          icon={Zap}
          title="On-Chain Persistence"
          desc="Mints your achievements as verifiable cNFTs directly to the Solana devnet."
        />
      </div>
    </section>
  );
}
