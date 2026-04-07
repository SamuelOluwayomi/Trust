# Trust: ZK-Powered Undercollateralized Lending

![Trust Header](https://img.shields.io/badge/Blockchain-HashKey%20Chain-6D28D9?style=for-the-badge)
![Identity](https://img.shields.io/badge/Identity-WorldID-black?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Hardhat%20|%20Supabase-5B21B6?style=for-the-badge)

**Trust** is a decentralized, undercollateralized lending protocol built on the **HashKey Chain**. It leverages **World ID** for identity verification and **Zero-Knowledge Proofs (ZKP)** to enable secure, privacy-preserving loans based on on-chain credit scores (Soul-Bound Tokens).

## Vision
DeFi lending currently requires massive overcollateralization, which is capital inefficient. **Trust** solves this by linking real-world identity (via World ID) and on-chain behavior (SBTs) to provide trustworthy borrowers with undercollateralized loans, unlocking a more inclusive financial ecosystem.

## Key Features
- **World ID Verification**: Sybil-resistant, private identity verification to ensure "One Person, One Account".
- **Credit SBTs**: Soul-Bound Tokens that represent a user's creditworthiness and repayment history.
- **ZK-Lending**: Privacy-preserving proof of credit history without revealing sensitive financial details.
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

### Soulbound Tokens — On-Chain Credit History

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
├── circuits/         # [WIP] Circom ZK circuits for private credit scoring
├── schema.sql        # Database schema
└── README.md         # Project entry point
```

## Smart Contracts (HashKey Testnet)
- **Faucet**: [`0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A`](https://testnet-explorer.hsk.xyz/address/0xCaB6c9B74b202cc7E2c8A56078Bd87a09dd5038A)
  - *Function*: Provides testnet HSK to users' newly created Privy embedded wallets so they can pay for gas and the 10% loan collateral. Integrates a strict cooldown mechanism to prevent farming.
- **LoanSBT**: [`0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74`](https://testnet-explorer.hsk.xyz/address/0x27D6797BE55D0b5976aBF624A9EDC35D0604Ce74)
  - *Function*: An ERC-721 non-transferable token contract. It mints Soul-Bound Tokens to borrowers when they successfully repay their loans, serving as their permanent, immutable on-chain credit history.
- **LoanManager**: [`0x1f093A6C32e908e41A8f884581FE7443A403736d`](https://testnet-explorer.hsk.xyz/address/0x1f093A6C32e908e41A8f884581FE7443A403736d)
  - *Function*: The core protocol logic. It handles WorldID nullifier verification, locks collateral, disburses loan funds, processes repayments, and natively integrates with LoanSBT to dynamically calculate allowed borrowing tiers based on user reputation.

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
2. **Proof of Personhood**:
   - The user proceeds to the **Zero-Knowledge Proof Verification** stage using **World ID**.
   - They generate a ZK Proof on their device verifying they are a unique human. This unlocks the initial "Bronze Tier" lending limits while keeping their real identity totally hidden.
3. **Funding the Wallet (Gas Setup)**:
   - To interact with the system, the Embedded Wallet needs gas. Users can claim free testnet HSK via the integrated **Faucet** directly on the dashboard.
   - *Failure Condition*: If the wallet entirely lacks funds for the base gas fee before being able to interact (e.g., funding it initially), transactions requested via Privy will fail because they cannot pay the base gas fee.
4. **Borrowing Funds**:
   - The user selects an undercollateralized loan tier (e.g., Bronze Tier).
   - They must provide a mandatory `10%` collateral to receive the main loan value.
   - *Failure Condition*: If the user's wallet amount is less than the required `10%` collateral + the `gas fee` required to execute the transaction, the smart contract interaction will revert and fail.
   - If successful, the `LoanManager` smart contract locks the 10% collateral and transfers the requested HSK straight into the user's Privy embedded wallet.
5. **Repaying & Building Reputation**:
   - Before the deadline (e.g., 30 Days), the user repays the total borrowed amount along with standard protocol fees.
   - Upon successful repayment, the collateral is automatically released back to the user.
   - Crucially, the `LoanSBT` contract mints a **Soul-Bound Token (SBT)** to their wallet. Accumulating SBTs proves good credit history on-chain and grants access to higher borrowing tiers (Silver, Gold) with substantially larger loan limits.

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
