/*
 * Circuit: LoanEligibility
 * 
 * Proves that a user is eligible for a specific loan amount based on their
 * on-chain credit history — without revealing their full financial details.
 *
 * Private inputs:
 *   - sbtCount:        Number of Soulbound Tokens held (repayment proofs)
 *   - totalRepaid:     Total amount the user has successfully repaid (in wei-scale units)
 *   - salt:            Random value for commitment binding
 *
 * Public inputs:
 *   - requestedAmount: The loan amount the user is requesting
 *   - maxLoanAmount:   The maximum allowed loan for the user's tier
 *   - minSbtRequired:  Minimum SBTs required for the tier (0=Bronze, 1=Silver, 3=Gold)
 *
 * Public outputs:
 *   - identityCommitment:  Poseidon(sbtCount, totalRepaid, salt)
 *   - eligible:            1 if ALL conditions are met, 0 otherwise
 *
 * Conditions for eligibility:
 *   1. sbtCount >= minSbtRequired
 *   2. requestedAmount <= maxLoanAmount
 *   3. totalRepaid > 0 (has repayment history) OR minSbtRequired == 0 (Bronze tier)
 *
 * Compile:
 *   circom loan_eligibility.circom --r1cs --wasm --sym -o ./build
 */

pragma circom 2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template LoanEligibility() {
    // --- Private Inputs ---
    signal input sbtCount;         // Number of SBTs held
    signal input totalRepaid;      // Total amount repaid (scaled integer)
    signal input salt;             // Randomness

    // --- Public Inputs ---
    signal input requestedAmount;  // Loan amount requested
    signal input maxLoanAmount;    // Max allowed for the tier
    signal input minSbtRequired;   // SBTs needed for tier access

    // --- Outputs ---
    signal output identityCommitment;  // Binding commitment
    signal output eligible;            // 1 if eligible

    // --- Constraints ---

    // 1. Identity commitment = Poseidon(sbtCount, totalRepaid, salt)
    component hasher = Poseidon(3);
    hasher.inputs[0] <== sbtCount;
    hasher.inputs[1] <== totalRepaid;
    hasher.inputs[2] <== salt;
    identityCommitment <== hasher.out;

    // 2. Check: sbtCount >= minSbtRequired
    component sbtCheck = GreaterEqThan(16);
    sbtCheck.in[0] <== sbtCount;
    sbtCheck.in[1] <== minSbtRequired;
    signal sbtOk;
    sbtOk <== sbtCheck.out;  // 1 if sufficient SBTs

    // 3. Check: requestedAmount <= maxLoanAmount
    component amountCheck = LessEqThan(64);  // 64 bits for large wei values
    amountCheck.in[0] <== requestedAmount;
    amountCheck.in[1] <== maxLoanAmount;
    signal amountOk;
    amountOk <== amountCheck.out;  // 1 if within limit

    // 4. Check: repayment history exists OR is Bronze tier (minSbtRequired == 0)
    //    totalRepaid > 0   =>   repaidPositive = 1
    component repaidCheck = GreaterThan(64);
    repaidCheck.in[0] <== totalRepaid;
    repaidCheck.in[1] <== 0;
    signal repaidPositive;
    repaidPositive <== repaidCheck.out;

    //    minSbtRequired == 0   =>   isBronze = 1
    component bronzeCheck = IsZero();
    bronzeCheck.in <== minSbtRequired;
    signal isBronze;
    isBronze <== bronzeCheck.out;

    //    historyOk = repaidPositive OR isBronze
    //    Since both are 0 or 1:  OR(a,b) = a + b - a*b
    signal repaidTimesBronze;
    repaidTimesBronze <== repaidPositive * isBronze;
    signal historyOk;
    historyOk <== repaidPositive + isBronze - repaidTimesBronze;

    // 5. Final eligibility = sbtOk AND amountOk AND historyOk
    //    Since all are binary (0 or 1):  AND = product
    signal partial;
    partial <== sbtOk * amountOk;
    eligible <== partial * historyOk;
}

component main { public [ requestedAmount, maxLoanAmount, minSbtRequired ] } = LoanEligibility();
