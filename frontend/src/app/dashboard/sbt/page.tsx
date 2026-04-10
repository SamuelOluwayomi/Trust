"use client";
import { useUserSBTs } from "@/hooks/useContracts";
import { Certificate } from "@phosphor-icons/react";
import { usePrivy } from "@privy-io/react-auth";

export default function SBTPage() {
  const { sbts, loading } = useUserSBTs();
  const { user } = usePrivy();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-emerald-500 text-sm tracking-widest animate-pulse font-black uppercase">Loading SBTs...</div>
      </div>
    );
  }

  // Use the verified wallet address from Privy for explorer links
  const walletAddress = user?.wallet?.address;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Soulbound Tokens</h1>
          <p className="text-slate-500 text-sm">Your achievement-based non-transferable credit identities.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sbts.length > 0 ? (
          sbts.map((loan) => (
            <div key={loan.id} className="bg-[#050914] border border-emerald-500/10 rounded-3xl p-6 flex flex-col items-center text-center space-y-4 relative overflow-hidden group">
               <div className="absolute top-0 inset-x-0 h-1 bg-emerald-500/20 group-hover:bg-emerald-500 transition-colors" />
               <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center mb-2">
                  <Certificate className="w-10 h-10 text-emerald-400" weight="fill" />
               </div>
               <div className="space-y-1">
                  <h3 className="text-white font-bold uppercase tracking-wider text-sm">Credit Score Boost</h3>
                  <p className="text-[10px] text-slate-500 font-mono">ID: SBT-{String(loan.id).padStart(8, '0')}</p>
               </div>
               <div className="pt-4 border-t border-white/5 w-full">
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500">
                     <span>Rank</span>
                     <span className="text-white">{loan.tier}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-slate-500 mt-2">
                     <span>Value</span>
                     <span className="text-white">{loan.amount} HSK</span>
                  </div>
               </div>
               {walletAddress ? (
                 <a 
                   href={`https://testnet-explorer.hsk.xyz/address/${walletAddress}`}
                   target="_blank"
                   rel="noopener noreferrer"
                   className="w-full py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-emerald-500/20 mt-4 text-center block hover:bg-emerald-500/20 transition-all font-sans"
                 >
                    View on Explorer
                 </a>
               ) : (
                 <div className="w-full py-2 bg-white/5 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/10 mt-4 text-center">
                    Wallet Not Connected
                 </div>
               )}
            </div>
          ))
        ) : (
          <div className="col-span-full bg-[#050914] border border-white/5 rounded-3xl p-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <Certificate className="w-10 h-10 text-slate-600" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">No SBTs Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                Soul-bound tokens are minted upon successful loan repayments to prove your credit identity without revealing data.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
