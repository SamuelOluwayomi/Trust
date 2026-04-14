/**
 * zk.ts — Client-side ZK proof generation for Trust Protocol loan eligibility.
 *
 * Uses the compiled loan_eligibility circuit (snarkjs Groth16) to locally
 * prove that a user qualifies for a loan without revealing their SBT count
 * or repayment history.
 *
 * The .wasm and .zkey files are served from /public/circuits/ so the browser
 * can fetch them without any server-side computation.
 */

// snarkjs is imported dynamically to avoid SSR issues with WebAssembly
let snarkjsLoaded: any = null;
async function getSnarkjs() {
  if (!snarkjsLoaded) {
    snarkjsLoaded = await import("snarkjs");
  }
  return snarkjsLoaded;
}

// Tier configuration — must match LoanManager.sol constants
const TIER_CONFIG: Record<string, { maxLoanWei: bigint; minSbtRequired: number }> = {
  Bronze: { maxLoanWei: BigInt("20000000000000000"),  minSbtRequired: 0 }, // 0.02 HSK
  Silver: { maxLoanWei: BigInt("50000000000000000"),  minSbtRequired: 1 }, // 0.05 HSK
  Gold:   { maxLoanWei: BigInt("100000000000000000"), minSbtRequired: 3 }, // 0.10 HSK
};

export interface ZKProofResult {
  proof: {
    pi_a: [string, string];
    pi_b: [[string, string], [string, string]];
    pi_c: [string, string];
  };
  publicSignals: string[]; // [identityCommitment, eligible, requestedAmount, maxLoanAmount, minSbtRequired]
  // Formatted for the smart contract call
  pA: [bigint, bigint];
  pB: [[bigint, bigint], [bigint, bigint]];
  pC: [bigint, bigint];
  pubSignals: [bigint, bigint, bigint, bigint, bigint];
}

/**
 * Generate a Groth16 ZK proof proving the user is eligible for a loan.
 *
 * @param sbtCount       Number of SBTs held by the user (private)
 * @param totalRepaidWei Total amount repaid in wei (private)
 * @param amountWei      Requested loan amount in wei (public)
 * @param tierName       "Bronze" | "Silver" | "Gold"
 * @returns ZKProofResult with formatted proof arrays ready for the contract call,
 *          or null if proof generation fails (caller should fall back to standard flow).
 */
export async function generateLoanEligibilityProof(
  sbtCount: number,
  totalRepaidWei: bigint,
  amountWei: bigint,
  tierName: string
): Promise<ZKProofResult | null> {
  try {
    const snarkjs = await getSnarkjs();
    const tier = TIER_CONFIG[tierName];
    if (!tier) throw new Error(`Unknown tier: ${tierName}`);

    // Generate a cryptographically random salt to prevent brute-force
    const saltArray = new Uint8Array(31); // 248-bit salt — safe below BN128 field
    crypto.getRandomValues(saltArray);
    const salt = BigInt("0x" + Array.from(saltArray).map(b => b.toString(16).padStart(2, "0")).join(""));

    // Private + public inputs as required by loan_eligibility.circom
    const input = {
      // Private
      sbtCount:        sbtCount.toString(),
      totalRepaid:     totalRepaidWei.toString(),
      salt:            salt.toString(),
      // Public
      requestedAmount: amountWei.toString(),
      maxLoanAmount:   tier.maxLoanWei.toString(),
      minSbtRequired:  tier.minSbtRequired.toString(),
    };

    console.log("[ZK] Generating Groth16 proof for", tierName, "tier...");

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
      input,
      "/circuits/loan_eligibility.wasm",
      "/circuits/loan_eligibility_final.zkey"
    );

    console.log("[ZK] Proof generated. eligible =", publicSignals[1]);

    // Format for Solidity — all values must be bigint
    const pA:  [bigint, bigint]              = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const pB:  [[bigint, bigint], [bigint, bigint]] = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])], // Note: snarkjs outputs in reversed order for Groth16
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ];
    const pC:  [bigint, bigint]              = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
    const pubSignals: [bigint, bigint, bigint, bigint, bigint] = [
      BigInt(publicSignals[0]), // identityCommitment
      BigInt(publicSignals[1]), // eligible
      BigInt(publicSignals[2]), // requestedAmount
      BigInt(publicSignals[3]), // maxLoanAmount
      BigInt(publicSignals[4]), // minSbtRequired
    ];

    return { proof, publicSignals, pA, pB, pC, pubSignals };
  } catch (err) {
    console.error("[ZK] Proof generation failed:", err);
    return null; // Caller will fall back to standard applyForLoan
  }
}
