"use client";
import { useEffect, useRef, useState } from "react";

const comparisons = [
  {
    traditional: "Exposes your credit score, income, and personal data to lenders",
    trust: "ZK proof verifies you qualify — lenders never see your actual numbers",
    label: "Privacy",
  },
  {
    traditional: "Requires overcollateralization — you need money to borrow money",
    trust: "Reputation-based lending — your proof is your collateral",
    label: "Collateral",
  },
  {
    traditional: "Days or weeks of bank approval processes and paperwork",
    trust: "Smart contract verifies your proof and issues funds in seconds",
    label: "Speed",
  },
  {
    traditional: "A bank or institution decides if you qualify — opaque criteria",
    trust: "On-chain rules decide — transparent, immutable, no human bias",
    label: "Fairness",
  },
  {
    traditional: "Credit bureaus store and sell your financial history",
    trust: "Soulbound Token records your history — owned by you, on-chain",
    label: "Credit History",
  },
];

export default function WhyTrust() {
  const [visibleRows, setVisibleRows] = useState<number[]>([]);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = rowRefs.current.map((ref, i) => {
      if (!ref) return null;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleRows((prev) =>
              prev.includes(i) ? prev : [...prev, i]
            );
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(ref);
      return observer;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  return (
    <section className="relative z-10 py-10 px-8 bg-[#020617]/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-20">
          <p className="text-[#10B981] text-sm tracking-widest mb-3">
            WHY TRUST
          </p>
          <h2 className="text-4xl font-medium text-white mb-6">
            A different kind of lending
          </h2>
          <p className="text-white/50 text-base max-w-lg mx-auto leading-relaxed">
            Traditional finance was not built for privacy or fairness.
            Trust was built for nothing else.
          </p>
        </div>

        {/* Column headers (Desktop only) */}
        <div className="hidden md:grid grid-cols-[1fr_80px_1fr] gap-4 mb-6 px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/20" />
            <span className="text-white/30 text-sm tracking-widest uppercase">
              Traditional Lending
            </span>
          </div>
          <div />
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[#10B981] text-sm tracking-widest uppercase">
              Trust Protocol
            </span>
          </div>
        </div>

        {/* Comparison rows */}
        <div className="space-y-16 md:space-y-5">
          {comparisons.map((item, i) => (
            <div
              key={i}
              ref={(el) => { rowRefs.current[i] = el; }}
              className="flex flex-col md:grid md:grid-cols-[1fr_100px_1fr] gap-4 px-2 transition-all duration-700"
              style={{
                opacity: visibleRows.includes(i) ? 1 : 0,
                transform: visibleRows.includes(i)
                  ? "translateY(0)"
                  : "translateY(30px)",
                transitionDelay: `${i * 90}ms`,
              }}
            >
              {/* Category label (Visible only in stacked mobile view) */}
              <div className="md:hidden flex items-center justify-center mb-2">
                <span className="text-emerald-500 font-black text-[11px] tracking-[0.4em] uppercase py-2">
                  {item.label}
                </span>
              </div>

              {/* Traditional side */}
              <div className="rounded-2xl border border-white/10 bg-[#0B1B2E]/60 px-6 py-5 flex items-center gap-4 shadow-[0_4px_16px_rgba(0,0,0,0.22)] hover:border-white/20 hover:bg-[#0F2A43]/65 transition-all duration-300">
                <div className="w-5 h-5 rounded-full border border-white/30 bg-transparent flex items-center justify-center shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#86C8FF]/40" />
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-white/20 text-[9px] font-black tracking-[0.2em] uppercase md:hidden">Traditional</p>
                  <p className="text-white/70 text-base leading-relaxed font-semibold">
                    {item.traditional}
                  </p>
                </div>
              </div>

              {/* VS / Label in middle */}
              <div className="flex items-center justify-center py-2 md:py-0">
                <div className="md:hidden w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 blur-md bg-emerald-500/10 rounded-full" />
                    <span className="text-white/40 text-[10px] font-black relative z-10">VS</span>
                </div>
                <span className="hidden md:block text-white/30 text-sm font-semibold tracking-widest uppercase text-center leading-tight">
                  {item.label}
                </span>
              </div>

              {/* Trust side */}
              <div
                className="rounded-2xl px-6 py-5 flex items-center gap-4 transition-all duration-300 shadow-[0_4px_14px_rgba(16,185,129,0.25)] hover:shadow-[0_8px_22px_rgba(16,185,129,0.30)]"
                style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 40, 30, 0.6))",
                  border: "1px solid rgba(16, 185, 129, 0.5)",
                }}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #10B981, #34D399)" }}>
                  <svg width="12" height="12" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5L4.2 7.2L8.2 3.2" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 md:hidden">
                    <div className="w-5 h-5 shrink-0 flex items-center justify-center bg-white rounded-full overflow-hidden shadow-sm">
                      <svg viewBox="144 71 48 48" className="w-full h-full p-0.5">
                        <path fillRule="evenodd" clipRule="evenodd" d="M154.442 80.3881L161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.902 108.005 161.835 108.089 161.745 108.106L154.436 109.612C154.313 109.64 154.2 109.544 154.2 109.421V80.5791C154.2 80.4555 154.318 80.36 154.442 80.3881ZM181.559 80.3881L174.25 82.0454C174.16 82.0622 174.098 82.1409 174.098 82.2307V107.915C174.098 108.005 174.166 108.089 174.256 108.106L181.564 109.612C181.688 109.64 181.8 109.544 181.8 109.421V80.5791C181.8 80.4555 181.682 80.36 181.559 80.3881ZM171.851 91.2249V98.5898V98.7583H171.683H164.318H164.149V98.5898V91.2249V91.0563H164.318H171.683H171.851V91.2249Z" fill="black"/>
                        <path fillRule="evenodd" clipRule="evenodd" d="M161.119 82.7051L154.983 81.3138V108.7L161.119 107.436V82.7051ZM174.881 82.7051V107.436L181.017 108.7V81.3138L174.881 82.7051ZM161.75 82.0454C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915C161.84 82.0622 161.902 82.1409 161.902 82.2307V107.915ZM171.068 97.9753V91.8394H164.932V97.9753H171.068ZM164.149 98.7583V91.0563H171.851V98.7583H164.149Z" fill="black"/>
                      </svg>
                    </div>
                    <p className="text-emerald-400 text-[9px] font-black tracking-[0.2em] uppercase">Trust Protocol</p>
                  </div>
                  <p className="text-white text-base leading-relaxed font-semibold">
                    {item.trust}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
