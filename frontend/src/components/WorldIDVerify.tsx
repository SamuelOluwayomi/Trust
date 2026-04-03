"use client";

import { useState } from "react";
import { IDKitRequestWidget, orbLegacy, type IDKitResult, type RpContext } from "@worldcoin/idkit";

interface Props {
  onVerified: (nullifierHash: string) => void;
}

export default function WorldIDVerify({ onVerified }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [rpContext, setRpContext] = useState<RpContext | null>(null);

  const handleOpen = async () => {
    try {
      setIsInitializing(true);
      
      // 1. Get RP Signature from backend
      const res = await fetch("/api/rp-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: process.env.NEXT_PUBLIC_WORLDCOIN_ACTION }),
      });

      if (!res.ok) throw new Error("Failed to get RP signature");
      
      const sigData = await res.json();
      
      // 2. Set RP Context
      setRpContext({
        rp_id: process.env.NEXT_PUBLIC_WORLDCOIN_RP_ID!,
        nonce: sigData.nonce,
        created_at: sigData.created_at,
        expires_at: sigData.expires_at,
        signature: sigData.sig,
      });

      // 3. Open Widget
      setIsOpen(true);
    } catch (err) {
      console.error("Initialization failed:", err);
      alert("Failed to initialize World ID. Please check your connection.");
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

  const onSuccess = (result: IDKitResult) => {
    // In v4 uniqueness proofs, we check the first response for the nullifier
    const nullifier = "responses" in result ? result.responses[0]?.nullifier : null;
    if (nullifier) {
      onVerified(nullifier);
    }
    setIsOpen(false);
  };

  return (
    <>
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

      {rpContext && (
        <IDKitRequestWidget
          app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`}
          action={process.env.NEXT_PUBLIC_WORLDCOIN_ACTION!}
          rp_context={rpContext}
          preset={orbLegacy()}
          allow_legacy_proofs={true}
          handleVerify={handleVerify}
          onSuccess={onSuccess}
          open={isOpen}
          onOpenChange={setIsOpen}
          autoClose
        />
      )}
    </>
  );
}
