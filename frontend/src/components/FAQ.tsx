"use client";
import { useState } from "react";

const faqs = [
  {
    question: "How does the ZK proof work?",
    answer:
      "A Zero-Knowledge circuit runs entirely on your device. You input your credentials privately — credit score, account age, wallet history — and the circuit generates a cryptographic proof that you meet the loan requirements. This proof is sent to the smart contract on HashKey Chain, which verifies it in milliseconds. The contract never sees your actual numbers, only the proof.",
  },
  {
    question: "Is my personal data ever stored or shared?",
    answer:
      "Never. Your credentials are processed locally in your browser and are never sent to any server. The only thing that touches the blockchain is the ZK proof — a string of cryptographic numbers that reveals nothing about your actual data. Trust has no backend database storing user information.",
  },
  {
    question: "What happens if I can't repay my loan?",
    answer:
      "If a loan goes past its due date, a penalty is applied and your on-chain reputation score is reduced. This affects your future borrowing tier — you may be moved down from Silver to Bronze, or become ineligible until the outstanding loan is settled. There is no legal action since the system is fully trustless, but your on-chain credit history will reflect the default permanently.",
  },
  {
    question: "What is a Soulbound Token?",
    answer:
      "A Soulbound Token (SBT) is a non-transferable NFT minted to your wallet after every successful loan repayment. Unlike regular NFTs, it cannot be sold or transferred — it is permanently tied to your wallet address. Over time, your SBTs build a verifiable, privacy-preserving credit history entirely on-chain that improves your borrowing tier.",
  },
  {
    question: "Do I need crypto experience to use Trust?",
    answer:
      "No. Trust is designed for everyone. If you don't have a crypto wallet, you can sign in with Google and a wallet is automatically created for you behind the scenes. You never need to manage seed phrases or understand blockchain mechanics to apply for and receive a loan.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="relative z-10 py-10 px-8 bg-[#020617]/40 backdrop-blur-sm">
      <div className="max-w-3xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-16">
          <p className="text-[#10B981] text-sm tracking-widest mb-3">FAQ</p>
          <h2 className="text-4xl font-medium text-white mb-4">Common questions</h2>
          <p className="text-white/40 text-base">Everything you need to know before applying.</p>
        </div>

        {/* Accordion */}
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden transition-all duration-300"
              style={{
                borderColor: openIndex === i ? "rgba(16, 185, 129, 0.25)" : "rgba(255,255,255,0.08)",
                background: openIndex === i ? "rgba(16, 185, 129, 0.08)" : "rgba(255,255,255,0.025)",
              }}
            >
              {/* Question row */}
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-5 text-left"
              >
                <span
                  className="text-base font-medium transition-colors duration-300"
                  style={{
                    color: openIndex === i ? "#fff" : "rgba(255,255,255,0.75)",
                  }}
                >
                  {faq.question}
                </span>

                {/* Plus / Minus icon */}
                <div
                  className="w-6 h-6 rounded-full border flex items-center justify-center shrink-0 ml-4 transition-all duration-300"
                  style={{
                    borderColor: openIndex === i ? "rgba(16, 185, 129, 0.55)" : "rgba(255,255,255,0.2)",
                    background: openIndex === i ? "rgba(16,185,129,0.2)" : "transparent",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none"
                    className="transition-transform duration-300"
                    style={{
                      transform: openIndex === i ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <path
                      d="M5 1V9M1 5H9"
                      stroke={openIndex === i ? "#34D399" : "rgba(255,255,255,0.5)"}
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              </button>

              {/* Answer */}
              <div
                className="overflow-hidden transition-all duration-500"
                style={{
                  maxHeight: openIndex === i ? "260px" : "0px",
                  opacity: openIndex === i ? 1 : 0,
                }}
              >
                <p className="px-6 pb-6 text-sm text-white/50 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
