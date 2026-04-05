"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import Navbar from "@/components/Navbar";
import Background from "@/components/Background";
import Hero from "@/components/Hero";
import LoanTiers from "@/components/LoanTiers";
import HowItWorks from "@/components/HowItWorks";
import WhyTrust from "@/components/WhyTrust";
import FAQ from "@/components/FAQ";
import SplashLoader from "@/components/SplashLoader";

export default function Home() {
  const { authenticated, ready, user } = usePrivy();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if authenticated AND wallet is ready (prevents "Creating your wallet" hang)
    if (ready && authenticated && user?.wallet) {
      router.replace("/dashboard");
    }
  }, [ready, authenticated, user?.wallet, router]);

  // If we are redirecting, we can show a loader or nothing to avoid flicker
  if (ready && authenticated) {
    return <SplashLoader />;
  }

  return (
    <main className="min-h-screen overflow-clip text-white selection:bg-emerald-500/30 selection:text-white">
      <SplashLoader />
      <Navbar />
      <Background />
      <Hero />
      <HowItWorks />
      <LoanTiers />
      <WhyTrust />
      <FAQ />
      {/* Footer / Secondary sections */}
      <footer className="relative py-16 px-6 border-t border-white/5 bg-[#020617]/80 backdrop-blur-md text-center">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-white/20 text-xs font-mono tracking-widest uppercase">
            Built for the HashKey / ZKid Track 2026
          </p>
          <div className="flex items-center gap-6">
            <span className="text-white/40 text-[10px] font-bold tracking-[0.3em] uppercase">Trust Protocol</span>
            <div className="h-4 w-px bg-white/10" />
            <span className="text-white/20 text-[10px] font-medium tracking-widest uppercase italic">Privacy by Design</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
