"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { ShieldCheck } from "@phosphor-icons/react";

export default function SplashLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Concise display time for a minimal splash
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" }
          }}
          className="fixed inset-0 z-100 flex items-center justify-center bg-[#020617] overflow-hidden"
        >
          {/* Subtle horizontal baseline spanning the screen */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 -translate-y-1/2" />

          {/* Central Logo Container */}
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative z-10 flex items-center gap-6"
          >
            {/* Icon Block with prominent glow */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-emerald-500 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.3)]">
              <ShieldCheck className="w-10 h-10 sm:w-12 sm:h-12 text-[#020617]" weight="fill" />
            </div>

            {/* Brand Text */}
            <h1 className="text-4xl sm:text-5xl font-black text-white italic tracking-wider">
              TRUST<span className="text-emerald-500">.</span>
            </h1>
          </motion.div>
          
        </motion.div>
      )}
    </AnimatePresence>
  );
}
