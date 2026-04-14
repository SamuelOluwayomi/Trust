# Trust Protocol — ZK Circuits

Custom Zero-Knowledge circuits for privacy-preserving credit scoring and loan eligibility on the Trust Protocol.

## Circuits

### 1. Credit Score Proof (`credit_score/`)
Proves that a user's credit score meets a minimum threshold **without revealing their actual score**.

| Signal | Visibility | Description |
|--------|-----------|-------------|
| `creditScore` | Private | User's computed score (0–1000) |
| `salt` | Private | Random blinding factor |
| `threshold` | Public | Minimum score for the tier |
| `commitment` | Output | Poseidon(creditScore, salt) |
| `eligible` | Output | 1 if score ≥ threshold |

### 2. Loan Eligibility (`loan_eligibility/`)
Proves loan eligibility by combining SBT count, repayment history, and loan amount — all without exposing the private details.

| Signal | Visibility | Description |
|--------|-----------|-------------|
| `sbtCount` | Private | Number of SBTs held |
| `totalRepaid` | Private | Total repaid amount (wei) |
| `salt` | Private | Random blinding factor |
| `requestedAmount` | Public | Loan amount requested |
| `maxLoanAmount` | Public | Max loan for the tier |
| `minSbtRequired` | Public | Min SBTs for the tier |
| `identityCommitment` | Output | Poseidon(sbtCount, totalRepaid, salt) |
| `eligible` | Output | 1 if all conditions met |

## Prerequisites

```bash
# Install Circom compiler (v2.1.6+)
# See: https://docs.circom.io/getting-started/installation/

# Install snarkjs globally
npm install -g snarkjs

# Install circomlib (circuit dependencies)
cd circuits
npm install circomlib
```

## Compilation & Proof Generation

### Step 1: Compile the circuit
```bash
cd circuits/credit_score
circom credit_score.circom --r1cs --wasm --sym -o ./build
```

### Step 2: Generate witness
```bash
cd build/credit_score_js
node generate_witness.js credit_score.wasm ../../input.json witness.wtns
```

### Step 3: Powers of Tau ceremony (one-time)
```bash
# Use an existing ptau file or generate one
snarkjs powersoftau new bn128 14 pot14_0000.ptau
snarkjs powersoftau contribute pot14_0000.ptau pot14_0001.ptau --name="First contribution"
snarkjs powersoftau prepare phase2 pot14_0001.ptau pot14_final.ptau
```

### Step 4: Generate proving & verification keys
```bash
snarkjs groth16 setup credit_score.r1cs pot14_final.ptau credit_score_0000.zkey
snarkjs zkey contribute credit_score_0000.zkey credit_score_final.zkey --name="First contribution"
snarkjs zkey export verificationkey credit_score_final.zkey verification_key.json
```

### Step 5: Generate proof
```bash
snarkjs groth16 prove credit_score_final.zkey witness.wtns proof.json public.json
```

### Step 6: Verify proof
```bash
snarkjs groth16 verify verification_key.json public.json proof.json
```

### Step 7: (Optional) Generate Solidity verifier
```bash
snarkjs zkey export solidityverifier credit_score_final.zkey CreditScoreVerifier.sol
```

## Circuit Constraint Counts

| Circuit | Estimated Constraints |
|---------|----------------------|
| `credit_score` | ~700 |
| `loan_eligibility` | ~1,200 |

Both circuits use the Poseidon hash function (most efficient hash for ZK) and comparator templates from circomlib.

## Integration with Trust Protocol

These circuits correctly function alongside the on-chain credit system as an active **Hybrid Architecture**:

1. **Frontend Integration**: The Next.js frontend downloads the highly optimized `.wasm` and `.zkey` binaries for the `loan_eligibility` circuit directly into the browser.
2. **Local Proof Generation**: When the user requests a loan, `snarkjs` constructs a Groth16 ZK proof strictly locally on the user's laptop using their live SBT count.
3. **Smart Contract Verification**: The proof is passed natively inside the EVM transaction to the `LoanManager.sol` contract and instantly verified by the compiled `LoanEligibilityVerifier.sol` (export of the `loan_eligibility_final.zkey`).
4. **Complete Privacy**: The verifier successfully allows the loan function to execute without natively checking the user's token balance. The verifier only learns that the user qualifies — never their actual score or repayment history.

*Status: **Fully Deployed & Integrated**. The `loan_eligibility` circuit strictly calculates privacy-preserving tiers via `applyForLoanWithZK()`.*
