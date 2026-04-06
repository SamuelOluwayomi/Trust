"use client";

import { useState } from "react";
import { useLending } from "@/hooks/useLending";
import { X, PaperPlaneTilt, WarningCircle, CheckCircle } from "@phosphor-icons/react";

interface SendFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userBalance: string;
}

export default function SendFundsModal({ isOpen, onClose, userBalance }: SendFundsModalProps) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const { sendFunds, isSending, error } = useLending();
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await sendFunds(recipient, amount);
    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        window.location.reload();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 9999 }}>
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={!isSending ? onClose : undefined} 
      />
      
      <div className="relative w-full max-w-md bg-[#050914] border border-emerald-500/20 rounded-[2.5rem] p-8 shadow-2xl shadow-emerald-500/5 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] -mr-10 -mt-10" />
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <PaperPlaneTilt className="w-6 h-6 text-emerald-400" weight="fill" />
            </div>
            <h2 className="text-lg font-black text-white uppercase tracking-widest">Send HSK</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
            disabled={isSending}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {success ? (
          <div className="py-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-emerald-400" weight="fill" />
            </div>
            <div>
              <h3 className="text-white font-bold uppercase tracking-widest">Transfer Sent!</h3>
              <p className="text-slate-500 text-xs mt-1">Transaction hash saved to history.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} className="space-y-6">
            {/* Recipient Input */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recipient Address</label>
              <input 
                required
                type="text"
                placeholder="0x..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors font-mono"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Amount</label>
                <span className="text-[10px] font-bold text-slate-600">Balance: {Number(userBalance).toFixed(4)} HSK</span>
              </div>
              <div className="relative">
                <input 
                  required
                  type="number"
                  step="0.0001"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                />
                <button 
                  type="button"
                  onClick={() => setAmount(userBalance)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-emerald-400 uppercase tracking-widest hover:text-emerald-300 transition-colors"
                >
                  Max
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-[10px] font-bold">
                <WarningCircle className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              disabled={isSending}
              type="submit"
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50 text-[#050914] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
            >
              {isSending ? "Processing..." : "Confirm Transfer"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
