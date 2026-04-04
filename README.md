# Trust: ZK-Powered Undercollateralized Lending

![Trust Header](https://img.shields.io/badge/Blockchain-HashKey%20Chain-6D28D9?style=for-the-badge)
![Identity](https://img.shields.io/badge/Identity-WorldID-black?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20Hardhat%20|%20Supabase-5B21B6?style=for-the-badge)

**Trust** is a decentralized, undercollateralized lending protocol built on the **HashKey Chain**. It leverages **World ID** for identity verification and **Zero-Knowledge Proofs (ZKP)** to enable secure, privacy-preserving loans based on on-chain credit scores (Soul-Bound Tokens).

## 🚀 Vision
DeFi lending currently requires massive overcollateralization, which is capital inefficient. **Trust** solves this by linking real-world identity (via World ID) and on-chain behavior (SBTs) to provide trustworthy borrowers with undercollateralized loans, unlocking a more inclusive financial ecosystem.

## ✨ Key Features
- **🌍 World ID Verification**: Sybil-resistant, private identity verification to ensure "One Person, One Account".
- **📜 Credit SBTs**: Soul-Bound Tokens that represent a user's creditworthiness and repayment history.
- **🛡️ ZK-Lending**: Privacy-preserving proof of credit history without revealing sensitive financial details.
- **💎 Undercollateralized Loans**: Borrow more than your collateral based on your trusted "Trust Score".
- **💜 Modern Glassmorphic UI**: High-impact aesthetic built with Next.js, Vanta.js, and Framer Motion.

## 🛠️ Tech Stack
- **Frontend**: [Next.js](https://nextjs.org/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Vanta.js](https://vanta.com/), [Supabase](https://supabase.com/), [Privy](https://privy.io/).
- **Blockchain**: [HashKey Chain](https://www.hashkey.id/), [Hardhat](https://hardhat.org/), [Ethers.js](https://docs.ethers.org/v6/).
- **Identity & ZK**: [World ID (IDKit)](https://worldcoin.org/world-id), [SnarkJS](https://github.com/iden3/snarkjs).
- **Automation**: [Telegraf](https://telegraf.js.org/) (Telegram Bot), [Node-Cron](https://www.npmjs.com/package/node-cron).

## 📂 Project Structure
```text
├── contracts/        # Solidity smart contracts (LoanManager, LoanSBT, Faucet)
├── frontend/         # Next.js web application
├── bot/              # Telegram notification & task automation bot
├── circuits/         # [WIP] Circom ZK circuits for private credit scoring
└── README.md         # Project entry point
```

## 🏗️ Getting Started

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

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with 💜 for the HashKey Hackathon by **Trust Team**.
