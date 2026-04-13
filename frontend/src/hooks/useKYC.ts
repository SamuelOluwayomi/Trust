"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { ethers } from "ethers";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import {
  getKycSBTContract,
  getKycSBTContractSigned,
  ADDRESSES,
} from "@/lib/contracts";

const KYC_LEVEL_NAMES = ["None", "Basic", "Advanced", "Premium", "Ultimate"];
const KYC_STATUS_NAMES = ["None", "Approved", "Revoked"];

/**
 * Hook for interacting with the HashKey Chain KYC SBT contract.
 * Provides KYC verification status, level info, and the ability to request KYC.
 *
 * If NEXT_PUBLIC_KYC_SBT_ADDRESS is not set, all KYC checks gracefully return defaults.
 */

function useEmbeddedWallet() {
  const { wallets } = useWallets();
  return useMemo(() => {
    return wallets.find(w => w.walletClientType === 'privy');
  }, [wallets]);
}

export function useKYC() {
  const { user } = usePrivy();
  const embeddedWallet = useEmbeddedWallet();
  const address = user?.wallet?.address;

  const [isKycVerified, setIsKycVerified] = useState(false);
  const [kycLevel, setKycLevel] = useState(0);
  const [kycStatus, setKycStatus] = useState(0);
  const [kycEnsName, setKycEnsName] = useState("");
  const [kycCreateTime, setKycCreateTime] = useState<Date | null>(null);
  const [fee, setFee] = useState("0");
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if KYC SBT is configured
  const isKycEnabled = Boolean(ADDRESSES.kycSBT);

  const fetchKycStatus = useCallback(async () => {
    if (!address || !isKycEnabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const contract = getKycSBTContract();
      if (!contract) {
        setLoading(false);
        return;
      }

      const [humanResult, kycInfo, totalFee] = await Promise.all([
        contract.isHuman(address).catch(() => [false, 0]),
        contract.getKycInfo(address).catch(() => ["", 0, 0, 0n]),
        contract.getTotalFee().catch(() => 0n),
      ]);

      const [isValid, level] = humanResult;
      setIsKycVerified(isValid);
      setKycLevel(Number(level));

      // Parse KYC info
      setKycEnsName(kycInfo[0] || "");
      setKycStatus(Number(kycInfo[2]));
      if (Number(kycInfo[3]) > 0) {
        setKycCreateTime(new Date(Number(kycInfo[3]) * 1000));
      }

      setFee(ethers.formatEther(totalFee));
    } catch (err) {
      console.error("KYC status check failed:", err);
    } finally {
      setLoading(false);
    }
  }, [address, isKycEnabled]);

  useEffect(() => {
    fetchKycStatus();
  }, [fetchKycStatus]);

  const requestKyc = useCallback(
    async (ensName: string) => {
      if (!embeddedWallet || !isKycEnabled) {
        setError("KYC not available. Ensure your wallet is connected.");
        return false;
      }

      setRequesting(true);
      setError(null);

      try {
        const contract = await getKycSBTContractSigned(embeddedWallet);
        if (!contract) {
          setError("KYC SBT contract not configured.");
          return false;
        }

        const totalFee = await contract.getTotalFee();

        const tx = await contract.requestKyc(ensName, {
          value: totalFee,
        });
        await tx.wait();

        // Refresh status after successful request
        await fetchKycStatus();
        return true;
      } catch (err: any) {
        console.error("KYC request failed:", err);
        setError(
          err?.reason || err?.message || "KYC request failed. Please try again."
        );
        return false;
      } finally {
        setRequesting(false);
      }
    },
    [embeddedWallet, isKycEnabled, fetchKycStatus]
  );

  return {
    isKycEnabled,
    isKycVerified,
    kycLevel,
    kycLevelName: KYC_LEVEL_NAMES[kycLevel] || "Unknown",
    kycStatus,
    kycStatusName: KYC_STATUS_NAMES[kycStatus] || "Unknown",
    kycEnsName,
    kycCreateTime,
    fee,
    loading,
    requesting,
    error,
    requestKyc,
    refetch: fetchKycStatus,
  };
}
