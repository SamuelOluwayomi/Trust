"use client";
import { CardSpotlight } from "@/components/ui/card-spotlight";

const tiers = [
  {
    symbol: "Cu",
    name: "Bronze",
    maxLoan: "0.02 HSK",
    apr: "18.5%",
    duration: "30 days",
    color: "#cd7f32",
    spotlightColor: "#cd7f32",
    requirements: [
      "Wallet age > 30 days",
      "Basic credit score proof",
      "On-chain activity",
    ],
    description: "Perfect for first-time borrowers building their on-chain credit history.",
  },
  {
    symbol: "Ag",
    name: "Silver",
    maxLoan: "0.05 HSK",
    apr: "12%",
    duration: "60 days",
    color: "#378ADD",
    spotlightColor: "#378ADD",
    requirements: [
      "Wallet age > 90 days",
      "Credit score > 600",
      "1+ repaid loan SBT",
    ],
    description: "For borrowers with proven repayment history and stronger credentials.",
    featured: true,
  },
  {
    symbol: "Au",
    name: "Gold",
    maxLoan: "0.1 HSK",
    apr: "8.5%",
    duration: "90 days",
    color: "#f5c518",
    spotlightColor: "#f5c518",
    requirements: [
      "Wallet age > 180 days",
      "Credit score > 750",
      "3+ repaid loan SBTs",
    ],
    description: "Top tier access for established borrowers with excellent ZK-verified credentials.",
  },
];

export default function LoanTiers() {
  return (
    <section className="relative z-10 py-10 px-8 bg-[#020617]/40 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto relative z-20">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#378ADD] text-sm tracking-widest mb-3">
            LOAN TIERS
          </p>
          <h2 className="text-4xl font-medium text-white mb-4">
            Your proof unlocks your tier
          </h2>
          <p className="text-[#8899aa] text-base max-w-xl mx-auto">
            No collateral required. Your ZK proof determines your borrowing
            power, the stronger your credentials, the better your terms.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <CardSpotlight
              key={tier.name}
              color={tier.spotlightColor}
              className={
                tier.featured
                  ? "border-[#378ADD]/40 scale-105"
                  : ""
              }
            >
              {/* Symbol */}
              <div className="mb-6">
                <span
                  className="text-5xl font-medium"
                  style={{ color: tier.color }}
                >
                  {tier.symbol}
                </span>
                <span className="ml-3 text-sm tracking-widest text-white/40 uppercase">
                  {tier.name}
                </span>
              </div>

              {/* Max loan */}
              <div className="mb-6">
                <p className="text-white/40 text-xs tracking-widest mb-1">
                  MAX LOAN
                </p>
                <p className="text-3xl font-medium text-white">
                  {tier.maxLoan}
                </p>
              </div>

              {/* APR + Duration */}
              <div className="flex gap-6 mb-6">
                <div>
                  <p className="text-white/40 text-xs tracking-widest mb-1">APR</p>
                  <p
                    className="text-lg font-medium"
                    style={{ color: tier.color }}
                  >
                    {tier.apr}
                  </p>
                </div>
                <div>
                  <p className="text-white/40 text-xs tracking-widest mb-1">
                    DURATION
                  </p>
                  <p className="text-lg font-medium text-white">
                    {tier.duration}
                  </p>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-white/10 my-6" />

              {/* Description */}
              <p className="text-white/50 text-sm leading-relaxed mb-6">
                {tier.description}
              </p>

              {/* Requirements */}
              <div className="space-y-2 mb-8">
                {tier.requirements.map((req) => (
                  <div key={req} className="flex items-center gap-2">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: tier.color }}
                    />
                    <span className="text-white/60 text-sm">{req}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <button
                className="w-full py-3 rounded-xl text-sm font-medium transition-all duration-300 hover:opacity-90"
                style={{
                  background: tier.featured
                    ? "#378ADD"
                    : "transparent",
                  border: tier.featured
                    ? "none"
                    : `1px solid ${tier.color}40`,
                  color: tier.featured ? "#fff" : tier.color,
                }}
              >
                Apply for {tier.name}
              </button>
            </CardSpotlight>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-white/30 text-sm mt-10">
          All loans verified by ZK proof on HashKey Chain.
          No personal data stored or exposed.
        </p>
      </div>
    </section>
  );
}
