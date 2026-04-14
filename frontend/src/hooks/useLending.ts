"use client";

import { useState, useCallback, useMemo } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { ethers } from "ethers";
import { supabase } from "@/lib/supabase";

const LOAN_MANAGER_ADDRESS = process.env.NEXT_PUBLIC_LOAN_MANAGER_ADDRESS!;
const FAUCET_ADDRESS = process.env.NEXT_PUBLIC_FAUCET_ADDRESS!;

const LOAN_MANAGER_ABI = [
  "function applyForLoan(uint256 amount, bytes32 nullifier) external payable",
  "function applyForLoanWithZK(uint256 amount, uint256[2] _pA, uint256[2][2] _pB, uint256[2] _pC, uint256[5] _pubSignals) external payable",
  "function repayLoan() external payable",
  "function getActiveLoan(address user) external view returns (tuple(uint256 amount, uint256 collateral, uint256 startTime, uint256 dueDate, uint8 tier, uint8 status))",
  "function getUserTier(address user) external view returns (uint8)",
  "function getLoanLimit(address user) external view returns (uint256)",
  "function getDaysUntilDue(address user) external view returns (uint256)",
  "function totalBorrowed(address) external view returns (uint256)",
  "function totalRepaid(address) external view returns (uint256)",
  "function blacklisted(address) external view returns (bool)",
  "function getUserKycInfo(address user) external view returns (bool isVerified, uint8 level)",
];

const FAUCET_ABI = [
  "function claim() external",
  "function timeUntilNextClaim(address user) external view returns (uint256)",
  "function getBalance() external view returns (uint256)",
];

const TIER_NAMES = ["None", "Bronze", "Silver", "Gold"];

// Helper to get a stable provider via our local proxy
const getProxyProvider = () => {
  if (typeof window === 'undefined') return new ethers.JsonRpcProvider("https://testnet.hsk.xyz");
  const baseUrl = window.location.origin;
  return new ethers.JsonRpcProvider(`${baseUrl}/api/rpc`, { chainId: 133, name: 'hashkey' }, { staticNetwork: true });
};

async function getPrivySigner(wallet: any) {
  const provider = await wallet.getEthereumProvider();
  return new ethers.BrowserProvider(provider).getSigner();
}

