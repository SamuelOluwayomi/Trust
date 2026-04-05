"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import React from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";

export default function Hero() {
  const { login, authenticated } = usePrivy();
  const router = useRouter();

  const handleGetStarted = () => {
    if (authenticated) {
      router.push("/dashboard");
    } else {
      login();
    }
  };

  return (
    <section className="relative z-10 min-h-screen flex items-center px-6 pt-5 pb-2 overflow-hidden">
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
              Trust is a ZK-powered lending protocol on{" "}
              <span className="relative inline-flex items-center gap-2 text-white font-black whitespace-nowrap group pb-1">
                <span className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden shadow-lg shadow-white/5">
                  <svg viewBox="144 71 48 48" className="w-full h-full p-0.5">
                    <path fillRule="evenodd" clipRule="evenodd" d="M154.442 80.3881L161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.902 108.005 161.835 108.089 161.745 108.106L154.436 109.612C154.313 109.64 154.2 109.544 154.2 109.421V80.5791C154.2 80.4555 154.318 80.36 154.442 80.3881ZM181.559 80.3881L174.25 82.0454C174.16 82.0622 174.098 82.1409 174.098 82.2307V107.915C174.098 108.005 174.166 108.089 174.256 108.106L181.564 109.612C181.688 109.64 181.8 109.544 181.8 109.421V80.5791C181.8 80.4555 181.682 80.36 181.559 80.3881ZM171.851 91.2249V98.5898V98.7583H171.683H164.318H164.149V98.5898V91.2249V91.0563H164.318H171.683H171.851V91.2249Z" fill="black"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M161.119 82.7051L154.983 81.3138V108.7L161.119 107.436V82.7051ZM174.881 82.7051V107.436L181.017 108.7V81.3138L174.881 82.7051ZM161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915ZM171.068 97.9753V91.8394H164.932V97.9753H171.068ZM164.149 98.7583V91.0563H171.851V98.7583H164.149Z" fill="black"/>
                  </svg>
                </span>
                HashKey Chain
                <span className="absolute -bottom-1 left-9 right-0 h-1.5 bg-emerald-500/80 rounded-full transform -skew-x-12 origin-left transition-all duration-300 group-hover:h-2" />
              </span>. 
              Access undercollateralized loans by proving your financial credentials without ever exposing your private data.
            </motion.p>
          </div>
          {/* CTAs Centered underneath the centered layout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 pt-1 w-full max-w-sm sm:max-w-none mx-auto"
          >
            <button 
              onClick={handleGetStarted}
              className="flex items-center justify-center gap-3 bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-[15px] font-black px-6 sm:px-10 py-4 rounded-full transition-all duration-300 hover:scale-[1.04] active:scale-95 group shadow-2xl shadow-emerald-500/25 uppercase tracking-wide"
            >
              Get a Loan
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="flex items-center justify-center gap-2 text-white/70 hover:text-white font-bold text-[15px] transition-all duration-300 px-6 sm:px-8 py-4 border border-white/10 hover:border-emerald-500/40 rounded-full hover:bg-white/5 group backdrop-blur-md uppercase tracking-wide">
              View Docs
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
