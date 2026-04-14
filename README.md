# Trust: ZK-Powered Undercollateralized Lending

![Trust Header](https://img.shields.io/badge/Blockchain-HashKey%20Chain-6D28D9?style=for-the-badge)
![Identity](https://img.shields.io/badge/Identity-WorldID-black?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Hardhat%20|%20Supabase-5B21B6?style=for-the-badge)

**Trust** is a decentralized, undercollateralized lending protocol built on the **HashKey Chain**. It leverages **World ID** for identity verification and **Zero-Knowledge Proofs (ZKP)** to enable secure, privacy-preserving loans based on on-chain credit scores (Soul-Bound Tokens).

## Vision
DeFi lending currently requires massive overcollateralization, which is capital inefficient. **Trust** solves this by linking real-world identity (via World ID) and on-chain behavior (SBTs) to provide trustworthy borrowers with undercollateralized loans, unlocking a more inclusive financial ecosystem.

## Key Features
- **World ID Verification**: Sybil-resistant, private identity verification to ensure "One Person, One Account".
- **HashKey KYC Integration**: Native on-chain compliance via HashKey's KYC Soulbound Tokens, allowing seamless identity verification without external data sharing.
- **Credit SBTs**: Trust's native Soul-Bound Tokens that represent a user's creditworthiness and successful repayment history.
- **ZK-Lending**: Privacy-preserving proof of credit history and humanity without revealing sensitive physical details.
- **Undercollateralized Loans**: Borrow more than your collateral based on your trusted "Trust Score".
- **Modern Glassmorphic UI**: High-impact aesthetic built with Next.js, Vanta.js, and Framer Motion.

## How Trust Uses Zero-Knowledge Identity (ZKID)

Trust is built around two core primitives that together create a 
privacy-preserving, Sybil-resistant lending protocol — World ID 
and Soulbound Tokens. Here is exactly how each one works and why 
it matters.

---

### World ID — Proof of Unique Humanity

**The Problem:**
In undercollateralized lending, the biggest attack vector is Sybil 
attacks — one person creating multiple wallets, borrowing from each, 
and never repaying. On a public blockchain, wallets are free and 
anonymous, making this trivially easy without identity verification.

**How Trust Solves It:**
Trust integrates Worldcoin's World ID, a zero-knowledge identity 
protocol that proves a user is a unique human without revealing who 
they are. When a user registers on Trust, they verify with World ID 
which generates a ZK proof (using Groth16 under the hood) and 
produces a **nullifier hash** — a unique cryptographic identifier 
tied to their identity.

This nullifier is:
- Stored permanently in the `LoanManager` smart contract on 
  HashKey Chain
- Checked on every loan application
- Impossible to fake or reuse with a different wallet

```solidity
// LoanManager.sol
mapping(bytes32 => bool) public usedNullifiers;

function applyForLoan(uint256 amount, bytes32 nullifier) external {
    require(!usedNullifiers[nullifier], "Identity already used");
    usedNullifiers[nullifier] = true;
    // issue loan...
}
```

**The Result:**
Even if an attacker creates 100 different wallets, they will always 
produce the same nullifier from their World ID. The contract rejects 
any second attempt at the database level (unique constraint in 
Supabase) AND at the smart contract level (on-chain nullifier 
mapping). One human = one loan eligibility. No exceptions.

This is zero-knowledge in practice — the contract never learns who 
the user is, only that they are a unique, verified human who has not 
borrowed before.

---

### HashKey KYC SBT — On-Chain Compliance & Tier Access

**The Problem:**
While World ID proves humanity, institutional and high-tier lending pools require regulatory compliance (KYC). Relying on off-chain Web2 KYC providers forces users to hand over sensitive documents to lenders, breaking the privacy narrative.

**How Trust Solves It:**
Trust natively integrates with **HashKey Chain's KYC SBT protocol**. We implemented a direct Web3 flow where users mint their KYC verification as a Soulbound Token directly to their wallet via an on-chain transaction (`requestKyc()`). 

Once minted, the Trust `LoanManager` passively reads the user's KYC status (`isHuman()`, `getKycInfo()`) directly from the HashKey network. No personal data touches our servers—the smart contract simply confirms the cryptography.

---

### Trust Loan SBTs — On-Chain Credit History

**The Problem:**
Traditional credit scoring relies on centralized bureaus that store 
and sell your financial history. DeFi has no equivalent — wallets 
have no memory, and there is no privacy-preserving way to prove past 
financial behaviour on-chain.

**How Trust Solves It:**
Every time a borrower successfully repays a loan on HashKey Chain, 
Trust automatically mints a **Soulbound Token (SBT)** to their 
wallet. SBTs are non-transferable ERC-721 tokens — they cannot be 
sold, sent, or faked. They are permanently bound to the wallet that 
earned them.

Each SBT stores:
```solidity
struct SBTMetadata {
    address borrower;
    uint256 loanAmount;
    uint8 tier;        // 1=Bronze, 2=Silver, 3=Gold
    uint256 repaidAt;  // timestamp of repayment
}
```

**SBTs Power the Tier System:**
The number of SBTs a wallet holds directly determines its borrowing 
power — no human decision, no opaque criteria, just verifiable 
on-chain history.

| Tier   | SBTs Required | Max Loan  | APR   |
|--------|--------------|-----------|-------|
| Bronze | 0 SBTs       | 0.02 HSK  | 18.5% |
| Silver | 1+ SBTs      | 0.05 HSK  | 12%   |
| Gold   | 3+ SBTs      | 0.10 HSK  | 8.5%  |

The LoanManager reads the borrower's SBT count directly from the 
LoanSBT contract at loan application time — no off-chain oracle, 
no trusted intermediary.

```solidity
function _getTierForUser(address user) internal view returns (Tier) {
    uint256 sbtCount = sbtContract.getUserSBTCount(user);
    if (sbtCount >= 3) return Tier.Gold;
    if (sbtCount >= 1) return Tier.Silver;
    return Tier.Bronze;
}
```

**The Result:**
A borrower builds a verifiable, privacy-preserving credit history 
entirely on HashKey Chain. No bank. No bureau. No personal data 
exposed. Just a wallet address and the SBTs it has earned through 
honest repayment.

---

### How World ID and SBTs Work Together

By combining World ID and SBTs, Trust creates a fully trustless credit system. World ID ensures that the borrower is a unique, real human being, preventing Sybil attacks and ensuring accountability. Once their unique humanity is proven, the SBT system tracks their individual financial reputation over time. Together, they allow the protocol to offer undercollateralized loans securely—because while the borrower's identity is mathematically hidden, their unique personhood and repayment reliability are cryptographically guaranteed on-chain.

---

### Custom ZK Circuits — Hybrid Integration System

**The Problem:**
While smart contracts natively execute logic transparently, checking someone's credit history directly on-chain exposes their entire financial risk profile to the public. If the contract calculates the score, everyone can see it. 

**How Trust Solves It: The Hybrid ZK Architecture**
Trust uses custom Zero-Knowledge circuits (`credit_score.circom` and `loan_eligibility.circom`) to calculate eligibility **client-side** in the browser. We employ a **Hybrid Integration Architecture** to prevent breaking changes while utilizing the privacy-preserving features of ZK cryptography:

#### 1. The Old Way (Transparent Execution, Optional Fallback)
If ZK proofs cannot be generated via the UI, the dApp natively asks the `LoanSBT` contract "How many SBTs does this user have?" and publicly calculates eligibility via the traditional `applyForLoan` method. While functional, it exposes exact balances on the public ledger.

#### 2. The New Way (Zero-Knowledge Privacy)
- **Local Computation:** When a user applies for a loan, the Next.js frontend downloads the compiled WebAssembly (`.wasm`) circuit. The browser pulls the user's exact SBT count and total repaid history, generating a random cryptographic `salt`.
- **The "Secret" Proof:** `snarkjs` crunches the numbers locally and spits out a Groth16 ZK Proof. The proof mathematically guarantees: *"This user has enough SBTs for this tier"*, without revealing exactly how many they have.
- **Instant Verification:** The frontend sends this proof to the new `applyForLoanWithZK` function on the smart contract. The `LoanManager` feeds the proof into the strictly compiled `Groth16Verifier` smart contract, which instantly confirms it is mathematically sound.
- **Privacy Achieved:** The smart contract approves the loan *without ever checking the user's SBT balance directly*. The blockchain strictly logs the proof and an obscure `identityCommitment` hash. The browser acts as the privacy engine, and the smart contract simply validates that the browser didn't cheat.

---

## Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Vanta.js](https://vanta.com/), [Supabase](https://supabase.com/), [Privy](https://privy.io/).
- **Blockchain**: [HashKey Chain](https://www.hashkey.id/), [Hardhat](https://hardhat.org/), [Ethers.js](https://docs.ethers.org/v6/).
- **Identity & ZK**: [World ID (IDKit)](https://worldcoin.org/world-id), [SnarkJS](https://github.com/iden3/snarkjs).
- **Automation**: [Telegraf](https://telegraf.js.org/) (Telegram Bot), [Node-Cron](https://www.npmjs.com/package/node-cron).

## Project Structure
```text
├── contracts/        # Solidity smart contracts (LoanManager, LoanSBT, Faucet)
├── frontend/         # Next.js web application
├── bot/              # Telegram notification & task automation bot
├── circuits/         # Circom ZK circuits for private credit scoring & loan eligibility
├── schema.sql        # Database schema
└── README.md         # Project entry point
```

## Smart Contracts (HashKey Testnet)
- **[Faucet](./contracts/contracts/Faucet.sol)**: [`0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A`](https://testnet-explorer.hsk.xyz/address/0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A)
  - *Function*: Provides testnet HSK to users' newly created Privy embedded wallets so they can pay for gas and the 10% loan collateral. Integrates a strict cooldown mechanism to prevent farming.
- **[MockKycSBT](./contracts/contracts/MockKycSBT.sol)**: [`0x9957a43088C530cD23659ecc092A4a3367d6a328`](https://testnet-explorer.hsk.xyz/address/0x9957a43088C530cD23659ecc092A4a3367d6a328)
  - *Function*: A complete implementation of the official HashKey KYC SBT standard (`IKycSBT`). It allows users to mint their KYC verifiable credentials securely on-chain for the duration of the hackathon, providing seamless access to higher-tier loan limits.
- **[LoanSBT](./contracts/contracts/LoanSBT.sol)**: [`0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74`](https://testnet-explorer.hsk.xyz/address/0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74)
  - *Function*: An ERC-721 non-transferable token contract. It mints Trust Protocol's native Soul-Bound Tokens to borrowers when they successfully repay their loans, serving as their permanent, immutable on-chain credit history.
- **[LoanManager](./contracts/contracts/LoanManager.sol)**: [`0x7b906c775dAabBFE04Ff7452178CC5BeDFaEb2A7`](https://testnet-explorer.hsk.xyz/address/0x7b906c775dAabBFE04Ff7452178CC5BeDFaEb2A7)
  - *Function*: The core protocol logic. It handles WorldID nullifier verification, verifies the user's HashKey KYC SBT status, locks collateral, disburses loan funds, processes repayments, and dynamically calculates allowed borrowing tiers based on Trust SBT reputation.

## Database Schema
We rely on Supabase for off-chain indexing and syncing. The full relational schema can be found in the [`schema.sql`](./schema.sql) file located at the root of the project.

Key tables:
- **`users`**: Manages unique user identity combining Privy UUIDs and WorldID nullifier hashes.
- **`loans`**: Contains persistent status configuration of lending tiers, loan amounts, and lifecycle events (Active/Repaid/Defaulted).
- **`transactions`**: Historical ledger tracking borrow and repay off-chain metadata.

## Telegram Bot
Start up the Telegram Bot to get localized transaction notifications and task updates here: 
**[Trust Protocol Telegram Bot (Render)](https://trust-protocol-rtb0.onrender.com/)** *(Wakes the bot server up)* and interact directly on Telegram: **[@Tru3t_Bot](https://t.me/Tru3t_Bot)**

## User Workflow: Step-by-Step
1. **Account Creation & Login**:
   - The user visits the application and logs in using their Google account via **Privy**.
   - Privy provisions an **Embedded Wallet** in the background, securing a non-custodial Web3 wallet to their Google login without requiring MetaMask.
2. **Proof of Personhood (World ID)**:
   - The user proceeds to the **Zero-Knowledge Proof Verification** stage using **World ID**.
   - They generate a ZK Proof on their device verifying they are a unique human. This unlocks the initial "Bronze Tier" lending limits while keeping their real identity totally hidden.
3. **HashKey KYC Minting (On-Chain Compliance)**:
   - The user navigates to the ZK Identity Proofs dashboard and clicks **Mint KYC On-Chain**.
   - Their embedded wallet triggers a native transaction to the HashKey KYC contract. The KYC SBT is permanently minted to their address, validating their compliance level on-chain without exposing off-chain identity data to the protocol.
4. **Funding the Wallet (Gas Setup)**:
   - To interact with the system, the Embedded Wallet needs gas. Users can claim free testnet HSK via the integrated **Faucet** directly on the dashboard.
   - *Failure Condition*: If the wallet entirely lacks funds for the base gas fee before being able to interact (e.g., funding it initially), transactions requested via Privy will fail because they cannot pay the base gas fee.
5. **Borrowing Funds**:
   - The user selects an undercollateralized loan tier (e.g., Bronze Tier). The `LoanManager` strictly validates their World ID nullifier, their current Trust Protocol SBT balance, and their HashKey KYC compliance.
   - They must provide a mandatory `10%` collateral to receive the main loan value.
   - If successful, the `LoanManager` smart contract locks the 10% collateral and transfers the requested HSK straight into the user's Privy embedded wallet.
6. **Repaying & Building Reputation**:
   - Before the deadline (e.g., 30 Days), the user repays the total borrowed amount along with standard protocol fees.
   - Upon successful repayment, the collateral is automatically released back to the user.
   - Crucially, the local `LoanSBT` contract mints a **Trust Soul-Bound Token (SBT)** to their wallet. Accumulating Trust SBTs proves good credit history on-chain and grants access to higher borrowing tiers (Silver, Gold) with substantially larger loan limits.

## Getting Started

### 1. Smart Contracts
```bash
cd contracts
npm install
# Configure your .env (HASHKEY_TESTNET_RPC_URL, PRIVATE_KEY)
npx hardhat compile
npx hardhat ignition deploy ignition/modules/deploy.ts --network hashkey_testnet
```

### 2. Frontend
```bash
cd frontend
bun install
# Configure .env.local (NEXT_PUBLIC_WORLD_ID_APP_ID, SUPABASE_KEY, etc.)
bun dev
```

### 3. Bot
```bash
cd bot
npm install
# Configure .env (TELEGRAM_BOT_TOKEN, SUPABASE_URL)
npm start
```

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built for the HashKey Hackathon by **Trust Team**.
