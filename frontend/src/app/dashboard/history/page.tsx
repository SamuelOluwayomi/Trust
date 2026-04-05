"use client";
import { useDashboardData } from "@/hooks/useDashboardData";
import { ClockCounterClockwise, CheckCircle } from "@phosphor-icons/react";
import { useSearchParams } from "next/navigation";

export default function HistoryPage() {
  const { loans, loading } = useDashboardData();
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const repaidLoans = loans.filter(l => l.status === 'Repaid');
  const filteredLoans = repaidLoans.filter(l => 
    l.amount.toString().includes(query) || 
    l.tier.toLowerCase().includes(query) || 
    l.id.toLowerCase().includes(query)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-emerald-500 text-sm tracking-widest animate-pulse font-black uppercase">Loading History...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Repayment History</h1>
          <p className="text-slate-500 text-sm">Your track record of successful HSK repayments.</p>
        </div>
      </div>

      <div className="bg-[#050914] border border-white/5 rounded-3xl overflow-hidden">
        {filteredLoans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0a0f1e]/50 border-b border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Tier</th>
                  <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black tracking-widest text-slate-500 uppercase">SBT Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLoans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4 text-xs font-medium text-slate-300">
                      {new Date(loan.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-white">
                      {loan.amount} HSK
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 capitalize">
                      {loan.tier}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-[6px] text-[10px] font-bold tracking-widest uppercase bg-emerald-500/10 text-emerald-400 gap-1.5">
                        <CheckCircle className="w-3 h-3" weight="fill" />
                        REPAID
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      #SBT-{loan.id.slice(0, 4).toUpperCase()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
              <ClockCounterClockwise className="w-10 h-10 text-slate-600" weight="duotone" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white uppercase tracking-widest">
                {repaidLoans.length > 0 ? "No Matching Results" : "No History Found"}
              </h3>
              <p className="text-slate-500 max-w-xs mx-auto">
                {repaidLoans.length > 0 
                  ? "We couldn't find any repayments matching your search query." 
                  : "Successfully repaid loans will appear here as Soul-Bound Token receipts of your creditworthiness."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
