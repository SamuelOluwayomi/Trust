'use client';
import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: 'STEP 1',
    title: 'Connect Your Identity',
    description:
      'Sign in with Google or connect your existing wallet. A secure embedded wallet is automatically created for new users — no crypto experience needed.',
  },
  {
    number: 'STEP 2',
    title: 'Submit Your Credentials',
    description:
      'Enter your financial credentials privately. Your credit score, account age, and wallet history never leave your browser — they are processed locally.',
  },
  {
    number: 'STEP 3',
    title: 'Generate a ZK Proof',
    description:
      'A Zero-Knowledge circuit runs on your device and produces a cryptographic proof that you qualify — without revealing the actual numbers.',
  },
  {
    number: 'STEP 4',
    title: 'Loan Issued On-Chain',
    description:
      'The smart contract on HashKey Chain verifies your proof in milliseconds. If valid, your loan is issued instantly to your wallet. No banks. No middlemen.',
  },
  {
    number: 'STEP 5',
    title: 'Repay and Build Credit',
    description:
      'Repay your loan on time and earn a Soulbound Token — a permanent, non-transferable record of your on-chain credit history that unlocks better tiers.',
  },
];

const flowNodes = [
  { label: 'USER', sublabel: 'Google or Wallet' },
  { label: 'ZK CIRCUIT', sublabel: 'Runs locally on device' },
  { label: 'PROOF', sublabel: 'Cryptographic output' },
  { label: 'HASHKEY CHAIN', sublabel: 'On-chain verification' },
  { label: 'LOAN + SBT', sublabel: 'Funds + credit record' },
];

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, i) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveStep(i);
        },
        { threshold: 0.6 }
      );
      observer.observe(ref);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section className="relative py-48 px-8 bg-[#020617]/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">

        {/* Section heading */}
        <div className="mb-24 text-center">
          <p className="text-emerald-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            From proof to funds in seconds
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-20 items-start">

          {/* LEFT — Steps */}
          <div className="flex-1 space-y-32">
            {steps.map((step, i) => (
              <div
                key={i}
                ref={(el) => { stepRefs.current[i] = el; }}
                className="transition-all duration-700"
                style={{
                  borderLeft: `2px solid ${i === activeStep ? '#10B981' : 'rgba(255,255,255,0.05)'}`,
                  paddingLeft: '32px',
                  opacity: i === activeStep ? 1 : 0.2,
                  transform: i === activeStep ? 'translateX(0)' : 'translateX(-8px)',
                }}
              >
                <p
                  className="text-[10px] tracking-[0.2em] mb-3 font-bold uppercase"
                  style={{ color: i === activeStep ? '#10B981' : '#475569' }}
                >
                  {step.number}
                </p>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
                  {step.title}
                </h3>
                <p className="text-base leading-relaxed text-slate-400 max-w-md">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* RIGHT — Animated Flow Diagram */}
          <div className="hidden lg:flex w-96 sticky top-48 flex-col items-center">
            {flowNodes.map((node, i) => (
              <div key={i} className="flex flex-col items-center w-full">

                {/* Node box */}
                <div
                  className="w-full rounded-2xl px-6 py-5 text-center transition-all duration-700 backdrop-blur-xl shadow-2xl"
                  style={{
                    background: i === activeStep
                      ? 'rgba(16,185,129,0.15)'
                      : i < activeStep
                      ? 'rgba(16,185,129,0.05)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${
                      i === activeStep
                        ? '#10B981'
                        : i < activeStep
                        ? 'rgba(16,185,129,0.3)'
                        : 'rgba(255,255,255,0.05)'
                    }`,
                    opacity: i > activeStep ? 0.4 : 1,
                    transform: i === activeStep ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: i === activeStep ? '0 0 30px rgba(16,185,129,0.15)' : 'none',
                  }}
                >
                  <p
                    className="text-sm font-black tracking-widest uppercase"
                    style={{
                      color: i === activeStep ? '#fff' : i < activeStep ? '#10B981' : '#475569',
                    }}
                  >
                    {node.label}
                  </p>
                  <p
                    className="text-[10px] mt-1.5 font-bold tracking-widest uppercase opacity-60"
                    style={{ color: i === activeStep ? '#10B981' : '#94a3b8' }}
                  >
                    {node.sublabel}
                  </p>
                </div>

                {/* Connector line — NOT after last node */}
                {i < flowNodes.length - 1 && (
                  <div className="w-px h-14 relative overflow-hidden my-1">
                    {/* Background dashed line */}
                    <div
                      className="absolute inset-x-0 h-full w-full"
                      style={{
                        background:
                          'repeating-linear-gradient(to bottom, rgba(16,185,129,0.2) 0px, rgba(16,185,129,0.2) 6px, transparent 6px, transparent 12px)',
                      }}
                    />
                    {/* Animated fill line */}
                    <div
                      className="absolute top-0 left-0 w-full transition-all duration-1000 ease-in-out"
                      style={{
                        height: i < activeStep ? '100%' : i === activeStep ? '50%' : '0%',
                        background: '#10B981',
                        boxShadow: '0 0 10px #10B981',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
