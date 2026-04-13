"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, HandCoins, Target, RocketLaunch, 
  X, CaretRight, CaretLeft, CheckCircle, IdentificationBadge,
} from "@phosphor-icons/react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { supabase } from "@/lib/supabase";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useKYC } from "@/hooks/useKYC";
import WorldIDVerify from "@/components/WorldIDVerify";

const ONBOARDING_KEY = "trust_onboarding_completed";

const steps = [
  {
    title: "Welcome to Trust",
    description: "The world's first ZK-powered undercollateralized lending protocol on HashKey Chain.",
    icon: RocketLaunch,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
  {
    title: "Proof of Personhood",
    description: "Verify your identity with World ID or ZK Proofs without ever exposing your private data.",
    icon: ShieldCheck,
    iconColor: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    title: "Unlocking Credit",
    description: "Start at the Bronze Tier. Repay on time to earn Soulbound Tokens and unlock higher limits up to 10k HSK.",
    icon: Target,
    iconColor: "text-amber-400",
    bgColor: "bg-amber-500/10",
  },
  {
    title: "Instant Liquidity",
    description: "Apply for loans in seconds and get HSK directly to your wallet. No paperwork, just Trust.",
    icon: HandCoins,
    iconColor: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
  },
];

const VERIFY_STEP = steps.length;       // step index 4 — World ID
const KYC_STEP = steps.length + 1;      // step index 5 — HashKey KYC
const TOTAL_STEPS = steps.length + 2;   // 6 total

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [verified, setVerified] = useState(false);
  const [saving, setSaving] = useState(false);

  const { requestKyc, requesting: kycRequesting } = useKYC();

  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { verify } = useUserProfile();
  const walletAddress = wallets[0]?.address;

  useEffect(() => {
    const hasSeen = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeen) setIsOpen(true);
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setIsOpen(false);
  };

  const handleVerified = async (nullifier: string) => {
    setVerified(true);
    setSaving(true);
    try {
      await verify(nullifier);
    } catch (err) {
      console.error("Failed to save user:", err);
      setVerified(false);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  if (!isOpen) return null;

  const isVerifyStep = currentStep === VERIFY_STEP;
  const isKycStep = currentStep === KYC_STEP;
  const step = (!isVerifyStep && !isKycStep) ? steps[currentStep] : null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-[#020617]/80 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#0a0f1e] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl shadow-emerald-500/10"
          >
            {/* Close */}
            <div className="absolute top-6 right-6 z-10">
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 pb-10">
              <div className="flex flex-col items-center text-center">

                {/* INFO SLIDES */}
                {!isVerifyStep && step && (
                  <>
                    <motion.div
                      key={`icon-${currentStep}`}
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={`w-20 h-20 rounded-3xl ${step.bgColor} flex items-center justify-center mb-8`}
                    >
                      <step.icon className={`w-10 h-10 ${step.iconColor}`} weight="duotone" />
                    </motion.div>

                    <motion.div
                      key={`text-${currentStep}`}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      <h2 className="text-2xl font-black text-white tracking-tight mb-3 uppercase">
                        {step.title}
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">
                        {step.description}
                      </p>
                    </motion.div>
                  </>
                )}

                {/* VERIFY STEP */}
                {isVerifyStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-8 mx-auto">
                      {verified
                        ? <CheckCircle className="w-10 h-10 text-emerald-400" weight="duotone" />
                        : <ShieldCheck className="w-10 h-10 text-blue-400" weight="duotone" />
                      }
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight mb-3 uppercase">
                      {verified ? "Identity Verified!" : "Verify Your Identity"}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                      {verified
                        ? "You're all set. Your identity is secured with a ZK proof — no personal data stored."
                        : "Prove you're a unique human using World ID. This prevents duplicate accounts and protects the lending pool."
                      }
                    </p>

                    {/* World ID or success */}
                    {!verified ? (
                      <>
                        <WorldIDVerify onVerified={handleVerified} />
                        <button
                          onClick={nextStep}
                          className="mt-4 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
                        >
                          Skip for now — continue to KYC
                        </button>
                      </>
                    ) : (
                      <div className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-sm font-semibold">
                        <CheckCircle className="w-5 h-5" weight="fill" />
                        {saving ? "Saving..." : "Verified ✓"}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* KYC STEP */}
                {isKycStep && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center mb-8 mx-auto">
                      <IdentificationBadge className="w-10 h-10 text-emerald-400" weight="duotone" />
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight mb-3 uppercase">
                      HashKey KYC
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto mb-6">
                      Complete HashKey Chain&apos;s on-chain KYC to receive a Soul Bound Token (SBT) that proves your identity verification level.
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={async () => {
                          const success = await requestKyc("trust_onboarding");
                          if (success) nextStep();
                        }}
                        disabled={kycRequesting}
                        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-sm font-semibold transition-all disabled:opacity-50"
                      >
                        <IdentificationBadge className="w-5 h-5" weight="fill" />
                        {kycRequesting ? "Minting KYC Profile..." : "Mint KYC On-Chain"}
                      </button>
                      <button
                        onClick={nextStep}
                        className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-2"
                      >
                        Skip for now — KYC is optional for Bronze tier
                      </button>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

            {/* Bottom nav */}
            <div className="bg-white/5 p-6 sm:p-8 flex items-center justify-between">

              {/* Dots — one per total step */}
              <div className="flex gap-2">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentStep ? "w-8 bg-emerald-500" : "w-1.5 bg-white/20"
                    }`}
                  />
                ))}
              </div>

              {/* Nav buttons */}
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    <CaretLeft className="w-4 h-4" />
                    Back
                  </button>
                )}

                {isKycStep ? (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1e] text-[11px] font-black px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 uppercase tracking-widest"
                  >
                    Start Borrowing
                    <CaretRight className="w-4 h-4" weight="bold" />
                  </button>
                ) : isVerifyStep ? (
                  <button
                    onClick={nextStep}
                    disabled={saving}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-[#0a0f1e] text-[11px] font-black px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 uppercase tracking-widest"
                  >
                    {saving ? "Saving..." : verified ? "Next Step" : "Skip Identity"}
                    <CaretRight className="w-4 h-4" weight="bold" />
                  </button>
                ) : (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-[#0a0f1e] text-[11px] font-black px-6 py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/20 active:scale-95 uppercase tracking-widest"
                  >
                    {currentStep === steps.length - 1 ? "Verify Identity" : "Next Step"}
                    <CaretRight className="w-4 h-4" weight="bold" />
                  </button>
                )}
              </div>
            </div>

            {/* Shimmer */}
            <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent pointer-events-none" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}