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
    <section className="relative py-32 px-8 bg-[#020617]/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">

        {/* Section heading */}
        <div className="mb-24 text-center">
          <p className="text-emerald-500 text-[10px] font-bold tracking-[0.3em] uppercase mb-4">HOW IT WORKS</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
            From proof to funds in seconds
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-20">
          <div className="flex-1 space-y-32 relative">
            {/* Steps (scrollable) */}
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

          {/* RIGHT -- Compact Sticky Flow Diagram */}
          <div className="hidden lg:flex w-80 flex-col items-center">
            <div className="sticky top-24 flex flex-col items-center w-full">
               {flowNodes.map((node, i) => (
                <div key={i} className="flex flex-col items-center w-full">

                  {/* Node box */}
                  <div
                    className="w-full rounded-xl px-4 py-3 text-center transition-all duration-700 backdrop-blur-xl"
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
                      opacity: i > activeStep ? 0.35 : 1,
                      transform: i === activeStep ? 'scale(1.03)' : 'scale(1)',
                      boxShadow: i === activeStep ? '0 0 20px rgba(16,185,129,0.15)' : 'none',
                    }}
                  >
                    <div className="flex flex-col items-center gap-1.5">
                      {node.label === 'HASHKEY CHAIN' && (
                        <div className="w-8 h-8 shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden mb-1.5 shadow-lg shadow-white/5">
                          <svg viewBox="144 71 48 48" className="w-full h-full p-0.5">
                            <path fillRule="evenodd" clipRule="evenodd" d="M154.442 80.3881L161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.902 108.005 161.835 108.089 161.745 108.106L154.436 109.612C154.313 109.64 154.2 109.544 154.2 109.421V80.5791C154.2 80.4555 154.318 80.36 154.442 80.3881ZM181.559 80.3881L174.25 82.0454C174.16 82.0622 174.098 82.1409 174.098 82.2307V107.915C174.098 108.005 174.166 108.089 174.256 108.106L181.564 109.612C181.688 109.64 181.8 109.544 181.8 109.421V80.5791C181.8 80.4555 181.682 80.36 181.559 80.3881ZM171.851 91.2249V98.5898V98.7583H171.683H164.318H164.149V98.5898V91.2249V91.0563H164.318H171.683H171.851V91.2249Z" fill="black"/>
                            <path fillRule="evenodd" clipRule="evenodd" d="M161.119 82.7051L154.983 81.3138V108.7L161.119 107.436V82.7051ZM174.881 82.7051V107.436L181.017 108.7V81.3138L174.881 82.7051ZM161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915ZM171.068 97.9753V91.8394H164.932V97.9753H171.068ZM164.149 98.7583V91.0563H171.851V98.7583H164.149Z" fill="black"/>
                          </svg>
                        </div>
                      )}
                      <p
                        className="text-[11px] font-black tracking-widest uppercase"
                        style={{
                          color: i === activeStep ? '#fff' : i < activeStep ? '#10B981' : '#475569',
                        }}
                      >
                        {node.label}
                      </p>
                      <p
                        className="text-[8px] mt-1 font-bold tracking-widest uppercase opacity-60"
                        style={{ color: i === activeStep ? '#10B981' : '#94a3b8' }}
                      >
                        {node.sublabel}
                      </p>
                    </div>
                  </div>

                  {/* Connector line */}
                  {i < flowNodes.length - 1 && (
                    <div className="w-px h-8 relative overflow-hidden my-0.5">
                      {/* Background dashed line */}
                      <div
                        className="absolute inset-x-0 h-full w-full"
                        style={{
                          background:
                            'repeating-linear-gradient(to bottom, rgba(16,185,129,0.2) 0px, rgba(16,185,129,0.2) 4px, transparent 4px, transparent 8px)',
                        }}
                      />
                      {/* Animated fill line */}
                      <div
                        className="absolute top-0 left-0 w-full transition-all duration-1000 ease-in-out"
                        style={{
                          height: i < activeStep ? '100%' : i === activeStep ? '50%' : '0%',
                          background: '#10B981',
                          boxShadow: '0 0 8px #10B981',
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
