"use client";

import { IDKitWidget, VerificationLevel, type ISuccessResult } from "@worldcoin/idkit";

interface Props {
  onVerified: (nullifierHash: string) => void;
}

export default function WorldIDVerify({ onVerified }: Props) {
  const handleVerify = async (proof: ISuccessResult) => {
    const res = await fetch("/api/verify-worldid", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proof),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error?.message || "Verification failed.");
    }
  };

  const onSuccess = (result: ISuccessResult) => {
    onVerified(result.nullifier_hash);
  };

  return (
    <IDKitWidget
      app_id={process.env.NEXT_PUBLIC_WORLDCOIN_APP_ID as `app_${string}`}
      action={process.env.NEXT_PUBLIC_WORLDCOIN_ACTION!}
      verification_level={VerificationLevel.Device}
      handleVerify={handleVerify}
      onSuccess={onSuccess}
    >
      {({ open }) => (
        <button
          onClick={open}
          className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-white/10 bg-white/3 hover:bg-white/6 text-white/70 hover:text-white text-sm transition-all shadow-sm"
        >
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="13" stroke="#10b981" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="6" stroke="#10b981" strokeWidth="1.5"/>
            <circle cx="14" cy="14" r="2" fill="#10b981"/>
          </svg>
          Verify with World ID
        </button>
      )}
    </IDKitWidget>
  );
}
