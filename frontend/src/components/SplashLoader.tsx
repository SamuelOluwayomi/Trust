"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";

export default function SplashLoader() {
  const [loading, setLoading] = useState(true);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const interval = 25;
    const steps = duration / interval;
    const increment = 100 / steps;

    const timer = setInterval(() => {
      setPercent((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, interval);

    return () => clearInterval(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-100 flex flex-col items-center justify-center bg-[#020617] text-white overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.1, 0.2, 0.1]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-emerald-500/10 blur-[120px] rounded-full"
            />
            <motion.div
              animate={{ 
                scale: [1, 1.3, 1],
                opacity: [0.05, 0.15, 0.05]
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-emerald-500/10 blur-[100px] rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <div className="relative z-10 w-24 h-24 flex items-center justify-center bg-emerald-500 rounded-3xl shadow-[0_0_50px_rgba(16,185,129,0.3)] border border-emerald-400/20">
                <ShieldCheck className="w-14 h-14 text-[#020617]" weight="fill" />
              </div>
              
              {/* Spinning Glow Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-10px] border border-emerald-500/20 rounded-full border-t-emerald-500/60"
              />
            </motion.div>

            <div className="flex flex-col items-center gap-3">
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl font-black tracking-[0.3em] uppercase"
              >
                Trust<span className="text-emerald-500">.</span>
              </motion.h1>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-[10px] font-bold tracking-[0.4em] uppercase text-emerald-100"
              >
                Securing the Future of Lending
              </motion.p>
            </div>

            <div className="mt-12 flex flex-col items-center gap-4 w-64">
              <div className="w-full h-px bg-white/10 relative overflow-hidden">
                <motion.div
                  initial={{ left: "-100%" }}
                  animate={{ left: `${percent - 100}%` }}
                  transition={{ ease: "linear" }}
                  className="absolute inset-0 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]"
                />
              </div>
              <div className="flex justify-between w-full px-1">
                <span className="text-[9px] font-mono text-white/20 tracking-widest uppercase">Initializing Protocol</span>
                <span className="text-[9px] font-mono text-emerald-500/80 tracking-widest">{percent.toFixed(0)}%</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="absolute bottom-12 text-[8px] font-bold tracking-[0.5em] text-white/10 uppercase"
          >
            Powered by HashKey Chain
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
