"use client";

import { useState } from "react";
import { IDKitRequestWidget, orbLegacy, type IDKitResult } from "@worldcoin/idkit";

interface Props {
  onVerified: (nullifierHash: string) => void;
}

export default function WorldIDVerify({ onVerified }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleVerify = async (result: IDKitResult) => {
    const res = await fetch("/api/verify-worldid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Verification failed.");
    }
  };

  const onSuccess = (result: IDKitResult) => {
    // In v4, the nullifier is inside the responses array
    const response = result.responses?.[0];
    const nullifier = response && 'nullifier' in response ? response.nullifier : null;
    
    if (nullifier) {
      onVerified(nullifier);
    }
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 text-white/70 hover:text-white text-sm transition-all shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <circle cx="14" cy="14" r="13" stroke="#10b981" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="6" stroke="#10b981" strokeWidth="1.5"/>
          <circle cx="14" cy="14" r="2" fill="#10b981"/>
        </svg>
        Verify with World ID
      </button>

      <IDKitRequestWidget
        app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`}
        action={process.env.NEXT_PUBLIC_WORLDCOIN_ACTION!}
        preset={orbLegacy()}
        environment="staging"
        allow_legacy_proofs={true}
        rp_context={{
          rp_id: "rp_e2bb8c52d7e69e85", // Placeholder RP ID
          nonce: Math.random().toString(36).substring(7),
          created_at: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          signature: "0x", // Signature is required for v4 production, dummy for staging
        }}
        handleVerify={handleVerify}
        onSuccess={onSuccess}
        open={isOpen}
        onOpenChange={setIsOpen}
        autoClose
      />
    </>
  );
}
