"use client";

import { useState } from "react";
import { IDKitRequestWidget, orbLegacy, type IDKitResult, type RpContext } from "@worldcoin/idkit";

interface Props {
  onVerified: (nullifierHash: string) => Promise<any>;
}

export default function WorldIDVerify({ onVerified }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = async () => {
    try {
      setIsInitializing(true);
      setError(null);
      
      const res = await fetch("/api/rp-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION }),
      });

      if (!res.ok) throw new Error("Failed to get RP signature");
      
      const sigData = await res.json();
      
      setRpContext({
        rp_id: process.env.NEXT_PUBLIC_WORLDCOIN_RP_ID!,
        nonce: sigData.nonce,
        created_at: sigData.created_at,
        expires_at: sigData.expires_at,
        signature: sigData.sig,
      });

      setIsOpen(true);
    } catch (err: any) {
      console.error("Initialization failed:", err);
      setError("Failed to initialize World ID. Please check your connection.");
    } finally {
      setIsInitializing(false);
    }
  };

  const handleVerify = async (result: IDKitResult) => {
    const res = await fetch("/api/verify-worldid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.detail || "Verification failed on server.");
    }
  };

  const onSuccess = async (result: IDKitResult) => {
    let nullifier = null;
    
    if (result.protocol_version === "4.0" && !("session_id" in result)) {
      nullifier = (result as any).responses[0]?.nullifier;
    } else if (result.protocol_version === "3.0") {
      nullifier = (result as any).responses[0]?.nullifier;
    }

    if (nullifier) {
      try {
        await onVerified(nullifier);
        setIsOpen(false);
      } catch (err: any) {
        console.error("Post-verification save failed:", err);
        setError(err.message || "Failed to save verification.");
      }
    }
  };

  return (
    <div className="space-y-3">
      <button
        onClick={handleOpen}
        disabled={isInitializing}
        className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 text-white/70 hover:text-white text-sm transition-all shadow-sm ${
          isInitializing ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="6" stroke="#10b981" strokeWidth="1.5" />
          <circle cx="14" cy="14" r="2" fill="#10b981" />
        </svg>
        {isInitializing ? "Initializing..." : "Verify with World ID"}
      </button>

      {error && (
        <div className="text-[10px] text-red-400 font-bold tracking-widest uppercase text-center animate-pulse">
          {error}
        </div>
      )}

      {rpContext && (
        <IDKitRequestWidget
          app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`}
          action={process.env.NEXT_PUBLIC_WORLDCOIN_ACTION!}
          rp_context={rpContext}
          preset={orbLegacy()}
          allow_legacy_proofs={true}
          environment="staging"
          handleVerify={handleVerify}
          onSuccess={onSuccess}
          open={isOpen}
          onOpenChange={setIsOpen}
          autoClose
        />
      )}
    </div>
  );
}
