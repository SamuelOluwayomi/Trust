/*
 * Circuit: CreditScoreProof
 * 
 * Proves that a user's credit score meets a minimum threshold
 * WITHOUT revealing the actual score.
 *
 * Private inputs:
 *   - creditScore:  The user's actual credit score (derived from SBT count, repayment history, etc.)
 *   - salt:         Random value to prevent brute-force attacks on the commitment
 *
 * Public inputs:
 *   - threshold:    The minimum score required for the requested tier
 *
 * Public outputs:
 *   - commitment:   Poseidon hash of (creditScore, salt) — binds the proof to a specific score
 *   - eligible:     1 if creditScore >= threshold, 0 otherwise
 *
 * Compile:
 *   circom credit_score.circom --r1cs --wasm --sym -o ./build
 */

pragma circom 2.1.6;

include "node_modules/circomlib/circuits/poseidon.circom";
include "node_modules/circomlib/circuits/comparators.circom";

template CreditScoreProof() {
    // --- Inputs ---
    signal input creditScore;   // private: user's actual score (0-1000)
    signal input salt;          // private: randomness for commitment
    signal input threshold;     // public:  minimum required score for the tier

    // --- Outputs ---
    signal output commitment;   // Poseidon(creditScore, salt)
    signal output eligible;     // 1 if creditScore >= threshold

    // --- Constraints ---

    // 1. Compute the commitment = Poseidon(creditScore, salt)
    //    This binds the proof to a specific credit score without revealing it.
    component hasher = Poseidon(2);
    hasher.inputs[0] <== creditScore;
    hasher.inputs[1] <== salt;
    commitment <== hasher.out;

    // 2. Range check: creditScore must be in [0, 1000]
    component upperBound = LessEqThan(16);  // 16 bits can represent up to 65535
    upperBound.in[0] <== creditScore;
    upperBound.in[1] <== 1000;
    upperBound.out === 1;

    // 3. Eligibility check: creditScore >= threshold
    //    We use GreaterEqThan which outputs 1 if in[0] >= in[1]
    component geq = GreaterEqThan(16);
    geq.in[0] <== creditScore;
    geq.in[1] <== threshold;
    eligible <== geq.out;
}

component main { public [ threshold ] } = CreditScoreProof();