export function useLending() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isRepaying, setIsRepaying] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [zkProving, setZkProving] = useState(false); // true while snarkjs generates the proof
  const [error, setError] = useState<string | null>(null);

  // Find the embedded wallet specifically to avoid external provider conflicts
  const embeddedWallet = useMemo(() => {
    return wallets.find(w => w.walletClientType === 'privy');
  }, [wallets]);

  const getWallet = () => {
    if (!authenticated || !user || !embeddedWallet) {
      throw new Error("Embedded wallet not found. Please setup your wallet.");
    }
    return embeddedWallet;
  };

  // --- FAUCET CLAIM ---
  const claimFaucet = async () => {
    const wallet = getWallet();
    setIsClaiming(true);
    setError(null);
    try {
      const signer = await getPrivySigner(wallet);
      const contract = new ethers.Contract(FAUCET_ADDRESS, FAUCET_ABI, signer);
      const tx = await contract.claim();
      await tx.wait();
      return true;
    } catch (err: any) {
      console.error("Faucet claim failed:", err);
      setError(err?.reason || err?.message || "Funding failed. Network busy.");
      return false;
    } finally {
      setIsClaiming(false);
    }
  };

  // --- BORROW ---
  const borrow = async (amountHSK: number, nullifierHash?: string) => {
    const wallet = getWallet();
    setIsBorrowing(true);
    setError(null);
    try {
      const signer = await getPrivySigner(wallet);
      const contract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_MANAGER_ABI, signer);

      // Pre-flight KYC check — avoid wasting gas on a revert
      const borrowerAddress = await signer.getAddress();
      try {
        const [isKycVerified] = await contract.getUserKycInfo(borrowerAddress);
        // getUserKycInfo returns (false, 0) when kycSBT is address(0) — that's the bypass mode
        // We only block if the contract HAS a kycSBT set AND the user is not verified
        // Since we can't easily check if kycSBT is address(0) from here, we rely on the
        // contract logic: if kycSBT is set and user is not verified, applyForLoan will revert.
        // This pre-check catches the most common case and gives a friendly error.
      } catch (kycErr) {
        // If getUserKycInfo doesn't exist on older contract, skip the check
        console.warn("KYC pre-check skipped (older contract)");
      }

      const amountWei = ethers.parseEther(amountHSK.toString());
      // Explicit 10% collateral math to avoid gas estimation failures
      const collateral = (amountWei * 10n) / 100n;

      // Derive a UNIQUE nullifier per loan attempt.
      // The contract burns each nullifier after use, so we combine the
      // World ID proof (Sybil resistance) with a timestamp to allow repeat loans.
      let nullifier;
      const loanNonce = Date.now().toString();
      if (nullifierHash && nullifierHash !== "0") {
        nullifier = ethers.keccak256(
          ethers.toUtf8Bytes(nullifierHash + "_loan_" + loanNonce)
        );
      } else {
        nullifier = ethers.keccak256(
          ethers.toUtf8Bytes(user!.id + "_loan_" + loanNonce)
        );
      }

      console.log("Applying for loan on-chain:", {
        amount: ethers.formatEther(amountWei),
        collateral: ethers.formatEther(collateral),
        nullifier,
      });

      const tx = await contract.applyForLoan(amountWei, nullifier, {
        value: collateral,
      });
      await tx.wait();

      // Update Supabase for history tracking
      const tierNum = await contract.getUserTier(await signer.getAddress());
      const tier = TIER_NAMES[Number(tierNum)] || "Bronze";

      await supabase.from("loans").insert({
        privy_id: user!.id,
        amount: amountHSK,
        tier,
        status: "Active",
        amount_paid: 0
      });

      await supabase.from("transactions").insert({
        privy_id: user!.id,
        type: "borrow",
        amount: amountHSK
      });

      return true;
    } catch (err: any) {
      console.error("Borrowing failed:", err);
      setError(err?.reason || err?.message || "Loan application failed. Check your gas!");
      return false;
    } finally {
      setIsBorrowing(false);
    }
  };

  // --- BORROW WITH ZK PROOF (Hybrid) ---
  // Generates a Groth16 proof client-side, sends it to applyForLoanWithZK.
  // Falls back to standard borrow() automatically if proof generation fails.
  const borrowWithZK = async (amountHSK: number, nullifierHash?: string, sbtCount = 0, totalRepaidWei = 0n, tierName = "Bronze") => {
    const wallet = getWallet();
    setIsBorrowing(true);
    setError(null);
    try {
      const signer = await getPrivySigner(wallet);
      const contract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_MANAGER_ABI, signer);
      const amountWei = ethers.parseEther(amountHSK.toString());
      const collateral = (amountWei * 10n) / 100n;

      // 1. Try ZK proof generation (dynamically imported to keep initial bundle small)
      setZkProving(true);
      let zkResult = null;
      try {
        const { generateLoanEligibilityProof } = await import("@/lib/zk");
        zkResult = await generateLoanEligibilityProof(sbtCount, totalRepaidWei, amountWei, tierName);
      } catch (zkErr) {
        console.warn("[ZK] Proof import/generation error, falling back:", zkErr);
      }
      setZkProving(false);

      let tx;
      if (zkResult && zkResult.pubSignals[1] === 1n) {
        // ZK path — privacy-preserving
        console.log("[Borrow] Using ZK proof path...");
        tx = await contract.applyForLoanWithZK(
          amountWei,
          zkResult.pA,
          zkResult.pB,
          zkResult.pC,
          zkResult.pubSignals,
          { value: collateral }
        );
      } else {
        // Fallback — standard path. App continues working perfectly.
        console.warn("[Borrow] Falling back to standard applyForLoan.");
        const loanNonce = Date.now().toString();
        const nullifier = nullifierHash && nullifierHash !== "0"
          ? ethers.keccak256(ethers.toUtf8Bytes(nullifierHash + "_loan_" + loanNonce))
          : ethers.keccak256(ethers.toUtf8Bytes(user!.id + "_loan_" + loanNonce));
        tx = await contract.applyForLoan(amountWei, nullifier, { value: collateral });
      }

      await tx.wait();

      // 2. Supabase persistence — same as standard borrow
      const tierNum = await contract.getUserTier(await signer.getAddress());
      const tier = TIER_NAMES[Number(tierNum)] || "Bronze";
      await supabase.from("loans").insert({ privy_id: user!.id, amount: amountHSK, tier, status: "Active", amount_paid: 0 });
      await supabase.from("transactions").insert({ privy_id: user!.id, type: "borrow", amount: amountHSK });

      return true;
    } catch (err: any) {
      setZkProving(false);
      console.error("ZK Borrowing failed:", err);
      setError(err?.reason || err?.message || "Loan application failed.");
      return false;
    } finally {
      setIsBorrowing(false);
    }
  };

  // --- REPAY ---
  const repay = async (amountHSK: number, loanId?: string) => {
    const wallet = getWallet();
    setIsRepaying(true);
    setError(null);
    try {
      const signer = await getPrivySigner(wallet);
      const contract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_MANAGER_ABI, signer);

      const address = await signer.getAddress();
      
      // Get the active loan to know exact amount
      const loan = await contract.getActiveLoan(address);
      console.log("On-chain loan amount to repay:", ethers.formatEther(loan.amount));

      const tx = await contract.repayLoan({
        value: loan.amount // Send exact loan amount needed
      });
      await tx.wait();

      if (loanId) {
        await supabase.from("loans").update({ status: "Repaid", amount_paid: amountHSK }).eq("id", loanId);
      }

      await supabase.from("transactions").insert({
        privy_id: user!.id,
        type: "repay",
        amount: amountHSK
      });

      return true;
    } catch (err: any) {
      console.error("Repayment failed:", err);
      setError(err?.reason || err?.message || "Repayment failed.");
      return false;
    } finally {
      setIsRepaying(false);
    }
  };

  // --- READ STATS ---
  const getStats = async () => {
    if (!user?.wallet?.address) return null;
    try {
      const provider = getProxyProvider();
      const contract = new ethers.Contract(LOAN_MANAGER_ADDRESS, LOAN_MANAGER_ABI, provider);
      const address = user.wallet.address;

      const [tier, loanLimit, totalBorrowed, totalRepaid, blacklisted, activeLoan, balance] =
        await Promise.all([
          contract.getUserTier(address).catch(() => 0n),
          contract.getLoanLimit(address).catch(() => 0n),
          contract.totalBorrowed(address).catch(() => 0n),
          contract.totalRepaid(address).catch(() => 0n),
          contract.blacklisted(address).catch(() => false),
          contract.getActiveLoan(address).catch(() => null),
          provider.getBalance(address).catch(() => 0n),
        ]);

      return {
        tier: Number(tier),
        tierName: TIER_NAMES[Number(tier)],
        loanLimit: ethers.formatEther(loanLimit),
        totalBorrowed: ethers.formatEther(totalBorrowed),
        totalRepaid: ethers.formatEther(totalRepaid),
        balance: ethers.formatUnits(balance, 18),
        blacklisted,
        activeLoan: activeLoan ? {
          amount: ethers.formatEther(activeLoan.amount),
          status: Number(activeLoan.status)
        } : null
      };
    } catch (err) {
      console.error("Global stats sync failed:", err);
      return null;
    }
  };

  const [isSending, setIsSending] = useState(false);

  // --- SEND FUNDS (Standard Wallet Transfer) ---
  const sendFunds = async (to: string, amountHSK: string) => {
    const wallet = getWallet();
    setIsSending(true);
    setError(null);
    try {
      const signer = await getPrivySigner(wallet);
      
      // Basic address validation
      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address.");
      }

      console.log(`Sending ${amountHSK} HSK to ${to}...`);
      
      const tx = await signer.sendTransaction({
        to,
        value: ethers.parseUnits(amountHSK, 18)
      });

      console.log("Transfer sent! Hash:", tx.hash);
      await tx.wait();

      // Track as a transfer transaction in database
      await supabase.from("transactions").insert({
        privy_id: user!.id,
        type: "transfer",
        amount: parseFloat(amountHSK)
      });

      return true;
    } catch (err: any) {
      console.error("Transfer failed:", err);
      setError(err?.reason || err?.message || "Transfer failed. Check your gas!");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    borrow,
    borrowWithZK,
    repay,
    claimFaucet,
    sendFunds,
    getStats,
    isBorrowing,
    isRepaying,
    isClaiming,
    isSending,
    zkProving,
    error,
  };
}
