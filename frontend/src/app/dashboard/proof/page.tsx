"use client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useKYC } from "@/hooks/useKYC";
import { ShieldCheck, LockKey, Fingerprint, Browsers, IdentificationCard, IdentificationBadge } from "@phosphor-icons/react";
import WorldIDVerify from "@/components/WorldIDVerify";

export default function ProofPage() {
  const { profile, isVerified, verify } = useUserProfile();
  const { isKycVerified, kycLevelName, kycStatusName, kycCreateTime, requestKyc, requesting } = useKYC();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">ZK Identity Proofs</h1>
          <p className="text-slate-500 text-sm">Verify and manage your anonymous on-chain credentials.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verification Status */}
        <div className="lg:col-span-2 bg-[#050914] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {isVerified ? <ShieldCheck className="w-7 h-7" weight="fill" /> : <LockKey className="w-7 h-7" weight="fill" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">World ID Verification</h2>
              <p className="text-slate-500 text-sm">{isVerified ? "Authenticated via WorldID Protocol" : "Identity verification required"}</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              Your World ID serves as a <strong className="text-white">Proof of Personhood</strong>. By verifying, you prove you are a unique human without revealing any personal data like name, email, or country. This proof is used to unlock borrowing tiers on the HashKey Chain.
            </p>

            {!isVerified && (
              <div className="max-w-xs pt-4">
                <WorldIDVerify onVerified={verify} />
              </div>
            )}
          </div>
        </div>

        {/* Proof Details Card */}
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">Proof Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Protocol</span>
                <span className="text-xs text-emerald-400 font-black">WorldID v3.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Status</span>
                <span className={`text-xs font-black ${isVerified ? "text-emerald-400" : "text-red-400"}`}>{isVerified ? "VERIFIED" : "PENDING"}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Identity Protection</span>
                <span className="text-xs text-blue-400 font-black">ANONYMOUS</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Nullifier Hash</span>
             </div>
             <p className="text-[9px] font-mono text-slate-400 break-all bg-black/30 p-2 rounded">
                {isVerified ? profile?.worldid_nullifier : "0x000...000"}
             </p>
          </div>
        </div>
      </div>

      {/* HashKey KYC Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Verification Status */}
        <div className="lg:col-span-2 bg-[#050914] border border-white/5 rounded-3xl p-8 space-y-6">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isKycVerified ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
              {isKycVerified ? <IdentificationCard className="w-7 h-7" weight="fill" /> : <LockKey className="w-7 h-7" weight="fill" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-widest">HashKey KYC Identity</h2>
              <p className="text-slate-500 text-sm">{isKycVerified ? "SBT Minted to Wallet" : "HashKey Verification Required"}</p>
            </div>
          </div>

          <div className="border-t border-white/5 pt-6 space-y-4">
            <p className="text-slate-400 text-sm leading-relaxed">
              Your HashKey KYC is secured as a <strong className="text-emerald-400">Soulbound Token (SBT)</strong> directly on the HashKey Chain. This provides unforgeable on-chain proof of your identity tier to unlock higher borrowing limits.
            </p>

            {!isKycVerified ? (
              <div className="max-w-xs pt-4 flex gap-3">
                 <button 
                  onClick={() => requestKyc("trust_user")}
                  disabled={requesting}
                  className="w-full py-3 bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 transition-all shadow-[0_0_10px_rgba(16,185,129,0.1)] flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <IdentificationBadge className="w-4 h-4" weight="fill" />
                  {requesting ? "Minting..." : "Mint KYC On-Chain"}
                </button>
              </div>
            ) : (
              <div className="max-w-xs pt-4 flex gap-3">
                 <div className="w-full py-3 bg-emerald-500/10 text-emerald-400 text-[11px] font-black uppercase tracking-widest rounded-xl border border-emerald-500/20 flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4" weight="fill" />
                  SBT Secured
                </div>
              </div>
            )}
          </div>
        </div>

        {/* KYC Details Card */}
        <div className="bg-[#050914] border border-white/5 rounded-3xl p-8 flex flex-col justify-between">
          <div>
            <h3 className="text-white font-black uppercase tracking-widest text-sm mb-6">SBT Metadata</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Protocol</span>
                <span className="text-xs text-emerald-400 font-black">HashKey SBT</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Access Level</span>
                <span className={`text-xs font-black ${isKycVerified ? "text-emerald-400" : "text-red-400"}`}>{kycLevelName}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-white/5">
                <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Mint Status</span>
                <span className={`text-xs font-black ${isKycVerified ? "text-emerald-400" : "text-red-400"}`}>{kycStatusName}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
             <div className="flex items-center gap-2 mb-2">
                <Fingerprint className="w-4 h-4 text-slate-400" />
                <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Date Minted</span>
             </div>
             <p className="text-[10px] font-mono text-emerald-400 break-all bg-emerald-500/10 border border-emerald-500/20 p-2 rounded">
               {isKycVerified && kycCreateTime ? kycCreateTime.toLocaleDateString() : "Pending Mint"}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
